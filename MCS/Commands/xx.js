const axios = require("axios");

const cleanUrl = (url) => {
 if (!url) return null;
 const match = url.match(/\((https?:\/\/.*?)\)/);
 return match? match[1] : url;
};

const streamURL = async (url) => {
 const res = await axios.get(url, { responseType: "stream", timeout: 20000 });
 return res.data;
};

const get360p = (downloads) => {
 if (!Array.isArray(downloads)) return null;
 const vid = downloads.find(v => v.quality === "360p");
 return vid? cleanUrl(vid.url) : cleanUrl(downloads[0]?.url);
};

module.exports = {
 config: {
 name: "xx",
 aliases: ["xdl", "xdown"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 2,
 cooldown: 5,
 description: "X/Twitter ভিডিও সার্চ ও ডাউনলোড",
 commandCategory: "media",
 usages: "[text/link]",
 },

 onStart: async function (api, event, args) {
 try {
 if (!args[0]) {
 return api.sendMessage("❌ Use: xx <text>", event.threadID, event.messageID);
 }

 const query = args.join(" ");

 const res = await axios.get(
 `https://x-search-api-sagor.vercel.app/sagor?apikey=sagor&q=${encodeURIComponent(query)}`,
 { timeout: 20000 }
 );

 const list = res?.data?.data;

 if (!Array.isArray(list) || list.length === 0) {
 return api.sendMessage("❌ No result!", event.threadID, event.messageID);
 }

 const results = list.slice(0, 15).map(item => ({
...item,
 url: cleanUrl(item.url),
 thumbnail: cleanUrl(item.thumbnail)
 }));

 let msg = `🔎 ${query}\nReply number:\n\n`;

 results.forEach((item, i) => {
 msg += `${i + 1}. ${item.title}\n⏱ ${item.duration}\n\n`;
 });

 const images = [];
 for (let item of results) {
 try {
 const img = await streamURL(item.thumbnail);
 if (img) images.push(img);
 } catch {}
 }

 return api.sendMessage({
 body: msg,
 attachment: images
 }, event.threadID, (err, info) => {
 if (err ||!info) return;
 // তোমার মেইন ফাইলের msgCache ইউজ করতেছি
 global.msgCache.set(info.messageID, {
 commandName: "xx",
 author: event.senderID,
 list: results
 });
 }, event.messageID);

 } catch (err) {
 console.log("[XX] Error:", err.message);
 return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
 }
 },

 onReply: async function (api, event, replyData) {
 try {
 if (event.senderID!= replyData.author) return;

 const index = parseInt(event.body);
 if (!index || index < 1 || index > replyData.list.length) return;

 const item = replyData.list[index - 1];

 try { api.unsendMessage(event.messageReply.messageID); } catch {}

 const res = await axios.get(
 `https://x-down-api-sagor.vercel.app/sagor?apikey=sagor&q=${encodeURIComponent(cleanUrl(item.url))}`,
 { timeout: 30000 }
 );

 const data = res?.data?.data;
 if (!data) return api.sendMessage("❌ API data missing!", event.threadID, event.messageID);

 const videoUrl = get360p(data.downloads);
 if (!videoUrl) return api.sendMessage("❌ No video link!", event.threadID, event.messageID);

 const stream = await streamURL(videoUrl);

 return api.sendMessage({
 body: `📥 ${data.title}\n🎬 360p\n⏱ ${data.duration}`,
 attachment: stream
 }, event.threadID, event.messageID);

 } catch (err) {
 console.log("[XX] Download Error:", err.message);
 return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
 }
 }
};
