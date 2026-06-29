module.exports = {
 config: {
 name: "grouplist",
 aliases: ["gclist", "gl"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 1,
 cooldown: 5,
 description: "সব গ্রুপ দেখো, লিভ নাও বা মেম্বার অ্যাড করো",
 commandCategory: "admin",
 usages: "",
 },

 onStart: async function (api, event) {
 const { threadID, messageID, senderID } = event;

 try {
 // Threads ইউজ না করে api.getThreadList ইউজ করতেছি
 const allThreads = await api.getThreadList(100, null, ["INBOX"]);
 const groups = allThreads.filter(t => t.isGroup && t.name);

 if (!groups.length) {
 return api.sendMessage(
 "╭─── 📋 GROUP LIST ───╮\n\n⚠️ কোনো গ্রুপ পাওয়া যায়নি!\n\n╰──────────────────────╯",
 threadID, messageID
 );
 }

 let msg = "╭─── 📋 GROUP LIST ───╮\n\n";
 msg += `📊 মোট: ${groups.length} টা গ্রুপ\n\n`;
 msg += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

 for (let i = 0; i < groups.length; i++) {
 const g = groups[i];
 msg += `${i + 1}. ${g.name}\n 🆔 ${g.threadID}\n\n`;
 }

 msg += "━━━━━━━━━━━━━━━━━━━━━━\n";
 msg += "📤 out [নম্বর] — বট গ্রুপ থেকে লিভ নিবে\n";
 msg += "➕ join [নম্বর] — তোমাকে ওই গ্রুপে অ্যাড করবে\n";
 msg += "➕ join [নম্বর] [uid] — অন্য কাউকে অ্যাড করবে";

 return api.sendMessage(msg, threadID, (err, info) => {
 if (err ||!info) return;
 global.msgCache.set(info.messageID, {
 commandName: "grouplist",
 author: senderID,
 groups: groups
 });
 }, messageID);

 } catch (error) {
 console.log(" Error:", error.message);
 return api.sendMessage("❌ গ্রুপ লিস্ট আনতে এরর হইছে।", threadID, messageID);
 }
 },

 onReply: async function (api, event, replyData) {
 if (String(event.senderID)!== String(replyData.author)) return;

 const { threadID, messageID, senderID, body } = event;
 const { groups } = replyData;

 if (!body ||!body.trim()) return;

 const parts = body.trim().split(/\s+/);
 const action = parts[0].toLowerCase();
 const numStr = parts[1];
 const extraUID = parts[2];

 if (action!== "out" && action!== "join") {
 return api.sendMessage(
 "╭─── ❓ ───╮\n\n" +
 "▸ out [নম্বর]\n" +
 "▸ join [নম্বর]\n" +
 "▸ join [নম্বর] [uid]\n\n" +
 "╰───────────╯",
 threadID, messageID
 );
 }

 const num = parseInt(numStr);
 if (isNaN(num) || num < 1 || num > groups.length) {
 return api.sendMessage(
 `❌ ভুল নম্বর! 1 থেকে ${groups.length} এর মধ্যে দাও।`,
 threadID, messageID
 );
 }

 const target = groups[num - 1];
 const targetTID = String(target.threadID);
 const groupName = target.name || targetTID;

 // লিভ নেওয়া
 if (action === "out") {
 try {
 await api.removeUserFromGroup(api.getCurrentUserID(), targetTID);
 } catch (_) {}

 return api.sendMessage(
 "╭─── 📤 LEAVE ───╮\n\n" +
 `✅ বট গ্রুপ থেকে লিভ নিছে!\n\n` +
 `▸ ${groupName}\n` +
 ` 🆔 ${targetTID}\n\n` +
 "╰──────────────────╯",
 threadID, messageID
 );
 }

 // জয়েন করা
 if (action === "join") {
 const addUID = extraUID && /^\d{5,}$/.test(extraUID)? extraUID : senderID;

 try {
 const threadInfo = await api.getThreadInfo(targetTID);
 const { participantIDs = [], approvalMode, adminIDs = [] } = threadInfo;

 if (participantIDs.includes(String(addUID))) {
 return api.sendMessage(
 `⚠️ এই ইউজার "${groupName}" এ অলরেডি আছে!`,
 threadID, messageID
 );
 }

 await api.addUserToGroup(addUID, targetTID);

 const isApprovalMode = approvalMode === true;
 const botIsAdmin = adminIDs.some(a => String(a.id) === String(api.getCurrentUserID()));

 return api.sendMessage(
 "╭─── ➕ JOIN ───╮\n\n" +
 `✅ সফলভাবে অ্যাড করা হয়েছে!\n\n` +
 `▸ গ্রুপ: ${groupName}\n` +
 ` 🆔 ${targetTID}\n` +
 `▸ ইউজার: ${addUID === senderID? "তুমি" : addUID}\n` +
 (isApprovalMode &&!botIsAdmin
? "\n⚠️ এই গ্রুপে approval mode অন আছে,\n pending লিস্ট চেক করো।"
: "") +
 "\n\n╰──────────────────╯",
 threadID, messageID
 );
 } catch (e) {
 return api.sendMessage(
 `╭─── ❌ ERROR ───╮\n\n` +
 `ইউজার অ্যাড করতে পারলাম না!\n\n▸ ${groupName}\n\nError: ${e.message || e}\n\n╰──────────────────╯`,
 threadID, messageID
 );
 }
 }
 }
};
