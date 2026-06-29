module.exports = {
 config: {
 name: "left",
 version: "1.0.0",
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 1,
 cooldown: 5,
 description: "বট গ্রুপ থেকে লিভ নিবে",
 commandCategory: "group",
 usages: "out",
 aliases: ["out", "leave"]
 },

 onStart: async function (api, event) {
 const { threadID, messageID } = event;
 const botID = api.getCurrentUserID();

 try {
 const threadInfo = await api.getThreadInfo(threadID);

 if (!threadInfo.isGroup) {
 return api.sendMessage("❌ এই কমান্ড শুধু গ্রুপে কাজ করবে।", threadID, messageID);
 }

 await api.sendMessage(
 "👋 Goodbye everyone...\nআমি চলে যাচ্ছি।",
 threadID,
 () => {
 setTimeout(() => {
 api.removeUserFromGroup(botID, threadID);
 }, 1000); // 1 সেকেন্ড পর লিভ
 },
 messageID
 );

 } catch (error) {
 console.log(" Error:", error.message);
 return api.sendMessage("❌ লিভ নিতে এরর হইছে।", threadID, messageID);
 }
 }
};
