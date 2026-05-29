const axios = require("axios");

module.exports = {
    config: {
        name: "leave",
        credit: "MOHAMMAD BADOL"
    },

    onEvent: async (api, event) => {
        if (event.logMessageType === "log:unsubscribe") {
            const { threadID, logMessageData, author } = event;
            const leftUserID = logMessageData.leftParticipantFbId;

            // ছবির লিংক - Drive ডাউনলোড লিংক
            const imgURL = "https://drive.google.com/uc?export=download&id=1oba3o9Jzfa9ds7vzcisoo2eb2CMlXcAq";

            const getStream = async (url) => {
                try {
                    const res = await axios.get(url, { responseType: "stream" });
                    return res.data;
                } catch (e) {
                    return null;
                }
            };

            // গ্রুপের তথ্য সংগ্রহ
            const threadInfo = await api.getThreadInfo(threadID);
            const groupName = threadInfo.threadName || "এই গ্রুপ";
            const memberCount = threadInfo.participantIDs.length;

            // চলে যাওয়া মেম্বারের নাম বের করার চেষ্টা
            let leftUserName = "Unknown User";
            try {
                const userInfo = await api.getUserInfo(leftUserID);
                leftUserName = userInfo[leftUserID]?.name || "Unknown User";
            } catch (e) {}

            // কে রিমুভ করেছে (যদি থাকে)
            let actionBy = "";
            if (author!== leftUserID) {
                try {
                    const authorInfo = await api.getUserInfo(author);
                    const authorName = authorInfo[author]?.name || "Admin";
                    actionBy = `\n👤 রিমুভ করেছেন: ${authorName}`;
                } catch (e) {}
            }

            // মেসেজ ডিজাইন
            const msg =
                `╔══════════════════════╗\n` +
                `║ 👋 GOODBYE 👋 ║\n` +
                `╚══════════════════════╝\n\n` +
                `👤 মেম্বার: ${leftUserName}\n` +
                `👥 গ্রুপের নাম: ${groupName}${actionBy}\n` +
                `🔢 বর্তমান সদস্য: #${memberCount}\n\n` +
                `🌟 আমাদের সাথে থাকার জন্য ধন্যবাদ! 🌟`;

            api.sendMessage({
                body: msg,
                attachment: await getStream(imgURL)
            }, threadID);
        }
    }
};
