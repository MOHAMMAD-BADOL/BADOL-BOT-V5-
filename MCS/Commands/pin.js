const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "pin",
    version: "1.0.0",
    role: 0,
    credit: "MOHAMMAD BADOL",
    description: "Pinterest search",
    commandCategory: "media",
    usages: "pin <text> [limit]",
    cooldown: 5,
    prefix: true,
    aliases: ["pinterest"]
};

// আপনার সিস্টেম অনুযায়ী আর্গুমেন্ট রিসিভ করার সঠিক ফরম্যাট
module.exports.onStart = async function (api, event, args) {
    // এখানে অবজেক্ট ডিস্ট্রাকচারিং না করে সরাসরি event থেকে ভ্যালু নেওয়া হয়েছে
    const threadID = event.threadID;
    const messageID = event.messageID;
    
    let query = args.join(" ");
    let limit = 6;

    const lastArg = parseInt(args[args.length - 1]);
    if (!isNaN(lastArg)) {
        limit = lastArg;
        query = args.slice(0, -1).join(" ");
    }

    if (!query) {
        return api.sendMessage("❌ | Please provide a search query.\nExample: /pin cat 5", threadID, messageID);
    }

    const searchingMsg = await api.sendMessage(`🔍 Searching for "${query}"...`, threadID);

    try {
        const configJson = await axios.get("https://raw.githubusercontent.com/SAGOR-OFFICIAL-09/api/refs/heads/main/ApiUrl.json");
        const apiBase = configJson.data.apis.pinterest;
        const res = await axios.get(`${apiBase}/sagor?q=${encodeURIComponent(query)}&limit=${limit}&apikey=sagor`);
        
        const images = res.data.images;
        if (!images || images.length === 0) {
            return api.sendMessage("❌ | No results found.", threadID, messageID);
        }

        const imgData = [];
        const dir = path.join(__dirname, "cache");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        for (let i = 0; i < Math.min(images.length, limit); i++) {
            const filePath = path.join(dir, `pin_${i}.jpg`);
            try {
                const imageResponse = await axios.get(images[i], { responseType: 'arraybuffer', timeout: 5000 });
                if (imageResponse.data.byteLength < 6000) continue;
                fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
                imgData.push(fs.createReadStream(filePath));
            } catch (e) { continue; }
        }

        if (imgData.length === 0) {
            return api.sendMessage("❌ | Failed to download images.", threadID, messageID);
        }

        const msg = `┌───────────────┐\n` +
                    `  📌 PINTEREST RESULTS\n` +
                    `└───────────────┘\n` +
                    `🔎 Query: ${query}\n` +
                    `🔢 Count: ${imgData.length}\n` +
                    `━━━━━━━━━━━━━━━━━\n` +
                    `🤖 Powered by: BADOL-BOT-V5`;

        api.sendMessage({ body: msg, attachment: imgData }, threadID, (err) => {
            if (err) return;
            imgData.forEach(stream => { try { fs.unlinkSync(stream.path); } catch (e) {} });
        }, messageID);
        
        api.unsendMessage(searchingMsg.messageID);

    } catch (err) {
        api.sendMessage("❌ | Server error! Please try again later.", threadID, messageID);
        api.unsendMessage(searchingMsg.messageID);
    }
};
