const fs = require('fs');
const axios = require('axios');
const path = require('path');
const db = require("../../Database"); // রুট ফোল্ডারের Database.js

module.exports.config = { 
    name: "monitor", 
    credit: "BADOL" 
};

module.exports.onEvent = async (api, event) => {
    // ১. ডাটা চেক (এখন Database.js থেকে আসবে)
    const threadData = await db.getData(event.threadID, 'threads');
    if (!threadData) return;

    // ২. এন্টি আনসেন্ড (ফুল রিকভারি সিস্টেম)
    if (event.logMessageType === "log:message_unsend") {
        const deletedMsg = global.msgCache.get(event.messageID);
        if (deletedMsg) {
            try {
                let userInfo = await api.getUserInfo(deletedMsg.senderID);
                let name = userInfo[deletedMsg.senderID]?.name || "কেউ";
                
                let msg = `🚫 ${name} একটি মেসেজ ডিলিট করেছেন! 🤣\n`;
                if (deletedMsg.body) msg += `\n📝 টেক্সট: ${deletedMsg.body}`;
                
                let atts = [];
                if (deletedMsg.attachments && deletedMsg.attachments.length > 0) {
                    for (let i of deletedMsg.attachments) {
                        try {
                            let url = i.url || i.largePreviewUrl || i.previewUrl;
                            if (!url) continue;
                            let ext = i.type == "photo" ? "png" : i.type == "video" ? "mp4" : i.type == "audio" ? "mp3" : "gif";
                            // ক্যাশ ফোল্ডারের সঠিক পাথ
                            let cachePath = path.join(__dirname, "../../cache");
                            let filePath = path.join(cachePath, `${Date.now()}.${ext}`);
                            
                            if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
                            
                            let res = await axios.get(url, { responseType: "arraybuffer" });
                            fs.writeFileSync(filePath, Buffer.from(res.data));
                            atts.push(fs.createReadStream(filePath));
                        } catch (e) { console.log("Attachment Download Error:", e); }
                    }
                }
                
                api.sendMessage({ body: msg, attachment: atts }, event.threadID, () => {
                    atts.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
                });
            } catch (e) { console.error("Unsend Error:", e); }
        }
    }

    // ৩. নিকনেম চেঞ্জ
    if (event.logMessageType === "log:user-nickname") {
        const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
        const target = (await api.getUserInfo(event.logMessageData.participant_id))[event.logMessageData.participant_id]?.name || "কেউ";
        api.sendMessage(`📝 ${actor} পরিবর্তন করেছেন ${target} এর নিকনেম। নতুন নাম: ${event.logMessageData.nickname}`, event.threadID);
    }

    // ৪. কল ইনফরমেশন
    if (event.logMessageType === "log:thread-call") {
        const log = event.logMessageData;
        if (log.call_status === "started" || log.event === "group_call_started") api.sendMessage(`📞 কল শুরু হয়েছে।`, event.threadID);
        else if (log.call_status === "ended" || log.event === "group_call_ended") api.sendMessage(`📞 কল শেষ হয়েছে।`, event.threadID);
    }

    // ৫. এন্টি গ্রুপ ইনফো (নাম রিসেট)
    if (event.logMessageType === "log:thread-name") {
        const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
        const oldName = threadData.name || "BADOL GROUP";
        api.setTitle(oldName, event.threadID);
        api.sendMessage(`⚠️ ${actor} গ্রুপের নাম পরিবর্তন করে "${event.logMessageData.name}" করেছিলেন, আমি তা আবার "${oldName}" করে দিয়েছি!`, event.threadID);
    }

    // ৬. অ্যাডমিন চেঞ্জ (ফিক্সড)
    if (event.logMessageType === "log:thread-admins") {
        const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
        const targetID = event.logMessageData.TARGET_ID;
        const target = targetID ? (await api.getUserInfo(targetID))[targetID]?.name : "একজন";
        const isAdd = (event.logMessageData.ADMIN_EVENT === 'add' || event.logMessageData.event === 'add_admin');
        const action = isAdd ? "অ্যাডমিন বানিয়েছেন" : "অ্যাডমিন থেকে সরিয়ে দিয়েছেন";
        api.sendMessage(`👑 ${actor}, ${target} কে গ্রুপে ${action}।`, event.threadID);
    }
};
