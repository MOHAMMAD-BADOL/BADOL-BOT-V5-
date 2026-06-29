module.exports = {
    config: {
        name: "unsend",
        aliases: ["delete", "del", "uns"],
        version: "1.0.4",
        role: 0,
        credit: "MOHAMMAD BADOL",
        description: "Unsend bot message",
        prefix: true, 
        cooldown: 1 
    },

    onStart: async function (api, event, args) {
        const { threadID, messageID, type, messageReply } = event;

        if (type !== "message_reply" || !messageReply) {
            return api.sendMessage(
                "╭─❍ 「 NOTICE 」\n" +
                "│ ⚠️ Reply to the bot's\n" +
                "│ message to unsend it.\n" +
                "╰────────────────❍", 
                threadID, 
                messageID
            );
        }

        if (messageReply.senderID !== api.getCurrentUserID()) {
            return api.sendMessage(
                "╭─❍ 「 ERROR 」\n" +
                "│ ❌ Only my own messages\n" +
                "│ can be unsent.\n" +
                "╰────────────────❍", 
                threadID, 
                messageID
            );
        }

        return api.unsendMessage(messageReply.messageID, (err) => {
            if (err) {
                return api.sendMessage(
                    "╭─❍ 「 FAILED 」\n" +
                    "│ 🔴 Action failed.\n" +
                    "│ Message may be expired.\n" +
                    "╰────────────────❍", 
                    threadID, 
                    messageID
                );
            }
        });
    }
};

