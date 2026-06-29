module.exports = {
    config: {
        name: "giveme",
        aliases: ["addme", "friendme"],
        description: "বট থেকে Friend Request নাও",
        usage: "giveme request",
        role: 0,
        cooldown: 60,
        prefix: true,
        credit: "MOHAMMAD BADOL"
    },

    onStart: async (api, event, args) => {
        const { threadID, messageID, senderID } = event;

        if (!args[0] || args[0].toLowerCase()!== "request") {
            return api.sendMessage(
                `╭─📋 GIVE ME ─╮\n` +
                `│ ইউজ: /giveme request\n` +
                `│ বট তোমাকে Friend Request\n` +
                `│ পাঠাবে ✅\n` +
                `╰─────────────╯`,
                threadID, messageID
            );
        }

        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || "Unknown";

        try {
            // ✅ ফিক্স 1: আগে ফ্রেন্ড লিস্ট চেক কর
            const botID = api.getCurrentUserID();
            const botFriends = await api.getFriendsList();

            const isAlreadyFriend = botFriends.some(friend => friend.userID == senderID);

            if (isAlreadyFriend) {
                return api.sendMessage(
                    `╭─😎 ALREADY ─╮\n` +
                    `│ ${userName}\n` +
                    `│ তুমি অলরেডি আমার\n` +
                    `│ ফ্রেন্ড লিস্টে আছো ✅\n` +
                    `╰─────────────╯`,
                    threadID, messageID
                );
            }

            // ✅ ফিক্স 2: Pending Request চেক - fca তে সরাসরি নাই, তাই try-catch
            await api.addFriend(senderID);

            return api.sendMessage(
                `╭─✅ SENT ─╮\n` +
                `│ ${userName}\n` +
                `│ তোমাকে Friend Request\n` +
                `│ পাঠানো হইছে 🎉\n` +
                `╰──────────╯`,
                threadID, messageID
            );

        } catch (e) {
            console.log("Friend Request Error:", e);

            let errorMsg = "Request Failed";

            // ✅ ফিক্স 3: এরর কোড ধরে সঠিক মেসেজ
            if (e.error === 1545006) {
                errorMsg = "তুমি অলরেডি ফ্রেন্ড 😎";
            } else if (e.error === 1545004) {
                errorMsg = "Request অলরেডি পাঠানো আছে";
            } else if (e.error === 1545003) {
                errorMsg = "তোমার প্রোফাইল Lock/Private";
            } else if (e.error === 1545012) {
                errorMsg = "Friend লিমিট ফুল আমার 🥲";
            } else if (e.message && e.message.includes("already")) {
                errorMsg = "তুমি অলরেডি ফ্রেন্ড 😎";
            }

            return api.sendMessage(
                `╭─❌ FAILED ─╮\n` +
                `│ ${userName}\n` +
                `│ ${errorMsg}\n` +
                `╰─────────────╯`,
                threadID, messageID
            );
        }
    }
};
