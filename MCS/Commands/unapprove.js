const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "unapprove",
        version: "1.0.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        description: "Revoke approval from a group",
        prefix: true,
        aliases: ["unapv"],
        cooldown: 5
    },

    onStart: async (api, event, args) => {
        const threadID = args[0] || event.threadID;
        const configPath = path.join(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        const index = config.APPROVAL_SYSTEM.APPROVED_THREADS.indexOf(threadID);
        if (index === -1) {
            return api.sendMessage(`━━━━━━━━━━━━━━━━━━━━━━\n   ❌ ERROR \n━━━━━━━━━━━━━━━━━━━━━━\n\nThread ID '${threadID}' is not in the approved list.\n━━━━━━━━━━━━━━━━━━━━━━`, event.threadID);
        }

        config.APPROVAL_SYSTEM.APPROVED_THREADS.splice(index, 1);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        api.sendMessage(`━━━━━━━━━━━━━━━━━━━━━━\n   ✅ ACCESS REVOKED \n━━━━━━━━━━━━━━━━━━━━━━\n\nSuccessfully removed thread ID: ${threadID} from approved list.\n━━━━━━━━━━━━━━━━━━━━━━`, event.threadID);
    }
};
