/**
 * 🛠️ BADOL-BOT-V5 COMMAND: VOICE (BANGLA TTS)
 * 👤 AUTHOR: MOHAMMAD BADOL
 * 🛡️ SYSTEM: ROLE 0, COOLDOWN, CREDIT
 * 📂 TEMP STORAGE: ../cache/
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "voice",
    aliases: ["say", "x", "speak"],
    version: "1.0.9",
    role: 0, 
    credit: "MOHAMMAD BADOL",
    cooldown: 5,
    description: "Convert Bangla text to voice or audio.",
    usages: "voice <text> or reply to a message",
    prefix: true,
    commandCategory: "Utility"
};

module.exports.onStart = async function (api, event, args) {
    if (!event || !event.threadID) {
        return console.error("Voice CMD: Event object missing");
    }

    const { threadID, messageID, senderID, type, messageReply } = event;

    const cacheDir = path.join(__dirname, "../../cache");
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    let input;
    if (type === "message_reply" && messageReply?.body) {
        input = messageReply.body;
    } else {
        input = args.join(" ");
    }

    if (!input) {
        return api.sendMessage(
            "🔊 Please enter a Bangla sentence or reply to a message with this command.\n\n💡 Example: voice Ami tomake bhalobashi", 
            threadID, 
            messageID
        );
    }

    if (input.length > 200) {
        return api.sendMessage("❌ Sorry, text longer than 200 characters is not supported.", threadID, messageID);
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=bn&client=tw-ob&q=${encodeURIComponent(input)}`;
    const filePath = path.join(cacheDir, `tts_${senderID}_${Date.now()}.mp3`);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            try { fs.unlinkSync(filePath); } catch (e) {}
            return api.sendMessage("❌ Failed to generate TTS. Google server is not responding.", threadID, messageID);
        }

        response.pipe(file);

        file.on("finish", () => {
            file.close(() => {
                const stats = fs.statSync(filePath);
                if (stats.size < 100) {
                    try { fs.unlinkSync(filePath); } catch (e) {}
                    return api.sendMessage("❌ Audio generation failed. Please try with different text.", threadID, messageID);
                }

                api.sendMessage({
                    body: "🎙️ 𝗕𝗔𝗗𝗢𝗟-𝗕𝗢𝗧 𝗕𝗮𝗻𝗴𝗹𝗮 𝗧𝗧𝗦",
                    attachment: fs.createReadStream(filePath)
                }, threadID, () => {
                    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
                }, messageID);
            });
        });

        file.on("error", () => {
            try { fs.unlinkSync(filePath); } catch (e) {}
            api.sendMessage("❌ Error writing the file.", threadID, messageID);
        });

    }).on("error", (err) => {
        console.error("HTTPS Error:", err.message);
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
        api.sendMessage("❌ A network error occurred.", threadID, messageID);
    });
};
