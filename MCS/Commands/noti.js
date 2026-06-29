const axios = require("axios");

module.exports = {
    config: {
        name: "noti",
        version: "2.0.0",
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 10,
        description: "সব গ্রুপে Premium নোটিফিকেশন পাঠাও",
        commandCategory: "admin",
        usages: "[message] | [reply to file]",
        aliases: ["note", "notify", "broadcast"]
    },

    onStart: async function (api, event, args) {
        const { threadID, messageID, type, messageReply } = event;

        if (!args[0] && type!== "message_reply") {
            return api.sendMessage(
                "╭─── 📢 NOTIFICATION ───╮\n\n" +
                "▸ /noti [মেসেজ]\n" +
                "▸ /noti [ফাইল রিপ্লাই]\n\n" +
                "সব গ্রুপে Premium নোটিস পাঠায়\n\n" +
                "╰────────────────────────╯",
                threadID, messageID
            );
        }

        const text = args.join(" ").trim();

        // 🟢 Premium Footer Box
        const footerBox =
            `\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🤖 **BADOL-BOT-V5**\n` +
            `👑 **DEV:** MOHAMMAD BADOL\n` +
            `🔗 **FB link:** m.me/B4D9L00\n` + // 🟢 তোমার FB ID বসাও
            `━━━━━━━━━━━━━━━━━━━━`;

        try {
            const allThreads = await api.getThreadList(100, null, ["INBOX"]);
            const groups = allThreads.filter(t => t.isGroup && t.name);

            if (!groups.length) {
                return api.sendMessage("❌ কোনো গ্রুপ পাওয়া যায়নি।", threadID, messageID);
            }

            const infoMsg = await api.sendMessage(
                `╭─── 📢 BROADCASTING ───╮\n\n` +
                `⏳ পাঠানো হচ্ছে...\n` +
                `📋 টার্গেট: ${groups.length} টা গ্রুপ\n\n` +
                `╰────────────────────────╯`,
                threadID
            );

            let sent = 0, failed = 0;

            for (const t of groups) {
                const tid = t.threadID;
                try {
                    if (type === "message_reply" && messageReply) {
                        const attachments = messageReply.attachments || [];

                        if (attachments.length > 0) {
                            const streams = [];

                            for (const att of attachments) {
                                try {
                                    const url = att.url || att.playableUrl || att.previewUrl;
                                    if (!url) continue;
                                    const res = await axios.get(url, { responseType: "stream" });
                                    streams.push(res.data);
                                } catch (_) {}
                            }

                            if (streams.length > 0) {
                                const msgObj = {
                                    body: `📢 **ANNOUNCEMENT** 📢\n` +
                                          `━━━━━━━━━━━━━━━━━━━━\n\n` +
                                          `${text || messageReply.body || "গুরুত্বপূর্ণ নোটিশ"}` +
                                          footerBox,
                                    attachment: streams.length === 1? streams[0] : streams
                                };
                                await api.sendMessage(msgObj, String(tid));
                            } else {
                                const body =
                                    `📢 **ANNOUNCEMENT** 📢\n` +
                                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                                    `${text || messageReply.body || ""}` +
                                    footerBox;
                                if (body.trim()!== `📢 **ANNOUNCEMENT** 📢\n━━━━━━━━━━━━━━━━━━━━\n\n${footerBox}`) {
                                    await api.sendMessage(body, String(tid));
                                }
                            }
                        } else {
                            const body =
                                `📢 **ANNOUNCEMENT** 📢\n` +
                                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                                `${text || messageReply.body || ""}` +
                                footerBox;
                            if (body.trim()!== `📢 **ANNOUNCEMENT** 📢\n━━━━━━━━━━━━━━━━━━━━\n\n${footerBox}`) {
                                await api.sendMessage(body, String(tid));
                            }
                        }
                    } else {
                        await api.sendMessage(
                            `📢 **ANNOUNCEMENT** 📢\n` +
                            `━━━━━━━━━━━━━━━━━━━━\n\n` +
                            `${text}` +
                            footerBox,
                            String(tid)
                        );
                    }
                    sent++;
                } catch (_) {
                    failed++;
                }

                await new Promise(r => setTimeout(r, 500)); // 500ms delay - safe
            }

            const result =
                `╭─── 📢 BROADCAST DONE ───╮\n\n` +
                `✅ সফল: ${sent} টা গ্রুপ\n` +
                (failed > 0? `❌ ফেইল: ${failed} টা গ্রুপ\n` : "") +
                `📋 মোট: ${groups.length} টা গ্রুপ\n` +
                `⏱️ সময়: ${Math.floor((sent + failed) * 0.5)} সেকেন্ড\n\n` +
                `╰────────────────────────╯`;

            try {
                if (infoMsg && infoMsg.messageID) {
                    await api.unsendMessage(infoMsg.messageID);
                }
            } catch (_) {}

            return api.sendMessage(result, threadID, messageID);

        } catch (error) {
            console.log("Error:", error.message);
            return api.sendMessage("❌ নোটিফিকেশন পাঠাতে এরর হইছে।", threadID, messageID);
        }
    }
};
