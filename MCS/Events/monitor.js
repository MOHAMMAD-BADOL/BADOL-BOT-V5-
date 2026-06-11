/ev add monitor.js const fs = require('fs');
const axios = require('axios');
const path = require('path');
const db = require("../../Database"); // রুট ফোল্ডারের Database.js

module.exports.config = { 
    name: "monitor", 
    credit: "MOHAMMAD BADOL" 
};

module.exports.onEvent = async (api, event) => {
    // ১. ডাটা চেক
    const threadData = await db.getData(event.threadID, 'threads');
    if (!threadData) return;

    // ডাটাবেজের সেটিংস অবজেক্ট (ডাটা না থাকলে ডিফল্ট True)
    const settings = threadData.data || { resend: true, anti: true, calllog: true };

    // ২. নিকনেম চেঞ্জ
    if (event.logMessageType === "log:user-nickname") {
        if (settings.anti === false) return; // সেটিংস অফ থাকলে কাজ করবে না

        const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
        const target = (await api.getUserInfo(event.logMessageData.participant_id))[event.logMessageData.participant_id]?.name || "কেউ";
        api.sendMessage(`📝 ${actor} পরিবর্তন করেছেন ${target} এর নিকনেম। নতুন নাম: ${event.logMessageData.nickname}`, event.threadID);
    }

    // ৩. কল ইনফরমেশন
    if (event.logMessageType === "log:thread-call") {
        if (settings.calllog === false) return; // সেটিংস অফ থাকলে কাজ করবে না

        const log = event.logMessageData;
        if (log.call_status === "started" || log.event === "group_call_started") api.sendMessage(`📞 কল শুরু হয়েছে।`, event.threadID);
        else if (log.call_status === "ended" || log.event === "group_call_ended") api.sendMessage(`📞 কল শেষ হয়েছে।`, event.threadID);
    }

    // ৪. এন্টি গ্রুপ ইনফো (নাম রিসেট)
    if (event.logMessageType === "log:thread-name") {
        if (settings.anti === false) return; // সেটিংস অফ থাকলে কাজ করবে না

        const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
        const oldName = threadData.name || "BADOL GROUP";
        api.setTitle(oldName, event.threadID);
        api.sendMessage(`⚠️ ${actor} গ্রুপের নাম পরিবর্তন করে "${event.logMessageData.name}" করেছিলেন, আমি তা আবার "${oldName}" করে দিয়েছি!`, event.threadID);
    }

    // ৫. অ্যাডমিন চেঞ্জ
    if (event.logMessageType === "log:thread-admins") {
        if (settings.anti === false) return; // সেটিংস অফ থাকলে কাজ করবে না

        console.log("[ADMIN-EVENT] ====== DEBUG START ======");
        const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
        const targetID = event.logMessageData.target_id
                       || event.logMessageData.TARGET_ID
                       || event.logMessageData.participant_id
                       || event.logMessageData.participantId;

        if (!targetID) return console.log("[ADMIN-EVENT] ❌ No target ID found!");

        const target = targetID ? (await api.getUserInfo(targetID))[targetID]?.name : "একজন";

        const adminEvent = (event.logMessageData.admin_event
                          || event.logMessageData.ADMIN_EVENT
                          || event.logMessageData.event
                          || event.logMessageData.type
                          || "").toLowerCase();

        const isAdd = adminEvent === 'add'
                   || adminEvent === 'add_admin'
                   || adminEvent === 'promote'
                   || adminEvent === 'promote_to_admin'
                   || adminEvent.includes('add')
                   || adminEvent.includes('promote');

        const action = isAdd ? "অ্যাডমিন বানিয়েছেন" : "অ্যাডমিন থেকে সরিয়ে দিয়েছেন";
        api.sendMessage(`👑 ${actor}, ${target} কে গ্রুপে ${action}।`, event.threadID);
    }
};
