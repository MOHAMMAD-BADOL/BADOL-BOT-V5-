const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "config",
        version: "1.0.6",
        credit: "MOHAMMAD BADOL",
        role: 1,
        description: "bot config contole",
        prefix: true,
        aliases: ["cfg", "settings"],
        cooldown: 2
    },

    onStart: async (api, event, args) => {
        const configPath = path.join(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        const prefix = config.BOT_INFO?.PREFIX || "/";
        const mode = args[0]?.toLowerCase();
        const target = args[1]?.toLowerCase();
        const value = args[2];

        // ═══════════════════ [ 🛠️ CLEAN HELP MENU ] ═══════════════════
        if (!mode) {
            const helpMsg = 
`╭──────────────────╮
   ⚙️ 𝗕𝗔𝗗𝗢𝗟-𝗕𝗢𝗧 𝗩𝟱 𝗖𝗢𝗡𝗙𝗜𝗚 𝗠𝗘𝗡𝗨 ⚙️
╰──────────────────╯

╭━━━ [ 📊 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 ] ━━━📂
┃ 👉 ${prefix}config status
╰━━━━━━━━━━━━━━━━━━━👁️‍🗨️

╭━━━ [ 🔄 𝗧𝗢𝗚𝗚𝗟𝗘 𝗦𝗬𝗦𝗧𝗘𝗠 ] ━━━🎛️
┃ 👉 ${prefix}config toggle approval
┃ 👉 ${prefix}config toggle adminonly
┃ 👉 ${prefix}config toggle antiunsend
┃ 👉 ${prefix}config toggle antiout
╰━━━━━━━━━━━━━━━━━━━⚙️

╭━━━ [ 👥 𝗔𝗗𝗠𝗜𝗡 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧 ] ━━━👑
┃ 👉 ${prefix}config admin add [UID]
┃ 👉 ${prefix}config admin remove [UID]
╰━━━━━━━━━━━━━━━━━━━👤

╭━━━ [ ⛔ 𝗕𝗟𝗔𝗖𝗞𝗟𝗜𝗦𝗧 / 𝗕𝗔𝗡 ] ━━━🚫
┃ 👉 ${prefix}config ban user [UID]
┃ 👉 ${prefix}config ban thread [GID]
┃ 👉 ${prefix}config unban user [UID]
┃ 👉 ${prefix}config unban thread [GID]
╰━━━━━━━━━━━━━━━━━━━🔐`;
            
            return api.sendMessage(helpMsg, event.threadID, event.messageID);
        }

        // ═══════════════════ [ 📊 LIVE STATUS SYSTEM ] ═══════════════════
        if (mode === "status") {
            const statusMsg = 
`╭──────────────────╮
   📊 𝗕𝗔𝗗𝗢𝗟-𝗕𝗢𝗧 𝗟𝗜𝗩𝗘 𝗦𝗧𝗔𝗧𝗨𝗦
╰──────────────────╯

╭━━━ [ 🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ] ━━━✨
┃ 🔹 নাম: ${config.BOT_INFO.NAME}
┃ 🔹 প্রিফিক্স: [ ${config.BOT_INFO.PREFIX} ]
┃ 🔹 ওনার লক: ${config.OWNER_LOCK.ENABLED ? "🟢 LOCKED" : "🔴 UNLOCKED"}
╰━━━━━━━━━━━━━━━━━━━ℹ️

╭━━━ [ ⚙️ 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦 ] ━━━🎛️
┃ 🔓 Approval System: ${config.APPROVAL_SYSTEM.ENABLED ? "🟢 ON" : "🔴 OFF"}
┃ 👑 Admin Only Mode: ${config.ADMIN_SYSTEM.ADMIN_ONLY_MODE ? "🟢 ON" : "🔴 OFF"}
┃ 🗑️ Anti-Unsend:     ${config.BEHAVIOR.ANTI_UNSEND ? "🟢 ON" : "🔴 OFF"}
┃ 🏃 Anti-Out:        ${config.BEHAVIOR.ANTI_OUT ? "🟢 ON" : "🔴 OFF"}
╰━━━━━━━━━━━━━━━━━━━🛡️

╭━━━ [ 📈 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘 ] ━━━📊
┃ 👥 মোট এডমিন:  ${config.ADMIN_SYSTEM.ADMINS.length} জন
┃ ✅ অ্যাপ্রুভ গ্রুপ: ${config.APPROVAL_SYSTEM.APPROVED_THREADS.length} টি
┃ ⏳ পেন্ডিং গ্রুপ: ${config.APPROVAL_SYSTEM.PENDING_THREADS.length} টি
┃ 👤 ব্যান ইউজার:  ${config.ACCESS_CONTROL.BANNED_USERS.length} জন
┃ 👥 ব্যান গ্রুপ:   ${config.ACCESS_CONTROL.BANNED_THREADS.length} টি
╰━━━━━━━━━━━━━━━━━━━🗂️`;
            return api.sendMessage(statusMsg, event.threadID, event.messageID);
        }

        // ═══════════════════ [ 🔄 TOGGLE SYSTEM ] ═══════════════════
        if (mode === "toggle") {
            if (!target) return api.sendMessage("⚠️ Settings target missing!", event.threadID, event.messageID);

            let msg = "";
            if (target === "approval") {
                config.APPROVAL_SYSTEM.ENABLED = !config.APPROVAL_SYSTEM.ENABLED;
                msg = `Approval System: ${config.APPROVAL_SYSTEM.ENABLED ? "🟢 ON" : "🔴 OFF"}`;
            } else if (target === "adminonly") {
                config.ADMIN_SYSTEM.ADMIN_ONLY_MODE = !config.ADMIN_SYSTEM.ADMIN_ONLY_MODE;
                msg = `Admin Only Mode: ${config.ADMIN_SYSTEM.ADMIN_ONLY_MODE ? "🟢 ON" : "🔴 OFF"}`;
            } else if (target === "antiunsend") {
                config.BEHAVIOR.ANTI_UNSEND = !config.BEHAVIOR.ANTI_UNSEND;
                msg = `Anti-Unsend: ${config.BEHAVIOR.ANTI_UNSEND ? "🟢 ON" : "🔴 OFF"}`;
            } else if (target === "antiout") {
                config.BEHAVIOR.ANTI_OUT = !config.BEHAVIOR.ANTI_OUT;
                msg = `Anti-Out: ${config.BEHAVIOR.ANTI_OUT ? "🟢 ON" : "🔴 OFF"}`;
            } else {
                return api.sendMessage("❌ Invalid Target!", event.threadID, event.messageID);
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
            if (typeof global.reloadConfig === "function") global.reloadConfig();
            
            return api.sendMessage(`╭──────────────────╮\n  ✅ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗨𝗣𝗗𝗔𝗧𝗘divider \n╰──────────────────╯\n\n✨ ${msg}`, event.threadID, event.messageID);
        }

        // ═══════════════════ [ 👑 ADMIN MANAGEMENT ] ═══════════════════
        if (mode === "admin") {
            if (!target || !value) return api.sendMessage(`⚠️ Usage: ${prefix}config admin add/remove [UID]`, event.threadID, event.messageID);

            if (target === "add") {
                if (config.ADMIN_SYSTEM.ADMINS.includes(value)) return api.sendMessage("ℹ️ Already Admin!", event.threadID, event.messageID);
                config.ADMIN_SYSTEM.ADMINS.push(value);
                api.sendMessage(`╭──────────────────╮\n  👑 𝗔𝗗𝗠𝗜𝗡 𝗔𝗗𝗗𝗘𝗗 \n╰──────────────────╯\n\n👤 UID: ${value}`, event.threadID);
            } else if (target === "remove") {
                if (!config.ADMIN_SYSTEM.ADMINS.includes(value)) return api.sendMessage("❌ UID not found!", event.threadID, event.messageID);
                if (value === config.OWNER_LOCK.ID) return api.sendMessage("❌ Action Denied!", event.threadID, event.messageID);
                config.ADMIN_SYSTEM.ADMINS = config.ADMIN_SYSTEM.ADMINS.filter(id => id !== value);
                api.sendMessage(`╭──────────────────╮\n  ❌ 𝗔𝗗𝗠𝗜𝗡 推𝗠𝗢𝗩𝗘𝗗 \n╰──────────────────╯\n\n👤 UID: ${value}`, event.threadID);
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
            if (typeof global.reloadConfig === "function") global.reloadConfig();
            return;
        }

        // ═══════════════════ [ ⛔ BAN SYSTEM ] ═══════════════════
        if (mode === "ban") {
            if (!target || !value) return api.sendMessage(`⚠️ Usage: ${prefix}config ban user/thread [ID]`, event.threadID, event.messageID);

            if (target === "user") {
                if (value === config.OWNER_LOCK.ID) return api.sendMessage("❌ Action Denied!", event.threadID, event.messageID);
                if (config.ACCESS_CONTROL.BANNED_USERS.includes(value)) return api.sendMessage("ℹ️ Already Banned!", event.threadID, event.messageID);
                config.ACCESS_CONTROL.BANNED_USERS.push(value);
                api.sendMessage(`╭──────────────────╮\n  ⛔ 𝗨𝗦𝗘𝗥 𝗕𝗔𝗡𝗡𝗘𝗗 \n╰──────────────────╯\n\n👤 UID: ${value}`, event.threadID);
            } else if (target === "thread") {
                if (config.ACCESS_CONTROL.BANNED_THREADS.includes(value)) return api.sendMessage("ℹ️ Already Banned!", event.threadID, event.messageID);
                config.ACCESS_CONTROL.BANNED_THREADS.push(value);
                api.sendMessage(`╭──────────────────╮\n  ⛔ 𝗚𝗥𝗢𝗨𝗣 𝗕𝗔𝗡𝗡𝗘𝗗 \n╰──────────────────╯\n\n👥 GID: ${value}`, event.threadID);
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
            if (typeof global.reloadConfig === "function") global.reloadConfig();
            return;
        }

        // ═══════════════════ [ 🔓 UNBAN SYSTEM ] ═══════════════════
        if (mode === "unban") {
            if (!target || !value) return api.sendMessage(`⚠️ Usage: ${prefix}config unban user/thread [ID]`, event.threadID, event.messageID);

            if (target === "user") {
                if (!config.ACCESS_CONTROL.BANNED_USERS.includes(value)) return api.sendMessage("❌ Not Found!", event.threadID, event.messageID);
                config.ACCESS_CONTROL.BANNED_USERS = config.ACCESS_CONTROL.BANNED_USERS.filter(id => id !== value);
                api.sendMessage(`╭──────────────────╮\n  🔓 𝗨𝗦𝗘𝗥 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗 \n╰──────────────────╯\n\n👤 UID: ${value}`, event.threadID);
            } else if (target === "thread") {
                if (!config.ACCESS_CONTROL.BANNED_THREADS.includes(value)) return api.sendMessage("❌ Not Found!", event.threadID, event.messageID);
                config.ACCESS_CONTROL.BANNED_THREADS = config.ACCESS_CONTROL.BANNED_THREADS.filter(id => id !== value);
                api.sendMessage(`╭──────────────────╮\n  🔓 𝗚𝗥𝗢𝗨𝗣 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗 \n╰──────────────────╯\n\n👥 GID: ${value}`, event.threadID);
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
            if (typeof global.reloadConfig === "function") global.reloadConfig();
            return;
        }
    }
};
