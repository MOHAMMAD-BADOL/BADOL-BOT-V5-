const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

// 🔥 10 টা বাংলা ফন্ট রেনডম সাপোর্ট
const fontsDir = path.join(__dirname, "../../BADOL-Main/fonts");
const loadedFonts = [];

console.log(`[UID] Checking fonts at: ${fontsDir}`);

if (fs.existsSync(fontsDir)) {
    const fontFiles = fs.readdirSync(fontsDir).filter(file => 
        file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf')
    );
    
    console.log(`[UID] Found ${fontFiles.length} fonts`);
    
    fontFiles.forEach((file, index) => {
        try {
            const fontPath = path.join(fontsDir, file);
            const fontName = `Font${index}`;
            registerFont(fontPath, { family: fontName });
            loadedFonts.push(fontName);
            console.log(`[UID] ✅ ${file}`);
        } catch (e) {
            console.log(`[UID] ❌ ${file}: ${e.message}`);
        }
    });
}

function getRandomFont() {
    if (loadedFonts.length === 0) return 'sans-serif';
    return loadedFonts[Math.floor(Math.random() * loadedFonts.length)];
}

module.exports.config = {
    name: "uid",
    version: "15.1.0",
    role: 0,
    credit: "MOHAMMAD BADOL",
    description: "UID Card - Cyberpunk Design",
    commandCategory: "info",
    usages: "uid [@mention/reply/uid]",
    cooldown: 5,
    prefix: true,
    aliases: ["id", "userid"]
};

module.exports.onStart = async function (api, event, args) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    const cacheDir = path.join(__dirname, "../cache");
    const cachePath = path.join(cacheDir, `uid_${Date.now()}.png`);
    
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let targetID = senderID;
    if (messageReply) targetID = messageReply.senderID;
    else if (mentions && Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (args[0] && !isNaN(args[0])) targetID = args[0];

    const msg = await api.sendMessage("🧸", threadID);

    try {
        let name = "Facebook User";
        try {
            const userInfo = await api.getUserInfo(targetID);
            name = userInfo[targetID]?.name || "Facebook User";
        } catch (e) {}

        const randomFont = getRandomFont();
        const username = name.toUpperCase();
        console.log(`[UID] Using: ${randomFont} for ${name}`);

        const width = 1200;
        const height = 500;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // 🔥 তোমার দেওয়া ডিজাইন - Background
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, width, height);

        // Grid Lines
        ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
        ctx.lineWidth = 2;

        for (let i = 0; i < width; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        for (let i = 0; i < height; i += 60) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Gradient Shapes
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#00f260");
        gradient.addColorStop(1, "#0575e6");

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(300, 0);
        ctx.lineTo(250, 50);
        ctx.lineTo(0, 50);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width, height);
        ctx.lineTo(width - 300, height);
        ctx.lineTo(width - 250, height - 50);
        ctx.lineTo(width, height - 50);
        ctx.fill();

        // Avatar - Hexagon
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        let avatarBuffer;
        try {
            const response = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 10000 });
            avatarBuffer = response.data;
        } catch (e) {
            const fallbackUrl = `https://graph.facebook.com/${targetID}/picture?type=large`;
            const response = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
            avatarBuffer = response.data;
        }

        const avatarImg = await loadImage(avatarBuffer);

        const centerX = 250;
        const centerY = 250;
        const hexSize = 160;

        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(
                centerX + hexSize * Math.cos(i * 2 * Math.PI / 6),
                centerY + hexSize * Math.sin(i * 2 * Math.PI / 6)
            );
        }
        ctx.closePath();

        ctx.lineWidth = 10;
        ctx.strokeStyle = "#00ffff";
        ctx.stroke();
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 30;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.clip();
        ctx.drawImage(
            avatarImg,
            centerX - hexSize,
            centerY - hexSize,
            hexSize * 2,
            hexSize * 2
        );
        ctx.restore();

        // 🔥 রেনডম বাংলা ফন্টে নাম
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 80px "${randomFont}", Arial`;
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 10;
        ctx.fillText(username.substring(0, 15), 480, 200);

        ctx.fillStyle = "#00ffff";
        ctx.font = "bold 40px Courier New";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 15;
        ctx.fillText(`UID: ${targetID}`, 480, 270);

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "30px Courier New";
        ctx.shadowBlur = 0;
        ctx.fillText("/// IDENTITY VERIFIED ///", 480, 330);
        ctx.fillText("POWERED BY: BADOL_BOT", 480, 370);

        // Glitch Bars
        ctx.fillStyle = "#ffffff";
        for (let k = 0; k < 20; k++) {
            let w = Math.random() * 10 + 2;
            ctx.fillRect(480 + k * 20, 400, w, 20);
        }

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(cachePath, buffer);

        api.unsendMessage(msg.messageID);
        
        // 🔥 ক্যাপশনে শুধু UID
        return api.sendMessage({
            body: targetID,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (error) {
        api.unsendMessage(msg.messageID);
        console.log("[UID] Error:", error);
        return api.sendMessage(targetID, threadID, messageID);
    }
};

