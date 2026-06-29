const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "approvegclist",
        version: "1.1.2",
        credit: "MOHAMMAD BADOL",
        role: 1,
        description: "List all approved groups with names from API",
        prefix: true,
        aliases: ["agl"],
        cooldown: 5
    },

    onStart: async (api, event, args) => {
        const configPath = path.join(__dirname, "../../config.json");
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const approvedThreads = config.APPROVAL_SYSTEM.APPROVED_THREADS;

        let msg = "━━━━━━━━━━━━━━━━━━━━━━\n   📊 APPROVED GROUPS \n━━━━━━━━━━━━━━━━━━━━━━\n\n";

        if (approvedThreads.length === 0) {
            msg += "No groups are approved.";
        } else {
            for (let i = 0; i < approvedThreads.length; i++) {
                const threadID = approvedThreads[i];
                
                try {
                    const info = await api.getThreadInfo(threadID);
                    const name = info.threadName || "Unnamed Group";
                    msg += `✅ ${name}\n   🆔 ${threadID}\n\n`;
                } catch (e) {
                    msg += `⚠️ Group not found or access denied\n   🆔 ${threadID}\n\n`;
                }
            }
        }

        msg += "━━━━━━━━━━━━━━━━━━━━━━\n   𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞\n━━━━━━━━━━━━━━━━━━━━━━";
        api.sendMessage(msg, event.threadID);
    }
};
