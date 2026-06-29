const ADMIN_GROUP_ID = "995583616625244"; 

module.exports = {
    config: {
        name: "call",
        version: "1.0.0",
        role: 0,
        credit: "MOHAMMAD BADOL",
        description: "Report an issue to the bot admin",
        category: "system",
        prefix: true,
        cooldown: 10
    },

    onStart: async function (api, event, args) {
        const { threadID, messageID, senderID } = event;
        const reason = args.join(" ");

        if (!reason) {
            return api.sendMessage(`┌─[ ERROR ]─┐\n│\n│ Please provide a reason.\n│ Ex: /call bot is lagging\n│\n└───────────⭔`, threadID, messageID);
        }

        try {
            const senderInfo = await api.getUserInfo(senderID);
            const senderName = senderInfo[senderID]?.name || "Unknown User";
            
            const threadInfo = await api.getThreadInfo(threadID);
            const threadName = threadInfo?.threadName || "Private Chat / Unknown Group";

            const reportMsg = `┌─[ NEW REPORT ]─┐\n│\n│ User: ${senderName}\n│ UID: ${senderID}\n│ Group: ${threadName}\n│ TID: ${threadID}\n│ Reason: ${reason}\n│\n└───────────⭔`;

            await api.sendMessage(reportMsg, ADMIN_GROUP_ID);

            return api.sendMessage(`┌─[ SUCCESS ]─┐\n│\n│ Report sent to admin successfully.\n│ You will get a reply soon.\n│\n└───────────⭔`, threadID, messageID);

        } catch (e) {
            return api.sendMessage(`┌─[ FAILED ]─┐\n│\n│ Failed to send report to admin.\n│\n└───────────⭔`, threadID, messageID);
        }
    }
};
