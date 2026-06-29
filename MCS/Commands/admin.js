/cmd add admin.js const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "admin",
    aliases: ["addadmin", "adminadd", "botadmin"],
    version: "5.1",
    credit: "MOHAMMAD BADOL",
    prefix: true,
    role: 0,
    cooldown: 3,
    category: "System",
    description: "Full admin management for all bot admins"
};

const configPath = path.join(__dirname, "../../config.json");

const loadConfig = () => JSON.parse(fs.readFileSync(configPath, "utf-8"));
const saveConfig = (config) => fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

const getUserName = async (api, uid, config) => {
    if (uid === config.OWNER_LOCK?.ID) return config.OWNER_LOCK?.NAME || "MOHAMMAD BADOL";
    try {
        const info = await api.getUserInfo(uid);
        return info[uid]?.name || "Unknown User";
    } catch (e) { return "Unknown User"; }
};

const smartNotify = async (api, targetID, threadID, message, targetName) => {
    try {
        await api.sendMessage(message, targetID);
        return true;
    } catch (e) {
        try {
            await api.sendMessage(`╭━❮NOTIFICATION❯━╮\n├‣ ⚠️ Could not DM ${targetName}\n├‣ 💡 Ask them to message bot first\n╰━──━─━─━━─━─━❍`, threadID);
        } catch (err) {}
        return false;
    }
};

module.exports.onStart = async function (api, event, args) {
    const { senderID, threadID, mentions, messageReply } = event;
    const config = loadConfig();
    const action = args[0]?.toLowerCase();
    const target = messageReply?.senderID || Object.keys(mentions)[0] || args[1];
    const isAdmin = config.ADMIN_SYSTEM.ADMINS.includes(senderID);
    const senderName = await getUserName(api, senderID, config);

    if (action === "list" || action === "all") {
        const adminList = config.ADMIN_SYSTEM.ADMINS;
        const ownerID = config.OWNER_LOCK?.ID;
        const ownerName = await getUserName(api, ownerID, config);
        const moderators = adminList.filter(id => id !== ownerID);

        let msg = `┏━━━━━━━━━━━━━━━━━━┓\n   ✨ BADOL-BOT-V5 ✨\n┗━━━━━━━━━━━━━━━━━━┛\n\n`;
        msg += `╭─❮ 👑 OWNER INFO ❯─╮\n│ 👤 ${ownerName}\n│ 🆔 ${ownerID}\n╰──────────────────╯\n\n`;
        msg += `╭─❮ 🛡️ MODERATORS ❯─╮\n`;
        if (moderators.length > 0) {
            for (let i = 0; i < moderators.length; i++) {
                const name = await getUserName(api, moderators[i], config);
                msg += `│ ${i + 1}. ${name}\n│ 🆔 ${moderators[i]}\n${i < moderators.length - 1 ? `│ ──────────────\n` : ``}`;
            }
        } else { msg += `│ ❌ No moderators found.\n`; }
        msg += `╰──────────────────╯\n\n💡 Use /admin add/remove @tag`;

        try {
            const imageUrl = "https://drive.google.com/uc?export=view&id=1lf3TVYxwMsDZqByetetgtPf3mlBFcWMB";
            const response = await axios.get(imageUrl, { responseType: "stream" });
            return api.sendMessage({ body: msg, attachment: response.data }, threadID);
        } catch (e) { return api.sendMessage(msg, threadID); }
    }

    if (!isAdmin) return api.sendMessage("❌ Only Bot Admins can use this!", threadID);
    if (!target) return api.sendMessage("💡 Use: /admin add/remove @mention", threadID);

    const targetName = await getUserName(api, target, config);

    if (action === "add") {
        if (config.ADMIN_SYSTEM.ADMINS.includes(target)) return api.sendMessage(`❌ ${targetName} already admin!`, threadID);
        config.ADMIN_SYSTEM.ADMINS.push(target);
        saveConfig(config);
        try { await api.changeNickname(`[MOD] ${targetName}`, threadID, target); } catch (e) {}
        const notifyMsg = `╭━❮BADOL-BOT-V5❯━╮\n├‣ 🎉 CONGRATULATIONS!\n├━─━─━━──━─━─━\n├‣ You are now Bot Moderator!\n├‣ Added by: ${senderName}\n╰━──━─━─━━─━─━❍`;
        await smartNotify(api, target, threadID, notifyMsg, targetName);
        return api.sendMessage(`✅ Success!\n👤 ${targetName}\n⭐ Now Bot Moderator\n👮 Added by: ${senderName}`, threadID);
    } else if (action === "remove") {
        if (target === config.OWNER_LOCK?.ID) return api.sendMessage("❌ Cannot remove Owner!", threadID);
        if (!config.ADMIN_SYSTEM.ADMINS.includes(target)) return api.sendMessage(`❌ ${targetName} is not admin!`, threadID);
        config.ADMIN_SYSTEM.ADMINS = config.ADMIN_SYSTEM.ADMINS.filter(id => id !== target);
        saveConfig(config);
        try { await api.changeNickname("", threadID, target); } catch (e) {}
        await smartNotify(api, target, threadID, `⚠️ Your access revoked by ${senderName}`, targetName);
        return api.sendMessage(`✅ REMOVED!\n👤 ${targetName}\nStatus: No longer admin`, threadID);
    }
};