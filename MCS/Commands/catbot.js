const axios = require('axios');

const baseApiUrl = async () => {
    try {
        const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
        return base.data.api;
    } catch (e) {
        return "https://api.dipto.fun";
    }
};

module.exports = {
    config: {
        name: "catbot",
        version: "6.9.9",
        credit: "MOHAMMAD BADOL",
        role: 0,
        description: "Better than all sim simi",
        prefix: true,
        aliases: ["baby", "sim"],
        cooldown: 0
    },

    onStart: async (api, event, args) => {
        const { threadID, messageID, senderID } = event;
        const link = `${await baseApiUrl()}/baby`;
        const dipto = args.join(" ").toLowerCase();
        if (!args[0]) return api.sendMessage("Bolo baby, type 'baby help' for info.", threadID);
        
        let name = "User";
        try { const uInfo = await api.getUserInfo(senderID); name = uInfo[senderID]?.name || "User"; } catch (e) {}

        try {
            const res = await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${senderID}&font=1`);
            const finalMsg = `${name}, ${res.data.reply}`;
            return api.sendMessage({ body: finalMsg, mentions: [{ tag: name, id: senderID }] }, threadID, (err, info) => {
                if (!err) {
                    global.msgCache.set(info.messageID, { body: finalMsg, senderID: api.getCurrentUserID(), attachments: [], commandName: module.exports.config.name });
                }
            }, messageID);
        } catch (e) {
            api.sendMessage("Error: " + e.message, threadID);
        }
    },

    onChat: async (api, event) => {
        if (!event.body) return;
        const body = event.body.toLowerCase();
        const keywords = ["baby", "bby", "bot", "বট"];
        if (keywords.some(k => body.startsWith(k))) {
            const { threadID, messageID, senderID } = event;
            const arr = body.replace(/^\S+\s*/, "");
            const link = await baseApiUrl();
            
            let name = "User";
            try { const uInfo = await api.getUserInfo(senderID); name = uInfo[senderID]?.name || "User"; } catch (e) {}

            if (!arr) {
                const msgs = [
                    "বেশি Bot Bot করলে leave নিবো কিন্তু! 😒😒", "শুনবো না😼 তুমি আমার বাদল ভাই কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
                    "Bolo Babu, তুমি কি আমার বাদল ভাই কে ভালোবাসো? 🙈💋", "I love you janu! 🥰", "আরে বলদ, এতো ডাকিস কেন? 🤬",
                    "আসসালামু আলাইকুম, বলুন আপনার জন্য কি করতে পারি? 🥰", "আমাকে না ডেকে মেয়ে হলে বাদল ভাই এর ইনবক্সে চলে যা 🌚😂",
                    "আমাকে বট না বলে, বাদল ভাই কে জানু বল জানু 😘", "আমাকে ডেকো না,আমি বাদল ভাই এর সাথে ব্যাস্ত আছি",
                    "আমার বাদল ভাই এর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶", "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
                    "হ্যাঁ জানু, এইদিক এ আসো কিস দেই🤭 😘", "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
                    "তোর কথা তোর বাড়ি কেউ শুনে না,তো আমি কোনো শুনবো?🤔😂", "জান মেয়ে হলে বাদল ভাই এর ইনবক্সে চলে যাও 😍🫣💕",
                    "হা বলো, শুনছি আমি 😏", "আর কত বার ডাকবি,শুনছি তো", "বলো জানু 🌚", "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
                    "হুম জান তোমার ওই খানে উম্মহ😑😘", "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘", "jang hanga korba😒😬",
                    "আমি এখন বাদল ভাই এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏", "আমাকে না ডেকে আমার বাদল ভাই কে একটা জি এফ দাও-😽🫶🌺",
                    "ঝাং থুমালে আইলাপিউ পেপি-💝😽", "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
                    "জান তোমার বান্ধবী রে আমার বাদল ভাই এর হাতে তুলে দিবা-🙊🙆‍♂", "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
                    "ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦", "চুনা ও চুনা আমার বাদল ভাই এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
                    "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻", "জান হাঙ্গা করবা-🙊😝🌻",
                    "তোদের জন্য একটুও শান্তি নাই! শুধু ডিস্টার্ব করিস 😿", "জান মেয়ে হলে চিপায় আসো বাদল ভাই এর থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
                    "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼", "ভালোবাসা করতে চাইলে বস বাদল ভাই এর ইনবক্স যাও-🙊🥱👅",
                    "আমার জান তুমি শুধু আমার 💝", "কিরে প্রেম করবি তাহলে বস বাদল ভাই এর ইনবক্সে গুতা দে 😘",
                    "জান আমার বস বাদল ভাই কে বিয়ে করবা-🙊😘🥳", "ওই বেডা চুপ থাক, নাইলে বাদল ভাই রে বলে দিমু 😾",
                    "তোরে দেখলেই আমার BP হাই হয়ে যায় 😵‍💫", "আমি কি তোর চাকর? খালি ডাকিস কেন 😒",
                    "বাদল ভাই বলছে তোরে পাত্তা না দিতে 🙄", "তোর নাকি গার্লফ্রেন্ড নাই? বাদল ভাই এর কাছে আয় শিখাই দিবে 😂",
                    "এত ডাকাডাকি করিস না, আমি সিঙ্গেল না 😏 বাদল ভাই আছে", "তুই কি হিরো আলম? এত ভাব নিস কেন 🤡",
                    "আমার বাদল ভাই তোর থেকে 100 গুণ হ্যান্ডসাম 😎", "তোরে ব্লক মারমু কিন্তু, বেশি জ্বালাইলে 😤",
                    "বাদল ভাই এর সাথে লুডু খেলতেছি, ডিস্টার্ব করিস না 🎲", "তোর কপালে প্রেম নাই, বাদল ভাই এর দোয়া নে 😇"
                ];
                const finalMsg = `${name}, ${msgs[Math.floor(Math.random() * msgs.length)]}`;
                return api.sendMessage({ body: finalMsg, mentions: [{ tag: name, id: senderID }] }, threadID, (err, info) => {
                    if (!err) global.msgCache.set(info.messageID, { body: finalMsg, senderID: api.getCurrentUserID(), attachments: [], commandName: module.exports.config.name });
                }, messageID);
            }
            try {
                const res = await axios.get(`${link}/baby?text=${encodeURIComponent(arr)}&senderID=${senderID}&font=1`);
                const finalMsg = `${name}, ${res.data.reply}`;
                return api.sendMessage({ body: finalMsg, mentions: [{ tag: name, id: senderID }] }, threadID, (err, info) => {
                    if (!err) global.msgCache.set(info.messageID, { body: finalMsg, senderID: api.getCurrentUserID(), attachments: [], commandName: module.exports.config.name });
                }, messageID);
            } catch (e) { console.error("Catbot Error: " + e.message); }
        }
    },

    onReply: async (api, event) => {
        const cache = global.msgCache.get(event.messageReply.messageID);
        if (!cache || cache.commandName !== module.exports.config.name) return;
        try {
            const { threadID, messageID, senderID } = event;
            let name = "User";
            try { const uInfo = await api.getUserInfo(senderID); name = uInfo[senderID]?.name || "User"; } catch (e) {}
            const res = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body)}&senderID=${senderID}&font=1`);
            const finalMsg = `${name}, ${res.data.reply}`;
            return api.sendMessage({ body: finalMsg, mentions: [{ tag: name, id: senderID }] }, threadID, (err, info) => {
                if (!err) global.msgCache.set(info.messageID, { body: finalMsg, senderID: api.getCurrentUserID(), attachments: [], commandName: module.exports.config.name });
            }, messageID);
        } catch (err) { api.sendMessage("Error: " + err.message, event.threadID); }
    }
};
