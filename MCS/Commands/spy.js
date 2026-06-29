const fs = require("fs-extra");
const request = require("request");
const axios = require("axios");

module.exports.config = {
    name: "spy",
    version: "1.3.0",
    credit: "MOHAMMAD BADOL",
    prefix: false,
    role: 0,
    cooldown: 5,
    description: "Facebook user information",
    aliases: ["uidinfo", "whois", "userinfo"]
};

module.exports.onStart = async (api, event, args) => {
    const cachePath = __dirname + "/cache/";
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

    let uid;

    try {
        if (event.type === "message_reply") {
            uid = event.messageReply.senderID;
        }
        else if (Object.keys(event.mentions).length > 0) {
            uid = Object.keys(event.mentions)[0];
        }
        else if (args[0] && args[0].includes(".com/")) {
            uid = await api.getUID(args[0]);
        }
        else if (args[0] &&!isNaN(args[0])) {
            uid = args[0];
        }
        else {
            uid = event.senderID;
        }

        const userInfo = await api.getUserInfo(uid);
        const info = userInfo[uid];

        if (!info) return api.sendMessage("❌ ইউজার খুঁজে পাওয়া যায়নি!", event.threadID, event.messageID);

        const name = info.name || "Unknown";
        const firstName = info.firstName || name.split(" ")[0];
        const friend = info.isFriend? "Yes ❤️" : "No 💔";
        const profileUrl = info.profileUrl || `https://facebook.com/${uid}`;

        let gender = "Private ❌";

        try {
            const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
            const res = await axios.get(
                `https://graph.facebook.com/${uid}?fields=gender&access_token=${token}`
            );

            if (res.data.gender === "male") gender = "Male ♂️";
            else if (res.data.gender === "female") gender = "Female ♀️";
        } catch (e) {
            gender = "Private ❌";
        }

        const callback = () => {
            api.sendMessage(
                {
                    body: `╭──────────────────╮\n 👤 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n╰──────────────────╯\n\n🆔 𝗜𝗗: ${uid}\n📛 𝗡𝗮𝗺𝗲: ${name}\n🧑 𝗙𝗶𝗿𝘀𝘁 𝗡𝗮𝗺𝗲: ${firstName}\n⚧ 𝗚𝗲𝗻𝗱𝗲𝗿: ${gender}\n🤝 𝗙𝗿𝗶𝗲𝗻𝗱: ${friend}\n🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${profileUrl}\n\n┗━━━━━━━━━━━━━━━━┛`,
                    attachment: fs.createReadStream(cachePath + `${uid}.png`)
                },
                event.threadID,
                () => fs.unlinkSync(cachePath + `${uid}.png`),
                event.messageID
            );
        };

        const picUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        request(encodeURI(picUrl))
           .pipe(fs.createWriteStream(cachePath + `${uid}.png`))
           .on("close", () => callback())
           .on("error", () => api.sendMessage("❌ ছবি লোড করতে সমস্যা হচ্ছে!", event.threadID, event.messageID));

    } catch (err) {
        console.log(err);
        return api.sendMessage("❌ ইউজার খুঁজে পাওয়া যায়নি! মেনশন/রিপ্লাই/লিংক/UID দাও।", event.threadID, event.messageID);
    }
};
