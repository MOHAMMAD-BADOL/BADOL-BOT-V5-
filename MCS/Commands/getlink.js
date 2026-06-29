module.exports.config = {
    name: "getlink",
    aliases: ["link", "gl", "geturl"],
    version: "1.0.3",
    credit: "MOHAMMAD BADOL",
    role: 0,
    prefix: false,
    description: "Reply করা audio/video/image এর download লিংক দেয়",
    category: "Tool",
    usages: "[reply to media]",
    cooldown: 3
};

module.exports.onStart = async function (api, event, args) {
    if (!event ||!event.threadID) return;

    const { threadID, messageID, type, messageReply } = event;

    // Reply চেক
    if (type!== "message_reply") {
        return api.sendMessage(
            "❌ একটা audio, video বা ছবিতে reply দিয়ে কমান্ডটা ইউজ করো\n\nExample: ছবিতে reply দিয়ে 'getlink' লিখো",
            threadID,
            messageID
        );
    }

    if (!messageReply.attachments || messageReply.attachments.length == 0) {
        return api.sendMessage("❌ Reply করা মেসেজে কোনো ফাইল নাই", threadID, messageID);
    }

    if (messageReply.attachments.length > 1) {
        let links = `✅ ${messageReply.attachments.length}টা ফাইলের লিংক পাওয়া গেছে:\n━━━━━━━━━━━━━━━━━━━━\n`;
        messageReply.attachments.forEach((att, i) => {
            links += `${i + 1}. ${att.type || "File"}: ${att.url}\n`;
        });
        links += `━━━━━━━━━━━━━━━━━━━━`;
        return api.sendMessage(links, threadID, messageID);
    }

    const attachment = messageReply.attachments[0];
    const url = attachment.url;
    const fileType = attachment.type || "file";
    const fileName = attachment.filename || "unknown";

    let msg = `✅ 𝐋𝐈𝐍𝐊 𝐅𝐎𝐔𝐍𝐃\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📁 Type: ${fileType.toUpperCase()}\n`;
    msg += `📄 Name: ${fileName}\n`;
    msg += `🔗 Link: ${url}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━`;

    return api.sendMessage(msg, threadID, messageID);
};
