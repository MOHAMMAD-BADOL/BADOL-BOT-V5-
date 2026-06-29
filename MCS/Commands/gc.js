const axios = require("axios");

module.exports.config = {
    name: "gc",
    aliases: ["group", "groupcontrol"],
    version: "1.3.1",
    credit: "MOHAMMAD BADOL", // তোমার বটে must লাগবে
    role: 1, // 1 = admin only, কারণ সবগুলা কাজ admin লাগে
    prefix: true, // /gc লিখে চালাবে
    description: "Group Control & Information Tools",
    category: "Group Control",
    usages: "[info/name/admin/remove/emoji/pp]",
    cooldown: 5
};

module.exports.onStart = async function (api, event, args) {
    if (!event ||!event.threadID) return;

    const { threadID, messageID, mentions, type, messageReply, senderID } = event;

    // গ্রুপে না হলে return
    if (!event.isGroup) return api.sendMessage("❌ এই কমান্ড শুধু গ্রুপে কাজ করবে।", threadID, messageID);

    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const isBotAdmin = threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID());

        if (!isBotAdmin) {
            return api.sendMessage("⚠️ 𝐄𝐑𝐑𝐎𝐑: বটকে Admin দিতে হবে এই কাজ করার জন্য!", threadID, messageID);
        }

        const action = args[0]?.toLowerCase();

        switch (action) {
            case "name": {
                if (type == "message_reply" || (mentions && Object.keys(mentions).length > 0)) {
                    let targetID, nickName;
                    if (type == "message_reply") {
                        targetID = messageReply.senderID;
                        nickName = args.slice(1).join(" ");
                    } else {
                        targetID = Object.keys(mentions)[0];
                        const mentionName = mentions[targetID];
                        nickName = args.slice(1).join(" ").replace(mentionName, "").trim();
                    }

                    if (!nickName) return api.sendMessage("📝 Usage: /gc name [@tag] [nickname]\nঅথবা: /gc name [Group Name]", threadID, messageID);
                    await api.changeNickname(nickName, threadID, targetID);
                    return api.sendMessage(`✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒: Nickname আপডেট করা হয়েছে।`, threadID, messageID);
                } else {
                    const newGroupName = args.slice(1).join(" ");
                    if (!newGroupName) return api.sendMessage("📝 Usage: /gc name [Group Name]", threadID, messageID);
                    await api.setTitle(newGroupName, threadID);
                    return api.sendMessage(`✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒: গ্রুপের নাম চেঞ্জ করা হয়েছে: ${newGroupName}`, threadID, messageID);
                }
            }

            case "info": {
                const { threadName, participantIDs, adminIDs, imageSrc, emoji } = threadInfo;
                const adminList = [];
                for (let admin of adminIDs) {
                    try {
                        const info = await api.getUserInfo(admin.id);
                        adminList.push(info[admin.id]?.name || "Unknown User");
                    } catch (e) { adminList.push("Unknown User"); }
                }

                let msg = `╔══════════════════╗\n`;
                msg += ` ✨ 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 ✨\n`;
                msg += `╚══════════════════╝\n\n`;
                msg += `🏷️ Name: ${threadName || "Unnamed Group"}\n`;
                msg += `🆔 ID: ${threadID}\n`;
                msg += `👥 Members: ${participantIDs.length}\n`;
                msg += `👑 Admins: ${adminIDs.length}\n`;
                msg += `👍 Emoji: ${emoji || "Default"}\n`;
                msg += `━━━━━━━━━━━━━━━━━━━━\n`;
                msg += `🎩 Admin List:\n • ${adminList.join("\n • ")}\n`;
                msg += `━━━━━━━━━━━━━━━━━━━━`;

                if (imageSrc) {
                    const imgRes = await axios.get(imageSrc, { responseType: "stream" });
                    return api.sendMessage({ body: msg, attachment: imgRes.data }, threadID, messageID);
                } else {
                    return api.sendMessage(msg, threadID, messageID);
                }
            }

            case "emoji": {
                const newEmoji = args[1];
                if (!newEmoji) return api.sendMessage("📝 Usage: /gc emoji [emoji]", threadID, messageID);
                await api.changeThreadEmoji(newEmoji, threadID);
                return api.sendMessage(`✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒: গ্রুপ ইমোজি চেঞ্জ করা হয়েছে ${newEmoji}`, threadID, messageID);
            }

            case "pp": {
                if (type!== "message_reply" ||!messageReply.attachments || messageReply.attachments.length == 0) {
                    return api.sendMessage("🖼️ একটা ছবিতে reply দিয়ে '/gc pp' লিখো", threadID, messageID);
                }
                const imgURL = messageReply.attachments[0].url;
                const imgRes = await axios.get(imgURL, { responseType: "stream" });
                await api.changeGroupImage(imgRes.data, threadID);
                return api.sendMessage("✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒: গ্রুপের প্রোফাইল পিকচার আপডেট করা হয়েছে।", threadID, messageID);
            }

            case "admin": {
                let targetID = (type == "message_reply")? messageReply.senderID : Object.keys(mentions || {})[0];
                if (!targetID) return api.sendMessage("⚠️ কাউকে mention করো বা reply দাও।", threadID, messageID);
                await api.changeAdminStatus(threadID, targetID, true);
                return api.sendMessage("✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒: User কে Admin বানানো হয়েছে।", threadID, messageID);
            }

            case "remove": {
                let targetID = (type == "message_reply")? messageReply.senderID : Object.keys(mentions || {})[0];
                if (!targetID) return api.sendMessage("⚠️ কাউকে mention করো বা reply দাও।", threadID, messageID);
                await api.changeAdminStatus(threadID, targetID, false);
                return api.sendMessage("✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒: User কে Admin থেকে সরানো হয়েছে।", threadID, messageID);
            }

            default: {
                let helpMsg = `╭─────────────╮\n`;
                helpMsg += ` ⚙️ 𝐆𝐂 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒\n`;
                helpMsg += `╰─────────────╯\n\n`;
                helpMsg += `❐ /gc info - গ্রুপের তথ্য\n`;
                helpMsg += `❐ /gc name - নাম/নিকনেম চেঞ্জ\n`;
                helpMsg += `❐ /gc emoji - ইমোজি চেঞ্জ\n`;
                helpMsg += `❐ /gc pp - গ্রুপ ছবি চেঞ্জ\n`;
                helpMsg += `❐ /gc admin - Admin বানাও\n`;
                helpMsg += `❐ /gc remove - Admin সরাও\n\n`;
                helpMsg += `💡 Usage: /gc [option]`;
                return api.sendMessage(helpMsg, threadID, messageID);
            }
        }
    } catch (err) {
        console.log(err);
        return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
};
