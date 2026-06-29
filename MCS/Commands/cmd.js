const fs = require("fs-extra");
const path = require("path");

function box(title, content) {
    return `╭─[ ${title} ]─╮\n${content}\n╰───────────────╯`;
}

function validateAndLoadCommand(filePath, fileName) {
    try {
        if (require.cache[require.resolve(filePath)]) {
            delete require.cache[require.resolve(filePath)];
        }
        
        const cmd = require(filePath);

        if (!cmd.config || typeof cmd.config !== "object") {
            throw new Error("Config missing or not an object");
        }
        if (!cmd.config.name) {
            throw new Error("Config name missing");
        }
        if (!cmd.onStart || typeof cmd.onStart !== "function") {
            throw new Error("onStart function missing");
        }
        if (cmd.config.credit !== "MOHAMMAD BADOL") {
            throw new Error(`Credit lock violation: ${cmd.config.credit || "Unknown"}`);
        }

        global.commands.set(cmd.config.name, cmd);
        return { success: true, name: cmd.config.name };

    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return { success: false, error: error.message };
    }
}

module.exports = {
    config: {
        name: "cmd",
        aliases: ["command"],
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 0,
        description: "Command Management System"
    },

    onReaction: async function (api, event) {
        if (event.reaction !== "💚") return;
        const confirmKey = `cmd_confirm_${event.messageID}`;
        const data = global.msgCache.get(confirmKey);
        if (!data || event.userID !== data.senderID) return;

        try {
            await api.unsendMessage(event.messageID);
            await fs.writeFileSync(data.filePath, data.code);
            
            const result = validateAndLoadCommand(data.filePath, data.fileName);
            
            if (result.success) {
                api.sendMessage(box("✅ OVERWRITE DONE", `│ File: ${data.fileName}\n│ Status: Updated & Loaded`), event.threadID);
            } else {
                api.sendMessage(box("❌ ERROR", `│ ${result.error}`), event.threadID);
            }
            
            global.msgCache.delete(confirmKey);
        } catch (e) {
            api.sendMessage(box("❌ ERROR", `│ ${e.message}`), event.threadID);
        }
    },

    onStart: async function (api, event, args) {
        const { threadID, senderID, messageID } = event;
        const cmdPath = __dirname;
        const action = args[0]?.toLowerCase();

        if (!action) {
            return api.sendMessage(box("⚙️ CMD MANAGER",
                "│ /cmd load <name>\n" +
                "│ /cmd unload <name>\n" +
                "│ /cmd loadall\n" +
                "│ /cmd del <name>\n" +
                "│ /cmd add <name.js> <code>\n" +
                "│ /cmd list"
            ), threadID);
        }

        try {
            switch (action) {
                case "load": {
                    if (!args[1]) return api.sendMessage(box("❌ ERROR", "│ Syntax: /cmd load <name>"), threadID);
                    const name = args[1].replace(".js", "");
                    const p = path.join(cmdPath, name + ".js");
                    if (!fs.existsSync(p)) return api.sendMessage(box("❌ ERROR", `│ File not found: ${name}.js`), threadID);
                    
                    const result = validateAndLoadCommand(p, name + ".js");
                    if (result.success) {
                        return api.sendMessage(box("✅ LOAD SUCCESS", `│ Loaded: ${result.name}`), threadID);
                    } else {
                        return api.sendMessage(box("❌ ERROR", `│ ${result.error}`), threadID);
                    }
                }

                case "unload": {
                    if (!args[1]) return api.sendMessage(box("❌ ERROR", "│ Syntax: /cmd unload <name>"), threadID);
                    const name = args[1].replace(".js", "");
                    if (!global.commands.has(name)) return api.sendMessage(box("❌ ERROR", `│ Command not loaded: ${name}`), threadID);
                    global.commands.delete(name);
                    return api.sendMessage(box("⚠️ UNLOAD SUCCESS", `│ Inactive: ${name}`), threadID);
                }

                case "loadall": {
                    global.loadCommands();
                    return api.sendMessage(box("🚀 LOAD ALL", `│ Total: ${global.commands.size} commands`), threadID);
                }

                case "del": {
                    if (!args[1]) return api.sendMessage(box("❌ ERROR", "│ Syntax: /cmd del <name>"), threadID);
                    const name = args[1].replace(".js", "");
                    const fp = path.join(cmdPath, name + ".js");

                    if (!fs.existsSync(fp)) {
                        return api.sendMessage(box("❌ ERROR", `│ File not found: ${name}.js`), threadID);
                    }

      

