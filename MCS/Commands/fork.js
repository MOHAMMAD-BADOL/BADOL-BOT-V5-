const axios = require("axios");

module.exports = {
    config: {
        name: "fork",
        aliases: ["botlink", "botlink"],
        credit: "MOHAMMAD BADOL",
        role: 0,
        prefix: true,
        cooldown: 5,
        description: "public bot setup"
    },

    onStart: async (api, event, args) => {
        const { threadID, messageID } = event;
        const imageURL = "https://lh3.googleusercontent.com/d/1k6GbMiM2fkM_IUWAMDRjauWAJmTScTV6";
        const imageStream = (await axios.get(imageURL, { responseType: "stream" })).data;

        if (args[0] === "help") {
            const helpMsg = 
                `╭═══ 𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓 ═══╮\n` +
                `│🛡DEV: MOHAMMAD BADOL🛡️\n` +
                `╰═════════════════════╯\n` +
                `│ 📈 স্ট্যাটাস: পাবলিক বট (Public Bot)\n` +
                `│ 📊 মোট কমান্ড: 60+\n` +
                `│ ⚙️ সিস্টেম: প্রফেশনাল & প্রিমিয়াম\n` +
                `├─────────────────────┤\n` +
                `│ 🛠️ **সেটআপ নিয়মাবলী:**\n` +
                `│ ১. গিটহাব থেকে 'Fork' করুন।\n` +
                `│ ২. 'BADOL-Appstate.json' এ কুকি দিন।\n` +
                `│ ৩. 'config.json' এ এডমিন আইডি দিন।\n` +
                `│ ৪. রান করুন: 'npm install' > 'npm start'\n` +
                `├─────────────────────┤\n` +
                `│ 🆘 **হেল্প বা সাপোর্ট:**\n` +
                `│ কোনো এরর বা ফিচার বুঝতে সমস্যা হলে:\n` +
                `│ লিখুন: /call [আপনার সমস্যার বিস্তারিত]\n` +
                `├─────────────────────┤\n` +
                `│ 🔗 গিটহাব লিঙ্ক (পাবলিক):\n` +
                `│ https://github.com/badolvai007/BADOL-BOT-V5\n` +
                `╰═════════════════════╯`;
            return api.sendMessage({ body: helpMsg, attachment: imageStream }, threadID, messageID);
        }

        const msg = 
            `┏━━━━━━━━━━━━━━━━━┓\n` +
            `   🚀 𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓\n` +
            `┗━━━━━━━━━━━━━━━━━┛\n\n` +
            `✅ **BADOL-BOT-V5 | PUBLIC LINK!**\n\n` +
            `📌 এই বটটি একটি পাবলিক প্রজেক্ট। বর্তমান কমান্ড সংখ্যা: 60+। আপনাদের সাপোর্টে সামনে আরও নতুন ফিচার আসবে।\n\n` +
            `🆘 কোনো সমস্যায় ওনারের সাথে যোগাযোগ করতে লিখুন:\n` +
            `👉 /call [আপনার সমস্যার বিস্তারিত]\n\n` +
            `🔗 আমাদের গিটহাব লিঙ্ক:\n` +
            `https://github.com/badolvai007/BADOL-BOT-V5\n\n` +
            `💡 বিস্তারিত সেটআপ গাইড দেখতে টাইপ করুন:\n` +
            `👉 /fork help`;

        return api.sendMessage({ body: msg, attachment: imageStream }, threadID, messageID);
    }
};
