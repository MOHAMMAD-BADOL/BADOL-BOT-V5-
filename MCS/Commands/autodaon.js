const fs = require("fs");
const path = require("path");

// sagor-video-downloader এর console.log হাইড
const _origLog = console.log;
console.log = () => {};
const { downloadVideo } = require("sagor-video-downloader");
console.log = _origLog;

module.exports = {
 config: {
 name: "autodaon",
 version: "1.0.0",
 credit: "MOHAMMAD BADOL",
 prefix: false, // অটো কমান্ড
 role: 0,
 cooldown: 5,
 description: "ভিডিও লিংক দিলে অটো ডাউনলোড করে দেয়",
 commandCategory: "media",
 usages: "",
 },

 onChat: async function (api, event) {
 const { threadID, messageID, body } = event;
 if (!body) return;

 const linkMatches = body.match(/(https?:\/\/[^\s]+)/g);
 if (!linkMatches) return;

 // শুধু ভিডিও সাইট চেক
 const videoRegex = /(tiktok\.com|facebook\.com|fb\.watch|instagram\.com|youtube\.com|youtu\.be|x\.com|twitter\.com|pinterest\.com|capcut\.com|likee\.video)/i;
 const videoLinks = linkMatches.filter(link => videoRegex.test(link));
 if (videoLinks.length === 0) return;

 const uniqueLinks = [...new Set(videoLinks)];
 api.setMessageReaction("⏳", messageID, () => {}, true);

 let successCount = 0;
 let failCount = 0;

 for (const url of uniqueLinks) {
 try {
 const result = await downloadVideo(url);
 const { title, filePath } = result;

 if (!filePath ||!fs.existsSync(filePath)) {
 failCount++;
 continue;
 }

 const stats = fs.statSync(filePath);
 const fileSizeInMB = stats.size / (1024 * 1024);

 // 25MB এর বেশি হলে স্কিপ
 if (fileSizeInMB > 25) {
 fs.unlinkSync(filePath);
 await api.sendMessage(
 `⚠️ "${title || "Video"}" - ${fileSizeInMB.toFixed(2)}MB\n25MB এর বেশি, পাঠানো যাবে না`,
 threadID
 );
 failCount++;
 continue;
 }

 await api.sendMessage(
 {
 body: `📥 𝗩𝗜𝗗𝗘𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗\n━━━━━━━━━━━━━━━\n🎬 ${title || "Video"}\n📦 ${fileSizeInMB.toFixed(2)} MB\n━━━━━━━━━━━━━━━`,
 attachment: fs.createReadStream(filePath)
 },
 threadID,
 messageID
 );

 fs.unlinkSync(filePath);
 successCount++;

 } catch (e) {
 console.log(`[AUTODOWN] Failed: ${url}`, e.message);
 failCount++;
 }
 }

 const finalReaction =
 successCount > 0 && failCount === 0? "✅" :
 successCount > 0? "⚠️" : "❌";

 api.setMessageReaction(finalReaction, messageID, () => {}, true);
 },

 onStart: async function () {} // খালি রাখো
};
