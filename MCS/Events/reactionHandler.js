module.exports = {
    config: { 
        name: "reactionHandler",
        credit: "Badol" 
    },

    onReaction: async (api, event) => {
        const { reaction, messageID, threadID, userID } = event;
        
        // কনফিগারেশন থেকে অ্যাডমিন লিস্ট চেক করুন (আপনার বটের কনফিগারেশন অনুযায়ী)
        const config = JSON.parse(require("fs").readFileSync("./config.json", "utf-8"));
        const isAdmin = config.ADMIN_SYSTEM.ADMINS.includes(userID);

        // ১. বটের মেসেজ Unsend করার লজিক (শুধু অ্যাডমিন)
        const unsendEmojis = ["😠", "😾", "🤬", "😡", "😈", "👿"];
        if (unsendEmojis.includes(reaction)) {
            if (!isAdmin) return; // অ্যাডমিন না হলে কাজ করবে না
            
            const message = await api.getMessage(threadID, messageID);
            if (message && message.senderID === api.getCurrentUserID()) {
                return api.unsendMessage(messageID);
            }
        }

        // ২. কিক করার লজিক (শুধু অ্যাডমিন)
        const kickEmojis = ["🦵", "🦶", "🦿", "🖕"]; 
        if (kickEmojis.includes(reaction)) {
            if (!isAdmin) return; // অ্যাডমিন না হলে কাজ করবে না

            const message = await api.getMessage(threadID, messageID);
            const targetID = message.senderID;
            const botID = api.getCurrentUserID();

            if (targetID !== botID) {
                api.removeUserFromGroup(targetID, threadID, (err) => {
                    if (err) {
                        api.sendMessage("❌ তাকে কিক দিতে ব্যর্থ! (আমি কি অ্যাডমিন?)", threadID);
                    } else {
                        api.sendMessage(`✅ ${reaction} রিঅ্যাক্টের মাধ্যমে মেম্বারকে গ্রুপ থেকে বিদায় জানানো হলো।`, threadID);
                    }
                });
            }
        }
    }
};
