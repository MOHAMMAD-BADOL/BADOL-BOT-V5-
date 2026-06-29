module.exports = {
 config: {
 name: "kick",
 aliases: ["remove", "band"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 1,
 cooldown: 5,
 description: "গ্রুপ থেকে মেম্বার রিমুভ করো - একজন বা সবাই",
 commandCategory: "group",
 usages: "[@mention | all]",
 },

 onStart: async function (api, event, args) {
 const { threadID, messageID, senderID, mentions } = event;

 try {
 const threadInfo = await api.getThreadInfo(threadID);

 if (!threadInfo.isGroup) {
 return api.sendMessage("❌ এই কমান্ড শুধু গ্রুপে কাজ করবে।", threadID, messageID);
 }

 const isAdmin = threadInfo.adminIDs.some(admin => admin.id == senderID);
 if (!isAdmin) {
 return api.sendMessage("❌ শুধু গ্রুপ এডমিন এই কমান্ড ইউজ করতে পারবে।", threadID, messageID);
 }

 const botID = api.getCurrentUserID();

 // সব মেম্বার কিক
 if (args[0] && args[0].toLowerCase() === "all") {
 const membersToKick = threadInfo.participantIDs.filter(uid => {
 const isAdminMember = threadInfo.adminIDs.some(admin => admin.id == uid);
 return uid!= botID &&!isAdminMember;
 });

 if (membersToKick.length === 0) {
 return api.sendMessage("❌ কিক করার মতো নন-এডমিন মেম্বার নাই।", threadID, messageID);
 }

 api.sendMessage("⚠️ সব নন-এডমিন মেম্বার রিমুভ করা হচ্ছে...", threadID);

 for (const uid of membersToKick) {
 try {
 await api.removeUserFromGroup(uid, threadID);
 } catch {}
 }

 return api.sendMessage(
 `✅ সফলভাবে ${membersToKick.length} জন মেম্বার রিমুভ করা হয়েছে।`,
 threadID
 );
 }

 // একজন মেম্বার কিক
 if (Object.keys(mentions).length === 0) {
 return api.sendMessage(
 "❌ যাকে কিক করবা তাকে মেনশন দাও।\n\nExample:\n.kick @user\n.kick all",
 threadID,
 messageID
 );
 }

 const userIDToKick = Object.keys(mentions)[0];
 const userName = mentions[userIDToKick].replace("@", "");

 if (userIDToKick == botID) {
 return api.sendMessage("❌ আমি নিজেকে রিমুভ করতে পারব না।", threadID, messageID);
 }

 const isTargetAdmin = threadInfo.adminIDs.some(admin => admin.id == userIDToKick);
 if (isTargetAdmin) {
 return api.sendMessage("❌ এডমিনকে রিমুভ করা যাবে না।", threadID, messageID);
 }

 api.sendMessage(`⏳ ${userName} কে রিমুভ করা হচ্ছে...`, threadID);

 api.removeUserFromGroup(userIDToKick, threadID, (err) => {
 if (err) {
 return api.sendMessage(
 "❌ ইউজার রিমুভ করতে পারলাম না।\nচেক করো:\n- বট এডমিন আছে কিনা\n- ইউজার গ্রুপে আছে কিনা",
 threadID
 );
 }

 return api.sendMessage(`✅ সফলভাবে ${userName} কে রিমুভ করা হয়েছে।`, threadID);
 });

 } catch (error) {
 console.log("[KICK] Error:", error.message);
 return api.sendMessage(
 "❌ কমান্ড রান করতে এরর আসছে।",
 threadID,
 messageID
 );
 }
 }
};
