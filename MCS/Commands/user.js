const fs = require("fs");
const path = require("path");

function box(title, content) {
    return `╭─── [ ${title} ] ───❍\n${content.split('\n').map(line => `│ ${line}`).join('\n')}\n╰──────────────────────❍`;
}

module.exports = {
    config: {
        name: "user",
        version: "1.0.0",
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 3,
        description: "Manage banned users"
    },

    onStart: async (api, event, args) => {
        const configPath = path.join(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        
        const action = args[0]?.toLowerCase();
        const subAction = args[1]?.toLowerCase();
        const targetID = event.messageReply ? event.messageReply.senderID : (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : args[1]);

        let name = "Unknown User";
        try {
            const info = await api.getUserInfo(targetID);
            if (info && info[targetID]) name = info[targetID].name;
        } catch (e) {}

        if (!config.ACCESS_CONTROL) config.ACCESS_CONTROL = { BANNED_USERS: [] };

        if (action === "ban" && subAction === "list") {
            const banned = config.ACCESS_CONTROL.BANNED_USERS || [];
            if (banned.length === 0) return api.sendMessage(box("BAN LIST", "No users found."), event.threadID);
            
            let msg = `Total Banned: ${banned.length}\n\n`;
            for (let i = 0; i < banned.length; i++) {
                let bName = "Unknown User";
                try {
                    const info = await api.getUserInfo(banned[i]);
                    if (info && info[banned[i]]) bName = info[banned[i]].name;
                } catch (e) {}
                msg += `${i + 1}. ${bName}\n   ID: ${banned[i]}\n`;
            }
            return api.sendMessage(box("BAN LIST", msg.trim()), event.threadID);
        }

        if (action === "ban") {
            if (!targetID || isNaN(targetID)) return api.sendMessage(box("INVALID FORMAT", "Correct use:\n/user ban [Reply/Mention/UID]"), event.threadID);
            if (config.ACCESS_CONTROL.BANNED_USERS.includes(targetID)) return api.sendMessage(box("WARNING", "User already banned."), event.threadID);
            
            config.ACCESS_CONTROL.BANNED_USERS.push(targetID);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            if (typeof global.reloadConfig === "function") global.reloadConfig();
            
            return api.sendMessage(box("SUCCESS", `Name: ${name}\nID: ${targetID}\nStatus: Banned.`), event.threadID);
        }

        if (action === "unban") {
            if (!targetID || isNaN(targetID)) return api.sendMessage(box("INVALID FORMAT", "Correct use:\n/user unban [Reply/Mention/UID]"), event.threadID);
            if (!config.ACCESS_CONTROL.BANNED_USERS.includes(targetID)) return api.sendMessage(box("WARNING", "User not in list."), event.threadID);
            
            config.ACCESS_CONTROL.BANNED_USERS = config.ACCESS_CONTROL.BANNED_USERS.filter(id => id !== targetID);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            if (typeof global.reloadConfig === "function") global.reloadConfig();
            
            return api.sendMessage(box("SUCCESS", `Name: ${name}\nID: ${targetID}\nStatus: Unbanned.`), event.threadID);
        }

        return api.sendMessage(box("BADOL-BOT-V5", "Available Commands:\n/user ban [Reply/Mention/UID]\n/user unban [Reply/Mention/UID]\n/user ban list"), event.threadID);
    }
};
