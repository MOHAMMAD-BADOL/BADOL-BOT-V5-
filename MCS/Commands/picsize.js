const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "pic",
    version: "2.0.0",
    credit: "MOHAMMAD BADOL",
    cooldown: 5,
    role: 0,
    prefix: true,
    category: "Tool",
    description: "Get image resolution, size, and download link",
    usages: "[reply to image]",
    aliases: ["picsize", "pinfo", "imginfo"]
};

module.exports.onStart = async function (api, event, args) {
    const { threadID, messageID, messageReply } = event;

    // Check: If it's a reply to a message with photo
    if (!messageReply ||!messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage(
            `╭─[ 📸 PIC ANALYZER ]─╮\n` +
            `│ ⚠️ Please **reply to an image** to use this command\n` +
            `│\n` +
            `│ 💡 Example:\n` +
            `│ 1. Send an image\n` +
            `│ 2. Reply with /pic\n` +
            `╰───────────────╯`,
            threadID,
            messageID
        );
    }

    // Get first photo attachment
    const attachment = messageReply.attachments.find(att => att.type === "photo" || att.type === "animated_image");
    
    if (!attachment) {
        return api.sendMessage(
            `╭─[ ❌ ERROR ]─╮\n` +
            `│ No image found in replied message!\n` +
            `│ 💡 Please reply to a photo\n` +
            `╰───────────────╯`,
            threadID,
            messageID
        );
    }

    const waitMsg = await api.sendMessage("⏳ Analyzing image...", threadID, messageID);

    try {
        const imageUrl = attachment.url || attachment.largePreviewUrl || attachment.previewUrl || attachment.hdUrl;
        
        if (!imageUrl) {
            await api.unsendMessage(waitMsg.messageID).catch(() => {});
            return api.sendMessage("❌ Could not get image URL!", threadID, messageID);
        }

        // Get image info using HEAD request
        let fileSize = 0;
        let contentType = "image/jpeg";
        
        try {
            const headRes = await axios.head(imageUrl, {
                timeout: 10000,
                maxRedirects: 5
            });
            
            fileSize = parseInt(headRes.headers['content-length']) || 0;
            contentType = headRes.headers['content-type'] || "image/jpeg";
        } catch (e) {
            console.log("HEAD request failed, trying to download:", e.message);
            // Fallback: download to get size
            const tempRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
            fileSize = tempRes.data.length;
        }

        // Size calculation (KB/MB)
        const size = fileSize >= 1048576 
            ? `${(fileSize / 1048576).toFixed(2)} MB` 
            : fileSize >= 1024
            ? `${(fileSize / 1024).toFixed(2)} KB`
            : `${fileSize} Bytes`;

        // Resolution - Facebook provides in attachment
        const width = attachment.width || attachment.original_width || "Unknown";
        const height = attachment.height || attachment.original_height || "Unknown";
        const resolution = (width !== "Unknown" && height !== "Unknown") 
            ? `${width} × ${height}` 
            : "Unknown";

        // Accurate Time Sync (Asia/Dhaka)
        const options = {
            timeZone: 'Asia/Dhaka',
            hour12: true,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const currentTime = new Intl.DateTimeFormat('en-US', options).format(new Date());

        // Get file extension
        const ext = contentType.includes('png') ? 'png' : 
                   contentType.includes('gif') ? 'gif' : 
                   contentType.includes('webp') ? 'webp' : 'jpg';

        await api.unsendMessage(waitMsg.messageID).catch(() => {});

        const response = `
╭─[ 📸 PHOTO ANALYZER ]─╮
├─────────────────┤
│ 📏 *Resolution:* ${resolution} px
│ 📦 *File Size:* ${size}
│ 🖼️ *Format:* ${ext.toUpperCase()}
│ ⏰ *Analyzed:* ${currentTime}
│ 👤 *Credit:* MOHAMMAD BADOL
├─────────────────┤
│ 🔗 *Direct Download:*
│ ${imageUrl}
╰─────────────────╯
`;

        await api.sendMessage(response, threadID, messageID);

    } catch (error) {
        await api.unsendMessage(waitMsg.messageID).catch(() => {});
        console.log("Pic Cmd Error:", error.message);
        return api.sendMessage(
            `╭─[ ⚠️ ERROR ]─╮\n` +
            `│ Failed to retrieve image data!\n` +
            `│ 💡 ${error.message}\n` +
            `╰───────────────╯`,
            threadID,
            messageID
        );
    }
};
