module.exports = {
    config: {
        name: "pending",
        aliases: ["pen", "appr"],
        prefix: true,
        role: 1,
        cooldown: 5,
        credit: "MOHAMMAD BADOL"
    },

    onStart: async (api, event, args) => {
        const { threadID, messageID, senderID } = event;
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const pendingList = threadInfo.approvalQueue || [];

            if (pendingList.length === 0) {
                return api.sendMessage("╭─📋 PENDING ─╮\n│ No Pending Members\n╰─────────────╯", threadID, messageID);
            }

            const pendingNames = [];
            for (let i = 0; i < pendingList.length; i++) {
                try {
                    const uInfo = await api.getUserInfo(pendingList[i].requesterID);
                    const name = uInfo[pendingList[i].requesterID]?.name || "Unknown User";
                    pendingNames.push({ name, id: pendingList[i].requesterID });
                } catch (e) {
                    pendingNames.push({ name: "Unknown User", id: pendingList[i].requesterID });
                }
            }

            let msg = "╭─📋 PENDING MEMBERS ─╮\n│ Total: " + pendingList.length + " জন\n│\n";
            pendingNames.forEach((u, i) => { msg += "│ " + (i + 1) + ". " + u.name + "\n"; });
            msg += "│\n│ Reply with numbers to approve\n╰──────────────────╯";

            // লিস্ট পাঠানোর পর আইডি ক্যাশে সেভ করা যাতে রিপ্লাই কাজ করে
            const info = await api.sendMessage(msg, threadID);
            global.msgCache.set(info.messageID, { commandName: "pending", pendingList });

        } catch (e) {
            return api.sendMessage("❌ Error: " + e.message, threadID, messageID);
        }
    },

    onReply: async (api, event, cache) => {
        const { threadID, messageID, body } = event;
        const { pendingList } = cache;

        const inputArgs = body.replace(/,/g, " ").split(" ");
        let targetIndexes = [];

        if (inputArgs[0].toLowerCase() === 'all') {
            targetIndexes = pendingList.map((_, i) => i);
        } else {
            targetIndexes = inputArgs.map(a => parseInt(a) - 1).filter(i => !isNaN(i) && i >= 0 && i < pendingList.length);
        }

        if (targetIndexes.length === 0) return api.sendMessage("❌ Invalid Number!", threadID, messageID);

        let count = 0;
        for (let i of targetIndexes) {
            try {
                await api.addUserToGroup(pendingList[i].requesterID, threadID);
                count++;
                await new Promise(r => setTimeout(r, 800));
            } catch (e) { console.log(e); }
        }

        return api.sendMessage("✅ " + count + " জনকে সফলভাবে Approve করা হয়েছে।", threadID, messageID);
    }
};
