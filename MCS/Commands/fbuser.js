module.exports = {
 config: {
 name: "die",
 aliases: ["filter", "fbuser"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 1,
 cooldown: 5,
 description: "গ্রুপ থেকে Facebook User/Deactivated Account রিমুভ করে",
 commandCategory: "group",
 usages: "",
 },

 onStart: async function (api, event) {
 const { threadID, messageID } = event;
 const botID = api.getCurrentUserID();

 try {
 const threadInfo = await api.getThreadInfo(threadID);

 if (!threadInfo.isGroup) {
 return api.sendMessage("❌ এই কমান্ড শুধু গ্রুপে কাজ করবে।", threadID, messageID);
 }

 // বট এডমিন কিনা চেক
 const botIsAdmin = threadInfo.adminIDs.some(admin => admin.id == botID);
 
 const { userInfo } = threadInfo;
 let fbUsers = [];

 // gender undefined মানে Facebook User/Deactivated
 for (const user of userInfo) {
 if (user.gender === undefined) {
 fbUsers.push(user.id);
 }
 }

 if (fbUsers.length === 0) {
 return api.sendMessage("✅ এই গ্রুপে কোনো 'Facebook User' নাই।", threadID, messageID);
 }

 await api.sendMessage(`🔍 গ্রুপে ${fbUsers.length} টা 'Facebook User' পাওয়া গেছে`, threadID);

 if (!botIsAdmin) {
 return api.sendMessage("❌ কিন্তু বট এডমিন না, তাই ফিল্টার করতে পারবে না।", threadID);
 }

 await api.sendMessage("⚙️ ফিল্টারিং শুরু হচ্ছে...", threadID);

 let success = 0, failed = 0;

 for (const userID of fbUsers) {
 try {
 await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
 await api.removeUserFromGroup(parseInt(userID), threadID);
 success++;
 } catch (e) {
 failed++;
 }
 }

 await api.sendMessage(`✅ সফলভাবে ${success} জন ফিল্টার করা হয়েছে।`, threadID);

 if (failed !== 0) {
 return api.sendMessage(`❌ ${failed} জনকে ফিল্টার করতে পারি নাই।`, threadID);
 }

 } catch (error) {
 console.log(" Error:", error.message);
 return api.sendMessage("❌ কমান্ড রান করতে এরর আসছে।", threadID, messageID);
 }
 }
};
