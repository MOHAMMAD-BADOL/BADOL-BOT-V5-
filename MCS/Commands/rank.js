const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

module.exports.config = {
    name: "rankup",
    version: "3.1.0",
    role: 0,
    credit: "MOHAMMAD BADOL",
    description: "Auto level up system + rank check",
    commandCategory: "system",
    usages: "/rank [@mention/reply]",
    cooldown: 3,
    prefix: true,
    aliases: ["rank", "level", "exp"]
};

const LEVELS = [
    { exp: 0, level: 0, title: "Newbie" },
    { exp: 50, level: 1, title: "Rookie" },
    { exp: 150, level: 2, title: "Member" },
    { exp: 300, level: 3, title: "Active" },
    { exp: 500, level: 4, title: "Bronze" },
    { exp: 800, level: 5, title: "Silver" },
    { exp: 1200, level: 6, title: "Gold" },
    { exp: 1700, level: 7, title: "Platinum" },
    { exp: 2300, level: 8, title: "Diamond" },
    { exp: 3000, level: 9, title: "Master" },
    { exp: 4000, level: 10, title: "Grandmaster" },
    { exp: 5500, level: 11, title: "Legend" },
    { exp: 7500, level: 12, title: "Mythic" },
    { exp: 10000, level: 13, title: "Immortal" },
    { exp: 15000, level: 14, title: "Godlike" },
    { exp: 25000, level: 15, title: "BADOL VIP" }
];

const getRankPath = () => {
    const dataDir = path.join(__dirname, "B4D9L");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    return path.join(dataDir, "rankData.json");
};

const loadRankData = () => {
    try {
        return JSON.parse(fs.readFileSync(getRankPath(), "utf-8"));
    } catch (e) { return {}; }
};

const saveRankData = (data) => {
    fs.writeFileSync(getRankPath(), JSON.stringify(data, null, 4));
};

const generateRankCard = (targetID, user, allUsers, isLevelUp = false) => {
    return new Promise(async (resolve) => {
        try {
            const userRank = Object.entries(allUsers)
                .sort(([, a], [, b]) => b.exp - a.exp)
                .findIndex(([id]) => id == targetID) + 1;

            let currentTitle = "Newbie";
            let nextExp = 50;
            let currentLevelExp = 0;

            for (let i = 0; i < LEVELS.length; i++) {
                if (user.level === LEVELS[i].level) {
                    currentTitle = LEVELS[i].title;
                    currentLevelExp = LEVELS[i].exp;
                    nextExp = LEVELS[i + 1] ? LEVELS[i + 1].exp : user.exp;
                    break;
                }
            }

            const progressExp = user.exp - currentLevelExp;
            const totalNeeded = typeof nextExp === "number" ? nextExp - currentLevelExp : progressExp;
            const progress = typeof nextExp === "number" ? (progressExp / totalNeeded) * 100 : 100;

            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext("2d");

            const gradient = ctx.createLinearGradient(0, 0, 800, 400);
            gradient.addColorStop(0, "#0f0c29");
            gradient.addColorStop(0.5, "#302b63");
            gradient.addColorStop(1, "#24243e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 400);

            ctx.strokeStyle = "#ff6b6b";
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, 780, 380);

            try {
                const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const response = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 5000 });
                const avatar = await loadImage(Buffer.from(response.data));
                ctx.save();
                ctx.beginPath();
                ctx.arc(120, 120, 80, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 40, 40, 160, 160);
                ctx.restore();
                ctx.strokeStyle = "#ff6b6b";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(120, 120, 83, 0, Math.PI * 2);
                ctx.stroke();
            } catch (e) {
                ctx.fillStyle = "#ff6b6b";
                ctx.beginPath();
                ctx.arc(120, 120, 80, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 36px Arial";
            ctx.fillText(user.name.slice(0, 20), 230, 70);
            ctx.fillStyle = "#ff6b6b";
            ctx.font = "bold 28px Arial";
            ctx.fillText(`Rank #${userRank}`, 230, 110);
            ctx.fillStyle = "#ffd93d";
            ctx.font = "bold 32px Arial";
            ctx.fillText(`Level ${user.level} [${currentTitle}]`, 230, 150);
            ctx.fillStyle = "#16213e";
            ctx.fillRect(230, 190, 500, 45);
            ctx.fillStyle = "#6bcf7f";
            ctx.fillRect(230, 190, (500 * progress) / 100, 45);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`${user.exp} / ${nextExp} XP`, 480, 218);
            ctx.textAlign = "left";
            ctx.fillStyle = "#ffffff";
            ctx.font = "22px Arial";
            ctx.fillText(`💬 Messages: ${user.msgCount}`, 230, 275);
            ctx.fillText(`⭐ Total EXP: ${user.exp}`, 230, 310);

            if (isLevelUp) {
                ctx.fillStyle = "#00ff00";
                ctx.font = "bold 36px Arial";
                ctx.textAlign = "center";
                ctx.fillText("🎉 LEVEL UP! 🎉", 480, 380);
            }

            const tempPath = path.join(__dirname, "B4D9L", `rank_${Date.now()}.png`);
            fs.writeFileSync(tempPath, canvas.toBuffer("image/png"));
            resolve(tempPath);
        } catch (e) { resolve(null); }
    });
};

module.exports.onChat = async function (api, event) {
    if (!event || !event.senderID) return;
    const { threadID, senderID, body } = event;
    if (senderID == api.getCurrentUserID() || !body) return;

    const rankData = loadRankData();
    if (!rankData[senderID]) {
        rankData[senderID] = { exp: 0, level: 0, name: "", msgCount: 0 };
    }

    const user = rankData[senderID];
    user.exp += Math.floor(Math.random() * 6) + 5;
    user.msgCount += 1;

    try {
        if (!user.name) {
            const u = await api.getUserInfo(senderID);
            user.name = u[senderID]?.name || "User";
        }
    } catch (e) {}

    if (user.msgCount % 40 === 0) {
        let newLevel = 0;
        let newTitle = "Newbie";
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (user.exp >= LEVELS[i].exp) {
                newLevel = LEVELS[i].level;
                newTitle = LEVELS[i].title;
                break;
            }
        }

        if (newLevel > user.level) {
            user.level = newLevel;
            saveRankData(rankData);
            const path = await generateRankCard(senderID, user, rankData, true);
            if (path) {
                api.sendMessage({ body: `🎉 অভিনন্দন ${user.name}! আপনি লেভেল ${user.level} এ পৌঁছেছেন!`, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path));
            }
        } else { saveRankData(rankData); }
    } else { saveRankData(rankData); }
};

module.exports.onStart = async function (api, event, args) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    let targetID = messageReply ? messageReply.senderID : (mentions && Object.keys(mentions)[0]) || senderID;
    const rankData = loadRankData();
    const user = rankData[targetID];

    if (!user) return api.sendMessage("❌ ডেটা পাওয়া যায়নি!", threadID, messageID);

    const path = await generateRankCard(targetID, user, rankData, false);
    if (path) {
        api.sendMessage({ body: `📊 Rank Card: ${user.name}`, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);
    }
};

module.exports.onLoad = function () {
    console.log("[BADOL-BOT-V5] Rankup System Active");
};
