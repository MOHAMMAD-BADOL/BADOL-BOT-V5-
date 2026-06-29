const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
  name: "hack",
  version: "1.0.1",
  role: 0,
  credit: "MOHAMMAD BADOL",
  description: "Fake ID hack image বানায় reply/tag দিয়ে",
  prefix: true,
  category: "Fun",
  aliases: ["hacked"],
  usages: "[@tag | reply]",
  cooldown: 5
};

try {
  registerFont(path.join(__dirname, "B4D9L", "BeVietnamPro.ttf"), { family: "BeVietnamPro" });
} catch (e) {}

module.exports.wrapText = async (ctx, text, maxWidth) => {
  if (ctx.measureText(text).width <= maxWidth) return [text];
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const testLine = line? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

// 🔥 ঠিক করা হইছে: onStart = async function (api, event, args)
module.exports.onStart = async function (api, event, args) {
  const { threadID, messageID, senderID, messageReply, type, mentions } = event;

  const cacheDir = path.join(__dirname, "B4D9L");
  const pathImg = path.join(cacheDir, `hack_${Date.now()}_${senderID}.png`);
  await fs.ensureDir(cacheDir);

  let id = type == "message_reply"? messageReply.senderID
         : Object.keys(mentions).length > 0? Object.keys(mentions)[0]
         : senderID;

  try {
    const userInfo = await api.getUserInfo(id);
    const name = userInfo[id].name;

    const bgURL = "https://drive.google.com/uc?export=download&id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ";
    const [avatarRes, bgRes] = await Promise.all([
      axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
        timeout: 10000
      }).catch(() => axios.get(`https://graph.facebook.com/${id}/picture?type=large`, { responseType: "arraybuffer" })),
      axios.get(bgURL, { responseType: "arraybuffer", timeout: 15000 })
    ]);

    const baseImage = await loadImage(bgRes.data);
    const avatar = await loadImage(avatarRes.data);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0);

    ctx.font = "400 23px BeVietnamPro, Arial";
    ctx.fillStyle = "#1878F3";
    ctx.textAlign = "start";
    const lines = await this.wrapText(ctx, name, 1160);
    ctx.fillText(lines.join('\n'), 200, 497);

    ctx.save();
    ctx.beginPath();
    ctx.arc(133, 487, 50, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 83, 437, 100, 100);
    ctx.restore();

    await fs.writeFile(pathImg, canvas.toBuffer("image/png"));

    return api.sendMessage({
      body: `✅ ${name} এর আইডি হ্যাক সাকসেসফুল!`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => {
      fs.unlink(pathImg).catch(() => {});
    }, messageID);

  } catch (err) {
    console.log("[HACK CMD ERROR]", err);
    return api.sendMessage("❌ হ্যাক করতে গিয়ে এরর খাইছি বেটা, আবার ট্রাই কর।", threadID, messageID);
  }
};
