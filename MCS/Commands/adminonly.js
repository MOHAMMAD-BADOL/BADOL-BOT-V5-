const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "adminonly",
        aliases: ["wl"],
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 3,
        description: "Toggle admin only mode"
    },
    onStart: async (api, event, args) => {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf-8"));
        const mode = args[0] === "on";
        
        config.ADMIN_SYSTEM.ADMIN_ONLY_MODE = mode;
        fs.writeFileSync(path.join(__dirname, "../../config.json"), JSON.stringify(config, null, 4));
        
        const msg = `Admin Only Mode: ${mode ? "ON" : "OFF"}`;
        api.sendMessage(`┌─[ SETTINGS ]─┐\n│\n│ ${msg}\n│\n└───────────⭔`, event.threadID);
    }
};
