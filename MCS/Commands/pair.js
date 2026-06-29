const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "pair",
  version: "3.2.0",
  role: 0,
  credit: "MOHAMMAD BADOL",
  description: "রেন্ডম মেম্বারের সাথে পেয়ার বানায়",
  category: "fun",
  prefix: true,
  cooldown: 15
};

module.exports.onStart = async function (api, event, args) {
  const { threadID, messageID, senderID } = event;

  let cacheDir = path.join(__dirname, "B4D9L");
  let pathImg = path.join(cacheDir, `pair_${Date.now()}.png`);

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  try {
    var id1 = senderID;
    var name1 = (await api.getUserInfo(id1))[id1].name;
    var ThreadInfo = await api.getThreadInfo(threadID);
    var all = ThreadInfo.userInfo;

    let gender1 = "UNKNOWN";
    for (let c of all) {
      if (c.id == id1) gender1 = c.gender;
    }

    const botID = api.getCurrentUserID();
    let ungvien = [];

    if (gender1 == "FEMALE") {
      for (let u of all) {
        if (u.gender == "MALE" && u.id!== id1 && u.id!== botID) {
          ungvien.push(u.id);
        }
      }
    } else if (gender1 == "MALE") {
      for (let u of all) {
        if (u.gender == "FEMALE" && u.id!== id1 && u.id!== botID) {
          ungvien.push(u.id);
        }
      }
    } else {
      for (let u of all) {
        if (u.id!== id1 && u.id!== botID) {
          ungvien.push(u.id);
        }
      }
    }

    if (ungvien.length === 0) {
      return api.sendMessage("❌ এই গ্রুপে পেয়ার করার মতো কেউ নাই", threadID, messageID);
    }

    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    var name2 = (await api.getUserInfo(id2))[id2].name;

    var tile = Math.floor(Math.random() * 100) + 1;

    // 🔥 তোমার গুগল ড্রাইভ লিংক - ডাইরেক্ট ডাউনলোড লিংকে কনভার্ট করা
    const backgroundLinks = [
      "https://drive.google.com/uc?export=download&id=1fFHF7jbWo0tvHh6dTKxe3XMnVmatxjlP",
      "https://drive.google.com/uc?export=download&id=1qp9mM-yLYnYFcuYyrOn2I4-LODWK2pAY",
      "https://drive.google.com/uc?export=download&id=1XxWlQ9appoHdY_tNvr4iI32rPwnMTvo_"
    ];
    const bgLink = backgroundLinks[Math.floor(Math.random() * backgroundLinks.length)];

    // Avatar ফেচ
    const getAvatar = async (uid) => {
      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      try {
        const response = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 10000 });
        return response.data;
      } catch (e) {
        const fallbackUrl = `https://graph.facebook.com/${uid}/picture?type=large`;
        const response = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
        return response.data;
      }
    };

    let avatarBuffer1 = await getAvatar(id1);
    let avatarBuffer2 = await getAvatar(id2);
    
    // ব্যাকগ্রাউন্ড ডাউনলোড
    let bgBuffer;
    try {
      const bgRes = await axios.get(bgLink, { responseType: "arraybuffer", timeout: 15000 });
      bgBuffer = bgRes.data;
      console.log("[PAIR] ✅ Background loaded");
    } catch (e) {
      console.log("[PAIR] ❌ Background failed:", e.message);
      bgBuffer = null;
    }

    let baseAvt1 = await loadImage(avatarBuffer1);
    let baseAvt2 = await loadImage(avatarBuffer2);
    
    let canvas = createCanvas(1280, 720);
    let ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড ছবি দাও
    if (bgBuffer) {
      let bgImage = await loadImage(bgBuffer);
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#ff006e");
      gradient.addColorStop(1, "#3a86ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Title
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 10;
    ctx.fillText("💕 PERFECT PAIR 💕", canvas.width / 2, 100);

    // Avatar 1
    ctx.save();
    ctx.beginPath();
    ctx.arc(320, 360, 150, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.shadowColor = "#ff006e";
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(baseAvt1, 170, 210, 300, 300);
    ctx.restore();

    // Avatar 2
    ctx.save();
    ctx.beginPath();
    ctx.arc(960, 360, 150, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.shadowColor = "#3a86ff";
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(baseAvt2, 810, 210, 300, 300);
    ctx.restore();

    // Heart
    ctx.shadowBlur = 0;
    ctx.font = "150px Arial";
    ctx.fillText("❤️", canvas.width / 2, 400);

    // Names
    ctx.font = "bold 45px Arial";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 10;
    ctx.fillText(name1.substring(0, 12), 320, 580);
    ctx.fillText(name2.substring(0, 12), 960, 580);

    // Percent
    ctx.font = "bold 70px Arial";
    ctx.fillStyle = "#ffeb3b";
    ctx.shadowColor = "#ff006e";
    ctx.shadowBlur = 20;
    ctx.fillText(`${tile}%`, canvas.width / 2, 680);

    const imageBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(pathImg, imageBuffer);

    return api.sendMessage({
      body: `🎉 ${name1} + ${name2} = ${tile}% Match!`,
      mentions: [{
        tag: name2,
        id: id2
      }],
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (e) {
    console.log("[PAIR ERROR]", e.message);
    return api.sendMessage(`❌ এরর: ${e.message}`, threadID, messageID);
  }
};
