module.exports.config = {
    name: "tag",
    aliases: ["teg"],
    version: "1.0.4",
    credit: "MOHAMMAD BADOL",
    role: 0,
    prefix: true, 
    description: "mention users by letter or reply",
    category: "utility",
    usages: "[reply] or [letter]",
    cooldown: 5
};

module.exports.onStart = async function (api, event, args) {
    const { threadID, messageID, type, messageReply } = event;
    const botName = "🌸 BADOL-BOT-V5 🌸";

    // ১. অক্ষর বা শব্দ দিয়ে মেনশন
    if (args.length > 0) {
        const inputStr = args[0];
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const participants = threadInfo.userInfo;

            let mentions = [];
            let msg = `┌[${botName}]┐\n\n🔎 '${inputStr}' দিয়ে খুঁজে পাওয়া সদস্যবৃন্দ:\n\n`;

            for (let user of participants) {
                if (user.name && user.name.toLowerCase().includes(inputStr.toLowerCase())) {
                    mentions.push({ tag: user.name, id: user.id });
                    msg += `✨ @${user.name}\n`;
                }
            }

            if (mentions.length === 0) {
                return api.sendMessage(`┌[${botName}]┐\n\n❌ দুঃখিত, '${inputStr}' নামে কাউকে পাওয়া যায়নি।`, threadID, messageID);
            }

            msg += `\n└─═══[ ⚡ Total: ${mentions.length} ]═══─┘`;
            return api.sendMessage({ body: msg, mentions: mentions }, threadID, messageID);

        } catch (e) {
            return api.sendMessage(`┌[${botName}]┐\n\n❌ সিস্টেম এরর হয়েছে।`, threadID, messageID);
        }
    } 
    
    // ২. রিপ্লাই সিস্টেম
    else if (type === "message_reply" && messageReply) {
        try {
            const userID = messageReply.senderID;
            const userInfo = await api.getUserInfo(userID);
            const userName = userInfo[userID]?.name || "User";

            return api.sendMessage({
                body: `┌[${botName}]┐\n\n👤 ট্যাগ করা হলো: @${userName}`,
                mentions: [{ tag: `@${userName}`, id: userID }]
            }, threadID, messageID);
        } catch (e) {
            return api.sendMessage(`❌ ট্যাগ করা সম্ভব হয়নি।`, threadID, messageID);
        }
    } 
    
    else {
        return api.sendMessage(`┌[${botName}]┐\n\nব্যবহার বিধি:\n১. কাউকে ট্যাগ করতে রিপ্লাই দিন।\n২. নাম লিখে ট্যাগ করতে লিখুন: /tag [নাম/অক্ষর]`, threadID, messageID);
    }
};