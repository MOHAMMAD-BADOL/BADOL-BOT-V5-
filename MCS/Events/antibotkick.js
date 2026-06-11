const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "antibotkick",
    version: "5.0.2",
    credit: "MOHAMMAD BADOL",
    description: "বট কেউ কিক/অ্যাড করলে Owner কে নোটিশ দিবে"
};

module.exports.onEvent = async function (api, event) {
    // শুধু log:subscribe আর log:unsubscribe হ্যান্ডেল করব
    if (!event.logMessageType) return;
    if (event.logMessageType!== "log:subscribe" && event.logMessageType!== "log:unsubscribe") return;

    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();

    let config;
    try {
        config = require("../../config.json");
    } catch (e) {
        console.log("[ANTI-KICK] config.json লোড এরর");
        return;
    }

    const ownerID = config.OWNER_LOCK.ID;
    const ownerName = config.OWNER_LOCK.NAME;

    // ═══════════════════ বট অ্যাড করলে ═══════════════════
    if (logMessageType === "log:subscribe") {
        const botAdded = logMessageData.addedParticipants?.some(user => user.userFbId == botID);

        if (botAdded) {
            // নিজে অ্যাড করলে নোটিশ অফ করতে চাইলে এই লাইন আনকমেন্ট কর
            // if (author == ownerID) return;

            setTimeout(async () => {
                try {
                    const threadInfo = await api.getThreadInfo(threadID);
                    const userInfo = await api.getUserInfo(author);
                    const adderName = userInfo[author]?.name || "Unknown User";

                    const msg = `╭━━━━━━━━━━━━━━━━━━━━╮
┃ ✅ 𝐁𝐎𝐓 𝐀𝐃𝐄𝐃 𝐍𝐎𝐓𝐈𝐂𝐄 ✅ ┃
╰━━━━━━━━━━━━━━━━━━━━╯

📢 ${ownerName} ভাই, আমাকে নতুন গ্রুপে অ্যাড করা হইছে!

╔════════════════════╗
║ 📊 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎
╚════════════════════╝
🏷️ নাম: ${threadInfo.threadName || "Unnamed Group"}
🆔 TID: ${threadID}
👥 মেম্বার: ${threadInfo.participantIDs.length} জন
👑 অ্যাডমিন: ${threadInfo.adminIDs.length} জন

╔════════════════════╗
║ 👤 𝐀𝐃𝐄𝐃 𝐁𝐘
╚════════════════════╝
📛 নাম: ${adderName}
🆔 UID: ${author}
🔗 প্রোফাইল: fb.com/${author}

⏰ সময়: ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}

━━━━━━━━━━━━━━━━━━━━━━
⚡ BADOL-BOT V5 এখন এই গ্রুপে এক্টিভ!`;

                    await api.sendMessage(msg, ownerID);

                    // গ্রুপে থ্যাংক ইউ মেসেজ
                    await api.sendMessage(`✅ ধন্যবাদ ${adderName}! BADOL-BOT V5 এখন এই গ্রুপে এক্টিভ।\n\n/help লিখে সব কমান্ড দেখুন 🦵`, threadID);

                } catch (e) {
                    console.log("[ANTI-KICK ADD ERROR]", e.message);
                }
            }, 1500);
        }
    }

    // ═══════════════════ বট কিক করলে ═══════════════════
    if (logMessageType === "log:unsubscribe") {
        if (logMessageData.leftParticipantFbId == botID) {
            // নিজে কিক করলে নোটিশ অফ করতে চাইলে এই লাইন আনকমেন্ট কর
            // if (author == ownerID) return;

            setTimeout(async () => {
                try {
                    let threadName = "Unknown Group";
                    let kickerName = "Unknown User";

                    // Thread নাম নেওয়ার ট্রাই
                    try {
                        const threadInfo = await api.getThreadInfo(threadID);
                        threadName = threadInfo.threadName || "Unnamed Group";
                    } catch (e) {
                        console.log("[ANTI-KICK] কিক খাওয়ার পর thread info পাই নাই");
                    }

                    // কে কিক করছে
                    try {
                        const userInfo = await api.getUserInfo(author);
                        kickerName = userInfo[author]?.name || "Unknown User";
                    } catch (e) {}

                    const msg = `╭━━━━━━━━━━━━━━━━━━━━╮
┃ ⚠️ 𝐁𝐎𝐓 𝐊𝐈𝐂𝐊𝐄𝐃 𝐀𝐋𝐄𝐑𝐓 ⚠️ ┃
╰━━━━━━━━━━━━━━━━━━━━╯

🚨 ${ownerName} ভাই, আমাকে গ্রুপ থেকে কিক করা হইছে!

╔════════════════════╗
║ 📊 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎
╚════════════════════╝
🏷️ নাম: ${threadName}
🆔 TID: ${threadID}

╔════════════════════╗
║ 🔨 𝐊𝐈𝐂𝐊𝐄𝐃 𝐁𝐘
╚════════════════════╝
📛 নাম: ${kickerName}
🆔 UID: ${author}
🔗 প্রোফাইল: fb.com/${author}

⏰ সময়: ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}

━━━━━━━━━━━━━━━━━━━━━━
💡 ${kickerName} কে ব্যান করতে চাইলে /ban ${author} লিখুন
⚡ BADOL-BOT V5`;

                    await api.sendMessage(msg, ownerID);

                    // লগ ফাইলে সেভ
                    const logDir = path.join(__dirname, "../../logs");
                    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

                    const logFile = path.join(logDir, "kick_log.txt");
                    const logData = `[${new Date().toISOString()}] KICKED from ${threadName} (${threadID}) by ${kickerName} (${author})\n`;
                    fs.appendFileSync(logFile, logData);

                } catch (e) {
                    console.log("[ANTI-KICK KICK ERROR]", e.message);
                }
            }, 1000);
        }
    }
};