const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "fbcover",
    aliases: ["cover", "er"],
    version: "5.3.0",
    credit: "MOHAMMAD BADOL",
    role: 0,
    cooldown: 10,
    prefix: true,
    description: "Facebook cover system new updete"
};

// 🟢 ফিক্স: api, event, args আলাদা প্যারামিটার
module.exports.onStart = async function (api, event, args) {
    const { threadID, messageID, senderID } = event;

    let targetId = senderID;
    if (Object.keys(event.mentions).length > 0) {
        targetId = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
        targetId = event.messageReply.senderID;
    }

    const fullInput = args.join(" ");
    const fontPath = path.join(process.cwd(), 'BADOL-Main', 'fonts', 'Badol_1.ttf');
    let fontName = "Sans-Serif";

    if (fs.existsSync(fontPath)) {
        try {
            registerFont(fontPath, { family: "BadolFont" });
            fontName = "BadolFont";
        } catch (e) {
            console.log("Font registration failed:", e.message);
        }
    }

    if (!fullInput ||!fullInput.includes("-")) {
        const errorBox = `┏━━━━━━━━━━━━━━━━━━┓\n 🛑 INVALID FORMAT 🛑\n┗━━━━━━━━━━━━━━━━━━┛\n✨ USE:\n/fbcover Name - Age - Address - Email - FB - Bio\n\n💡 EXAMPLE:\n/fbcover MOHAMMAD BADOL - 28 - KHULNA - badol@gmail.com - fb/B4D9L - Bot Developer\n\n📝 3 WAYS TO USE:\n1. /fbcover info... = Your cover\n2. Reply + /fbcover info... = Their cover\n3. /fbcover info... @user = Mentioned user cover\n━━━━━━━━━━━━━━━━━━━━━━━━━\n🛠 DEV: MOHAMMAD BADOL`;
        return api.sendMessage(errorBox, threadID, messageID);
    }

    const parts = fullInput.split("-").map(item => item.trim());
    const uData = {
        name: parts[0] || "N/A",
        age: parts[1] || "N/A",
        home: parts[2] || "N/A",
        email: parts[3] || "N/A",
        fb: parts[4] || "N/A",
        bio: parts[5] || "N/A"
    };

    const loadingMsg = await api.sendMessage(
        `┏━━━━━━━━━━━━━━━━━━━━┓\n ⏳ GENERATING COVER ⏳\n┗━━━━━━━━━━━━━━━━━━━┛\n✨ Creating premium cover...\n👤 Target: ${uData.name}\n━━━━━━━━━━━━━━━━━━━━━━━`,
        threadID,
        messageID
    );

    try {
        const bgPath = path.join(__dirname, "B4D9L", "fb.png");

        if (!fs.existsSync(bgPath)) {
            await api.unsendMessage(loadingMsg.messageID).catch(() => {});
            return api.sendMessage("❌ Background image not found!\n📂 Path: MCS/Commands/B4D9L/fb.png", threadID, messageID);
        }

        const bgImg = await loadImage(bgPath);
        const canvas = createCanvas(1640, 856);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, 1640, 856);

        const dpX = 115, dpY = 165, dpSize = 600;
        let dpLoaded = false;

        try {
            const hdUrl = `https://graph.facebook.com/${targetId}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
            const response = await axios.get(hdUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
            if (response.data.byteLength > 1000) {
                const userImg = await loadImage(Buffer.from(response.data));
                ctx.save();
                ctx.beginPath();
                ctx.arc(dpX + dpSize/2, dpY + dpSize/2, dpSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(userImg, dpX, dpY, dpSize, dpSize);
                ctx.restore();
                dpLoaded = true;
            }
        } catch (e) {}

        if (!dpLoaded) {
            try {
                const userInfo = await api.getUserInfo(targetId);
                if (userInfo[targetId]?.profileUrl) {
                    const url = userInfo[targetId].profileUrl + '&width=720&height=720';
                    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
                    const userImg = await loadImage(Buffer.from(response.data));
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(dpX + dpSize/2, dpY + dpSize/2, dpSize/2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(userImg, dpX, dpY, dpSize, dpSize);
                    ctx.restore();
                    dpLoaded = true;
                }
            } catch (e) {}
        }

        if (!dpLoaded) {
            try {
                const userInfo = await api.getUserInfo(targetId);
                if (userInfo[targetId]?.thumbSrc) {
                    const response = await axios.get(userInfo[targetId].thumbSrc, { responseType: 'arraybuffer', timeout: 8000 });
                    const userImg = await loadImage(Buffer.from(response.data));
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(dpX + dpSize/2, dpY + dpSize/2, dpSize/2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(userImg, dpX, dpY, dpSize, dpSize);
                    ctx.restore();
                    dpLoaded = true;
                }
            } catch (e) {}
        }

        if (!dpLoaded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(dpX + dpSize/2, dpY + dpSize/2, dpSize/2, 0, Math.PI * 2);
            ctx.fillStyle = "#1a1a1a";
            ctx.fill();
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.fillStyle = "#FFD700";
            ctx.font = `bold 50px "${fontName}"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("NO DP", dpX + dpSize/2, dpY + dpSize/2);
            ctx.restore();
        }

        ctx.shadowBlur = 12;
        ctx.shadowColor = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        const startX = 850;
        let startY = 280;
        const gap = 65;

        ctx.font = `bold 65px "${fontName}"`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("OWNER PROFILE", startX, 180);

        ctx.font = `bold 34px "${fontName}"`;
        const fields = [
            { label: "NAME", val: uData.name, color: "#FFD700" },
            { label: "BORN", val: uData.age, color: "#FFFFFF" },
            { label: "HOME", val: uData.home, color: "#00FF00" },
            { label: "MAIL", val: uData.email, color: "#FF00FF" },
            { label: "LINK", val: uData.fb, color: "#FFA500" },
            { label: "BIO ", val: uData.bio, color: "#7CFC00" }
        ];

        fields.forEach((f, i) => {
            ctx.fillStyle = f.color;
            ctx.fillText(`⚡ ${f.label}: [ ${f.val} ]`, startX, startY + (i * gap));
        });

        ctx.font = `bold 25px Arial`;
        ctx.fillStyle = "#00E5FF";
        ctx.fillText(`USER ID: ${targetId}`, 850, 750);
        ctx.fillText(`BADOL-BOT-V5: V-17.1.0`, 1300, 750);

        const outPath = path.join(__dirname, `cover_${targetId}.png`);
        fs.writeFileSync(outPath, canvas.toBuffer('image/png'));

        const dpStatus = dpLoaded? "HD Enabled" : "Default Avatar";
        const successBox = `┏━━━━━━━━━━━━━━━━━━━━━┓\n 👑 FB COVER GENERATED 👑\n┗━━━━━━━━━━━━━━━━━━━━━┛\n✅ SUCCESS!\n\n👤 Owner: ${uData.name}\n🆔 User ID: ${targetId}\n⚙️ Status: ${dpStatus}\n━━━━━━━━━━━━━━━━━━━━━━━\n🛠 DEV: MOHAMMAD BADOL`;

        await api.unsendMessage(loadingMsg.messageID).catch(() => {});
        await api.sendMessage({
            body: successBox,
            attachment: fs.createReadStream(outPath)
        }, threadID, messageID);

        fs.unlinkSync(outPath);

    } catch (e) {
        console.error("Error:", e);
        await api.unsendMessage(loadingMsg.messageID).catch(() => {});
        return api.sendMessage("❌ ERROR: Failed to generate cover.", threadID, messageID);
    }
};
