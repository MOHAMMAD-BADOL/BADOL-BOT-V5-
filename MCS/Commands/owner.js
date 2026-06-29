const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "owner",
    aliases: ["dev", "developer", "info"],
    version: "5.4.0",
    role: 0,
    credit: "MOHAMMAD BADOL",
    prefix: true,
    description: "Bot Owner এর পার্সোনাল ইনফরমেশন",
    category: "Info",
    cooldown: 5
};

module.exports.onStart = async function (api, event) {
    const { threadID, messageID } = event;
    const ownerDataPath = path.join(__dirname, "B4D9L/owner.json");
    
    try {
        const data = JSON.parse(fs.readFileSync(ownerDataPath, "utf-8"));
        
        const msgBody = `╭─── [ OWNER INFO ] ───╮
│ 👤 DEVELOPER PROFILE
│ • Name: ${data.Profile.Name}
│ • Age: ${data.Profile.Age}
│ • Religion: ${data.Profile.Religion}
│ • Role: ${data.Profile.Role}
│ • User: ${data.Profile.User}
│ • Home: ${data.Profile.Home}
│ • Base: ${data.Profile.Base}
│ • Exp: ${data.Profile.Experience}
│ • Nick: ${data.Profile.Nickname}
├──────────────────────┤
│ 📱 DIRECT CONTACT
│ • FB: ${data.Contact.Facebook}
│ • TG: ${data.Contact.Telegram}
│ • WA: ${data.Contact.WhatsApp}
│ • GitHub: ${data.Contact.GitHub}
│ • Email: ${data.Contact.Email}
├──────────────────────┤
│ 🚀 PUBLIC BOT LINK
│ • V5: ${data["Public Bot Link"]["BADOL-BOT-V5"]}
├──────────────────────┤
│ 🤖 TELEGRAM BOTS
│ • Personal: ${data.Telegram_Bots.Personal_Bot}
│ • Video: ${data.Telegram_Bots.Video}
╰──────────────────────╯
👑 Developed By: ${data.Profile.Name}`;

        const cacheDir = path.join(__dirname, "cache");
        const imgPath = path.join(cacheDir, `owner_${threadID}.jpg`);

        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const imgUrl = `https://drive.google.com/uc?export=view&id=${data.imageID}`;
        const response = await axios({
            method: "GET",
            url: imgUrl,
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imgPath);
        response.data.pipe(writer);

        writer.on("finish", () => {
            api.sendMessage({
                body: msgBody,
                attachment: fs.createReadStream(imgPath)
            }, threadID, () => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }, messageID);
        });

        writer.on("error", () => {
            api.sendMessage(msgBody, threadID, messageID);
        });

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ Error: ফাইলটি লোড করতে সমস্যা হচ্ছে বা JSON ফরম্যাট ভুল আছে।", threadID, messageID);
    }
};