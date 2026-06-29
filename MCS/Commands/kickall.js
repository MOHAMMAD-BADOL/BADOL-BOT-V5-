module.exports = {
 config: {
 name: "kickall",
 aliases: ["removeall"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 2,
 cooldown: 5,
 description: "গ্রুপের সব মেম্বার রিমুভ করে বট নিজেও লিভ নিবে",
 commandCategory: "group",
 usages: "",
 },

 onStart: async function (api, event) {
 const { threadID, messageID, senderID } = event;
 const botID = api.getCurrentUserID();

 try {
 const threadInfo = await api.getThreadInfo(threadID);

 if (!threadInfo.isGroup) {
 return api.sendMessage("❌ এই কমান্ড শুধু গ্রুপে কাজ করবে।", threadID, messageID);
 }

 // বট এডমিন কিনা চেক
 if (!threadInfo.adminIDs.some(item => item.id == botID)) {
 return api.sendMessage("❌ বটের এডমিন রাইটস লাগবে।\nএডমিন দিয়ে আবার ট্রাই করো।", threadID, messageID);
 }

 // ইউজার এডমিন কিনা চেক
 const isSenderAdmin = threadInfo.adminIDs.some(item => item.id == senderID);
 if (!isSenderAdmin) {
 return api.sendMessage("❌ শুধু গ্রুপ এডমিন এই কমান্ড ইউজ করতে পারবে।", threadID, messageID);
 }

 // বট বাদে সবাইকে লিস্টে নাও
 const listUserID = threadInfo.participantIDs.filter(ID => ID!= botID);

 if (listUserID.length === 0) {
 return api.sendMessage("❌ কিক করার মতো মেম্বার নাই।", threadID, messageID);
 }

 // 5 মিনিট পর বট লিভ নিবে
 setTimeout(() => {
 api.removeUserFromGroup(botID, threadID);
 }, 300000); // 300000ms = 5 min

 await api.sendMessage("⚠️ সব মেম্বার ডিলিট করা শুরু হচ্ছে... Bye everyone।", threadID);

 // 1 সেকেন্ড ডিলে দিয়ে সবাইকে কিক
 for (let i = 0; i < listUserID.length; i++) {
 await new Promise(resolve => setTimeout(resolve, 1000));
 try {
 await api.removeUserFromGroup(listUserID[i], threadID);
 } catch (e) {
 console.log(`[KICKALL] Failed to kick ${listUserID[i]}:`, e.message);
 }
 }

 return api.sendMessage(`✅ সফলভাবে ${listUserID.length} জন মেম্বার রিমুভ করা হয়েছে।\n⏰ 5 মিনিট পর আমি নিজেও লিভ নিবো।`, threadID);

 } catch (error) {
 console.log(" Error:", error.message);
 return api.sendMessage("❌ কমান্ড রান করতে এরর আসছে।", threadID, messageID);
 }
 }
};
