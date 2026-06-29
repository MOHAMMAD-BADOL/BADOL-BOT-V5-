const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { Jimp } = require("jimp");

module.exports.config = {
  name: "fuck",
  version: "1.0.5",
  role: 0,
  credit: "MOHAMMAD BADOL",
  description: "Mention করা ইউজারের সাথে 'fuck' meme বানায়",
  prefix: true,
  category: "fun",
  aliases: ["fucku"],
  usages: "@mention",
  cooldown: 5
};

module.exports.onLoad = async ({ api }) => {
  const dir = path.join(__dirname, "B4D9L");
  await fs.ensureDir(dir);
  const imgPath = path.join(dir, "fuckv2.png");

  if (!fs.existsSync(imgPath)) {
    try {
      console.log(" Downloading background to B4D9L...");
      const img = (await axios.get("https://drive.google.com/uc?id=1DEVtK3nSegoSjT4VsXMhnkEO3Sct9sgz", {
        responseType: "arraybuffer",
        timeout: 20000
      })).data;
      await fs.writeFile(imgPath, Buffer.from(img));
      console.log(" Background downloaded to B4D9L ✅");
    } catch (e) {
      console.log(" Background download failed:", e.message);
    }
  }
};

async function circle(image) {
  const img = await Jimp.read(image);
  img.circle();
  return await img.getBuffer("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.join(__dirname, "B4D9L");
  const bgPath = path.join(dir, "fuckv2.png");
  
  if (!fs.existsSync(bgPath)) {
    throw new Error("fuckv2.png পাই নাই B4D9L ফোল্ডারে");
  }

  const pathImg = path.join(dir, `fuck_${one}_${two}_${Date.now()}.png`);
  const avatarOnePath = path.join(dir, `avt_${one}.png`);
  const avatarTwoPath = path.join(dir, `avt_${two}.png`);

  const getAvatar = async (uid, savePath) => {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer", timeout: 10000 }
      );
      await fs.writeFile(savePath, res.data);
    } catch {
      const res = await axios.get(`https://graph.facebook.com/${uid}/picture?type=large`, { responseType: "arraybuffer" });
      await fs.writeFile(savePath, res.data);
    }
  };

  await Promise.all([
    getAvatar(one, avatarOnePath),
    getAvatar(two, avatarTwoPath)
  ]);

  const bg = await Jimp.read(bgPath);
  const circOne = await Jimp.read(await circle(avatarOnePath));
  const circTwo = await Jimp.read(await circle(avatarTwoPath));

  // 🔥 jimp v1.x এ resize({ w: 180, h: 180 }) ইউজ করতে হয়
  bg.composite(circOne.resize({ w: 180, h: 180 }), 190, 200);
  bg.composite(circTwo.resize({ w: 180, h: 180 }), 390, 200);

  const finalImg = await bg.getBuffer("image/png");
  await fs.writeFile(pathImg, finalImg);

  fs.unlink(avatarOnePath).catch(() => {});
  fs.unlink(avatarTwoPath).catch(() => {});

  return pathImg;
}

module.exports.onStart = async function (api, event, args) {
  const mention = Object.keys(event.mentions);
  const { threadID, messageID, senderID } = event;

  if (mention.length === 0) {
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n│ ⚠️ একজনকে মেনশন দাও!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }

  const one = senderID;
  const two = mention[0];

  if (one === two) {
    return api.sendMessage(`😏 নিজের সাথে না, অন্যকে মেনশন দাও বেটা`, threadID, messageID);
  }

  try {
    const imgPath = await makeImage({ one, two });
    return api.sendMessage(
      {
        body:
          `╭╼|━━━━━━━━━━━━━━|╾╮\n` +
          `│ 🥵 Fuck mode activated!\n` +
          `╰╼|━━━━━━━━━━━━━━|╾╯`,
        attachment: fs.createReadStream(imgPath),
        mentions: [{ id: two, tag: event.mentions[two] }]
      },
      threadID,
      () => fs.unlink(imgPath).catch(() => {}),
      messageID
    );
  } catch (err) {
    console.error("[FUCK CMD ERROR]", err.message);
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n│ ❌ এরর: ${err.message}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }
};
