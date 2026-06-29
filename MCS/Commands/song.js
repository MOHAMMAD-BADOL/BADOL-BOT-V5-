/**
 * MCS-BOT COMMAND: DIRECT SONG / VIDEO DOWNLOAD
 * AUTHOR: MOHAMMAD BADOL
 * SYSTEM: V5 PRO COMPATIBLE (100% CLEAN & ENGLISH ONLY)
 */

const axios = require('axios');
const Youtube = require('youtube-search-api');
const { ytdown } = require('nayan-media-downloaders');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "song",
        aliases: ["sing", "yt"],
        version: "5.3.0",
        role: 0, 
        credit: "MOHAMMAD BADOL", 
        cooldown: 5, 
        category: "Media",
        description: "Download song or video directly from YouTube.",
        usage: "/song [song name]",
        prefix: true
    },

    onStart: async function (api, event, args) {
        const { threadID, messageID } = event;

        const songName = args.join(" ").trim();
        
        if (!songName) {
            return api.sendMessage(
                "🎵 Please enter a song name.\nExample: /song shape of you", 
                threadID, 
                messageID
            );
        }

        let loadingInfo;
        
        try {
            loadingInfo = await new Promise((resolve, reject) => {
                api.sendMessage("⏳ Searching on YouTube, please wait...", threadID, (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                }, messageID);
            });
        } catch (e) {
            console.error("Loading message failed", e);
        }

        const cacheDir = path.join(__dirname, "../../cache"); 
        let filePath = "";

        try {
            const searchResult = await Youtube.GetListByKeyword(songName, false, 1);
            
            if (!searchResult.items || searchResult.items.length === 0) {
                if (loadingInfo) api.unsendMessage(loadingInfo.messageID).catch(() => {});
                return api.sendMessage("❌ Sorry, no song found with that name.", threadID, messageID);
            }

            const videoId = searchResult.items[0].id;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            const downloadInfo = await ytdown(videoUrl);
            
            if (!downloadInfo.status || !downloadInfo.data || !downloadInfo.data.video) {
                throw new Error("Download URL not found from API");
            }

            const { title, video } = downloadInfo.data;

            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            filePath = path.join(cacheDir, `${Date.now()}_song.mp4`);

            const res = await axios({
                method: 'get',
                url: video,
                responseType: 'stream',
                timeout: 30000
            });

            const writer = fs.createWriteStream(filePath);
            res.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const msg = {
                body: `🎥 Title: ${title}\n\nDownloaded by BADOL-BOT V5`,
                attachment: fs.createReadStream(filePath)
            };

            api.sendMessage(msg, threadID, (err) => {
                if (loadingInfo) api.unsendMessage(loadingInfo.messageID).catch(() => {});
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, messageID);

        } catch (err) {
            console.error("Song Command Error:", err);
            if (loadingInfo) api.unsendMessage(loadingInfo.messageID).catch(() => {});
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            
            api.sendMessage(`❌ Error: Failed to download the video. Please try again with another name.`, threadID, messageID);
        }
    }
};

