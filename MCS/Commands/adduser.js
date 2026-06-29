const axios = require("axios");

module.exports = {
 config: {
 name: "adduser",
 aliases: ["add"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 0,
 cooldown: 5,
 description: "Add user to group by link or id",
 commandCategory: "group",
 usages: "[uid/link]",
 },

 // এখানে { } বাদ দিছি - api, event, args সরাসরি নিবে
 onStart: async function (api, event, args) {
 const { threadID, messageID } = event;
 const botID = api.getCurrentUserID();
 const out = msg => api.sendMessage(msg, threadID, messageID);

 try {
 var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
 var participantIDs = participantIDs.map(e => parseInt(e));

 if (!args[0]) return out("Add করতে মেম্বারের FB UID অথবা লিংক দাও");

 let id, name;
 if (!isNaN(args[0])) {
 id = args[0];
 } else {
 var [uid, username, fail] = await getUID(args[0]);
 if (fail) return out(uid || "Sorry I Don't track your account..!⚠");
 id = uid;
 name = username;
 }

 await adduser(id, name || "Facebook user");

 } catch (e) {
 // এখন logger ঠিকমতো কাজ করবে
 throw e; // মেইন ফাইল ধরবে
 }

 async function adduser(id, name) {
 id = parseInt(id);
 if (participantIDs.includes(id)) return out(`${name? name : "Member"} এই মেম্বার অলরেডি গ্রুপে আছে...!🤗`);
 else {
 var admins = adminIDs.map(e => parseInt(e.id));
 try {
 await api.addUserToGroup(id, threadID);
 } catch (e) {
 return out(`Opps ${name? name : "user"} অ্যাড করতে পারি নাই\nকারণ: ${e.errorDescription || "Friend না অথবা Privacy"}`);
 }
 if (approvalMode === true &&!admins.includes(botID)) return out(`Add ${name? name : "member"} Pending এ আছে, এডমিন approve করলে জয়েন হবে..!⌛`);
 else return out(`🌺✨ ${name? name : "member"} সফলভাবে গ্রুপে অ্যাড হয়ে গেছে..!😊`)
 }
 }
 }
};

// getUID ফাংশন সেম
async function getUID(url) {
 try {
 if (!url.startsWith("http")) url = "https://" + url;
 url = url.replace("m.facebook.com", "www.facebook.com").replace("fb.com", "www.facebook.com");

 let { data } = await axios.get(url, {
 headers: { "User-Agent": "Mozilla/5.0" }
 });

 let redirectMatch = data.match(/for \(;;\);{"redirect":"(.*?)"}/);
 if (redirectMatch) {
 let redirectUrl = JSON.parse(`"${redirectMatch[1]}"`);
 let res = await axios.get(redirectUrl, {
 headers: { "User-Agent": "Mozilla/5.0" }
 });
 data = res.data;
 }

 let uidMatch = data.match(/"userID":"(\d+)"/);
 let nameMatch = data.match(/"title":"(.*?)"/s);

 if (!uidMatch) return ["UID পাই নাই", null, true];

 let name = nameMatch? nameMatch[1] : null;
 return [uidMatch[1], name, false];

 } catch (e) {
 return [null, null, true];
 }
}
