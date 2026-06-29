"use strict";

const axios = require("axios");

module.exports = {
    config: {
        name: "imgur",
        aliases: ["imglink", "upload"],
        version: "5.0.2",
        credit: "MOHAMMAD BADOL",
        countDown: 5,
        role: 0,
        shortDescription: "Convert media files to Imgur links",
        longDescription: "Reply to any image, video, or GIF to upload it to Imgur and get the link.",
        category: "Utility",
        guide: "{p}imgur (reply to image/video)"
    },

    onStart: async function (api, event, args) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const attachment = event.messageReply?.attachments?.[0];

        if (!attachment) {
            return api.sendMessage(
                `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                `  ⚠️  𝐈𝐌𝐆𝐔𝐑 𝐔𝐏𝐋𝐎𝐀𝐃 𝐄𝐑𝐑𝐎𝐑  ⚠️\n` +
                `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `📢 Please reply to an image, video, or GIF file to use this command.`,
                threadID, messageID
            );
        }

        const loadingInfo = await new Promise((resolve) => {
            api.sendMessage("⏳ Uploading to Imgur... Please wait...", threadID, (err, info) => {
                resolve(err ? null : info);
            }, messageID);
        });

        try {
            const apiUrl = `https://sagor-apis-nx.vercel.app/sagor/imgur?url=${encodeURIComponent(attachment.url)}`;
            const res = await axios.get(apiUrl);

            if (loadingInfo?.messageID) {
                try { await api.unsendMessage(loadingInfo.messageID); } catch (_) {}
            }

            if (!res.data || res.data.status !== "success") {
                return api.sendMessage("❌ Upload failed from API server.", threadID, messageID);
            }

            const d = res.data.data;

            const outputMessage = 
                `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                `  🌐  𝐈𝐌𝐆𝐔𝐑 𝐔𝐏𝐋𝐎𝐀𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  🌐\n` +
                `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `🔗 **Your Link:** ${d.link}\n\n` +
                `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                `  👤 Developer: MOHAMMAD BADOL\n` +
                `┗━━━━━━━━━━━━━━━━━━━━┛`;

            return api.sendMessage(outputMessage, threadID, messageID);

        } catch (err) {
            if (loadingInfo?.messageID) {
                try { await api.unsendMessage(loadingInfo.messageID); } catch (_) {}
            }
            return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
        }
    },

    onReply: async function (api, event, cache) {
        return this.onStart(api, event, []);
    }
};

