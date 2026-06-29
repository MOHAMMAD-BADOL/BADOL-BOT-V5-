const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "mp3",
 aliases: ["v2a", "audio"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 0,
 cooldown: 20,
 description: "ভিডিও রিপ্লাই দিয়ে অডিও বানাও",
 commandCategory: "media",
 usages: "[reply video]",
 },

 onStart: async function (api, event) {
 try {
 if (!event.messageReply ||!event.messageReply.attachments || event.messageReply.attachments.length === 0) {
 return api.sendMessage("ভিডিও রিপ্লাই দাও, তারপর.mp3 লিখো", event.threadID, event.messageID);
 }

 const sagor = event.messageReply.attachments[0];

 if (sagor.type!== "video") {
 return api.sendMessage("রিপ্লাই করা ফাইল ভিডিও হতে হবে!", event.threadID, event.messageID);
 }

 api.setMessageReaction("⏳", event.messageID, () => {}, true);

 const { data } = await axios.get(sagor.url, {
 method: "GET",
 responseType: "arraybuffer",
 timeout: 60000
 });

 // হোম/রুটের cache ফোল্ডার ইউজ করবে
 const cacheDir = path.join(__dirname, "../../cache");
 if (!fs.existsSync(cacheDir)) {
 fs.mkdirSync(cacheDir, { recursive: true });
 }

 const filePath = path.join(cacheDir, `audio_${Date.now()}.m4a`);
 fs.writeFileSync(filePath, Buffer.from(data));

 const audioReadStream = fs.createReadStream(filePath);

 return api.sendMessage(
 {
 body: "🎵 Audio ready!",
 attachment: audioReadStream
 },
 event.threadID,
 () => {
 fs.unlinkSync(filePath);
 api.setMessageReaction("✅", event.messageID, () => {}, true);
 },
 event.messageID
 );

 } catch (e) {
 console.log("[MP3] Error:", e.message);
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 return api.sendMessage(`❌ Error: ${e.message || "ভিডিও কনভার্ট করতে পারলাম না"}`, event.threadID, event.messageID);
 }
 }
};
