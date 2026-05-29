const fs = require("fs-extra");
const path = require("path");
const axios = require("axios"); // নতুন অ্যাড করো

// Config লোড করার ফাংশন
const getConfig = () => {
    try {
        const configPath = path.join(__dirname, "../../config.json");
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {
        return {};
    }
};

// ছবি স্ট্রিম করার ফাংশন
const getStream = async (url) => {
    try {
        const res = await axios.get(url, { responseType: "stream" });
        return res.data;
    } catch (e) {
        return null;
    }
};

module.exports = {
    config: {
        name: "joinNoti",
        credit: "MOHAMMAD BADOL",
        description: "নতুন মেম্বার/বট এড হলে ওয়েলকাম মেসেজ + নিকনেম চেঞ্জ"
    },

    onEvent: async (api, event) => {
        if (event.logMessageType!== "log:subscribe") return;

        const { threadID, logMessageData, author } = event;
        const botID = api.getCurrentUserID();
        const config = getConfig();

        // ছবির লিংক - Drive ডাউনলোড লিংক
        const imgURL = "https://drive.google.com/uc?export=download&id=107tUEMU7YZWkKJfUzD7-tiPGVdOSY7wb";

        // গ্রুপের তথ্য
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName || "এই গ্রুপ";
        const memberCount = threadInfo.participantIDs.length;
        const prefix = config.BOT_INFO?.PREFIX || "/";
        const botName = config.BOT_INFO?.NAME || "BADOL-BOT";
        const owner = config.OWNER_LOCK?.NAME || "MOHAMMAD BADOL";

        // অ্যাডমিন নাম
        let adderName = "Admin";
        try {
            const adderInfo = await api.getUserInfo(author);
            adderName = adderInfo[author]?.name || "Admin";
        } catch (e) {}

        for (const user of logMessageData.addedParticipants) {
            // চেক করো বট নিজে এড হইছে কিনা
            if (user.userFbId === botID) {
                // 1. বটের নিকনেম চেঞ্জ করো
                try {
                    await api.changeNickname(botName, threadID, botID);
                    console.log(` Nickname changed to: ${botName}`);
                } catch (e) {
                    console.log(" Nickname change failed:", e.message);
                }

                // 2. বট এড হইছে - ছবি সহ ওয়েলকাম
                const botWelcomeMsg =
`╭────────────────────────╮
│ 🤖 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 🤖 │
╰────────────────────────╯

হ্যালো ${groupName}! 👋

আমি ${botName}
আমাকে এড করার জন্য ধন্যবাদ ${adderName}! ❤️

━━━━━━━━━━━━━━━━━━━━━━
📌 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢:
👥 মেম্বার: ${memberCount} জন
🤖 বট প্রিফিক্স: ${prefix}
━━━━━━━━━━━━━━━━━━━━━━

💡 𝗚𝗘𝗧 𝗦𝗧𝗔𝗥𝗧𝗘𝗗:
সব কমান্ড দেখতে টাইপ করো:
${prefix}help

━━━━━━━━━━━━━━━━━━━━━━
👑 𝗢𝗪𝗡𝗘𝗥: ${owner}

সবাইকে স্বাগতম! 🌸
╰────────────────────────╯`;

                return api.sendMessage({
                    body: botWelcomeMsg,
                    attachment: await getStream(imgURL)
                }, threadID);
            } else {
                // নরমাল মেম্বার এড হইছে - ছবি সহ ওয়েলকাম
                const newUserName = user.fullName;

                const memberMsg =
`╔══════════════════════╗
║ 🎉 WELCOME 🎉 ║
╚══════════════════════╝

👤 𝗡𝗲𝘄 𝗠𝗲𝗺𝗯𝗲𝗿 : ${newUserName}
➕ 𝗔𝗱𝗱𝗲𝗱 𝗕𝘆 : ${adderName}
👥 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲 : ${groupName}
🔢 𝗠𝗲𝗺𝗯𝗲𝗿 𝗡𝗼. : #${memberCount}

🌟 আমাদের পরিবারে আপনাকে স্বাগতম! 🌟`;

                api.sendMessage({
                    body: memberMsg,
                    attachment: await getStream(imgURL)
                }, threadID);
            }
        }
    }
};
