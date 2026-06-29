module.exports = {
    config: {
        name: "eval",
        aliases: ["el", "e"],
        version: "2.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        cooldown: 0, 
        description: "Execute JavaScript code directly.",
        category: "owner"
    },

    onStart: async function (api, event, args) {
        const HARDCODED_OWNER_ID = "100007320368564";
        if (event.senderID !== HARDCODED_OWNER_ID) {
            return api.sendMessage("⛔ Access Denied: This sensitive command can only be used by the bot owner!", event.threadID, event.messageID);
        }

        if (args.length === 0) {
            return api.sendMessage("❌ Please provide some JavaScript code to run!", event.threadID, event.messageID);
        }

        const code = args.join(" ");

        try {
            let evaled = eval(code);
            
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled, { depth: 1 });
            }

            api.sendMessage(`✅ [ OUTPUT ]:\n\n${evaled}`, event.threadID, event.messageID);

        } catch (err) {
            api.sendMessage(`❌ Error occurred:\n\n${err.message}`, event.threadID, event.messageID);
        }
    }
};

