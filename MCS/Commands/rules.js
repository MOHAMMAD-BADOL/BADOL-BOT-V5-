const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "rules",
        aliases: ["rule", "rulse", "instructions"],
        version: "5.0.9",
        credit: "MOHAMMAD BADOL",
        countDown: 3,
        role: 0,
        prefix: true, // এটি যোগ করা হয়েছে যাতে শুধু প্রিফিক্স দিলে কাজ করে
        shortDescription: "গ্রুপের নিয়মাবলী এবং ইউজার গাইডলাইন দেখুন",
        longDescription: "বট এবং গ্রুপ ব্যবহারের সাধারণ নিয়মাবলী ও ভদ্রতা বজায় রাখার গাইডলাইন।",
        category: "Utility",
        guide: "{p}rules"
    },

    onStart: async function (api, event, args) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const configPath = path.join(__dirname, "../../config.json");

        let prefix = "/";
        try {
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                prefix = config.BOT_INFO?.PREFIX || "/";
            }
        } catch (e) {
            prefix = global.config?.BOT_INFO?.PREFIX || "/";
        }

        const rulesMessage = 
            `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
            `  📜  𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓 𝐆𝐑𝐎𝐔𝐏 𝐑𝐔𝐋𝐄𝐒  📜\n` +
            `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
            `🔹 **[1] ভদ্রতা ও সম্মান:**\n` +
            `গ্রুপের সবাই সবার সাথে খুব সুন্দর এবং ভদ্রতার সঙ্গে কথা বলবেন। কাউকে অসম্মান বা ছোট করে কোনো কথা বলা সম্পূর্ণ নিষিদ্ধ।\n\n` +
            `🔹 **[2] নো স্প্যামিং (No Spam):**\n` +
            `বটের ভুলভাল বা উল্টাপাল্টা কমান্ড ব্যবহার করে গ্রুপে স্প্যামিং করবেন না। বটের সব সঠিক কমান্ড দেখতে এবং ব্যবহার করতে সরাসরি টাইপ করুন: ${prefix}help\n\n` +
            `🔹 **[3] অশ্লীলতা ও গালাগালি:**\n` +
            `গ্রুপে কোনো প্রকার গালাগালি, নোংরা ভাষা বা অশ্লীলতা ছড়ানো যাবে না। গ্রুপকে সবসময় পরিচ্ছন্ন রাখুন।\n\n` +
            `⚠️ **[4] ওয়ার্নিং ও কিক পলিসি:**\n` +
            `রুলসের বাইরে বা নিয়মের পরিপন্থী কোনো কাজ করলে আপনাকে ২ বার ওয়ার্নিং (Warning) দেওয়া হবে। ৩ বারের বার সরাসরি গ্রুপ থেকে কিক (Kick) দেওয়া হবে।\n\n` +
            `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
            `  🛠️  𝐀𝐃𝐌𝐈𝐍 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 & 𝐇𝐄𝐋𝐏𝐋𝐈𝐍𝐄  \n` +
            `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
            `📢 **BADOL-BOT-V5** ইউজারদের যেকোনো ফাইল বা বটের যেকোনো সমস্যায় সরাসরি অ্যাডমিনের সাথে যোগাযোগ করতে পারেন।\n\n` +
            `📞 **অ্যাডমিনের সাথে যোগাযোগের নিয়ম:**\n` +
            `টাইপ করুন: ⚠️ \`${prefix}call [আপনার প্রশ্ন বা মতামত এখানে লিখুন]\`\n\n` +
            `📌 *উদাহরণ:* \`${prefix}call ভাই, বটের এই ফাইলে সমস্যা হচ্ছে, একটু দেখুন।\`\n\n` +
            `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
            `  👤 Developer: MOHAMMAD BADOL\n` +
            `┗━━━━━━━━━━━━━━━━━━━━┛`;

        const imageUrl = "https://docs.google.com/uc?export=download&id=1zBkKTB14jZbc8plNbcrKGMwZvnhvd1rJ";
        const cachePath = path.join(__dirname, "../../cache", "rules_image.jpg");

        try {
            const response = await axios({
                method: "GET",
                url: imageUrl,
                responseType: "stream"
            });

            const writer = fs.createWriteStream(cachePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                return api.sendMessage({
                    body: rulesMessage,
                    attachment: fs.createReadStream(cachePath)
                }, threadID, () => {
                    if (fs.existsSync(cachePath)) {
                        fs.unlinkSync(cachePath);
                    }
                }, messageID);
            });

            writer.on("error", () => {
                return api.sendMessage(rulesMessage, threadID, messageID);
            });

        } catch (error) {
            return api.sendMessage(rulesMessage, threadID, messageID);
        }
    }
};
