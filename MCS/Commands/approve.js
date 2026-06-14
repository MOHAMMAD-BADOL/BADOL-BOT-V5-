const fs = require("fs");
const path = require("path");
const axios = require("axios");
const os = require("os");

// 📊 PREMIUM SHORT BOX DESIGN
function box(title, content) {
    return `╔══🪩 〖 ${title} 〗🪩══╗\n\n${content}\n\n╚═════════════════════╝`;
}

// ℹ️ COMPLETE ENGLISH GUIDE
const getGuideLines = () => {
    return `⚙️  [ COMMANDS USAGE ] ⚙️\n\n` +
           `🔹 View & Reply Approve:\n` +
           `   » /approve\n\n` +
           `🔹 Live Dashboard:\n` +
           `   » /approve status\n\n` +
           `🔹 Approved Groups List:\n` +
           `   » /approve list\n\n` +
           `🔹 Direct ID Approve:\n` +
           `   » /approve <group_id>\n\n` +
           `🔹 Revoke Approval:\n` +
           `   » /approve remove <group_id>\n\n` +
           `🔹 Deep Inbox Scan:\n` +
           `   » /approve scan`;
};

// Sync config and memory
const saveConfigAndSync = (configPath, config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
    if (typeof global.reloadConfig === "function") {
        global.reloadConfig();
    }
};

// 📝 English Log Notification to Owner
const sendLogToOwner = async (api, config, logTitle, logDetail) => {
    const ownerID = config.OWNER_LOCK?.ID;
    if (!ownerID) return;
    
    const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const logMsg = `╭───❏ 📝 SYSTEM LOG\n` +
                    `│ 📌 EVENT: ${logTitle}\n` +
                    `│ 📄 DETAIL: ${logDetail}\n` +
                    `│ ⏰ TIME: ${time}\n` +
                    `╰─────────────────`;
    try {
        await api.sendMessage(logMsg, ownerID);
    } catch (e) {}
};

// Uptime Formatter
const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

module.exports = {
    config: {
        name: "approve",
        version: "6.5.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        description: "Advanced Approval System with Premium Short Box and English Outputs",
        prefix: true,
        aliases: ["apv"],
        cooldown: 3
    },

    onStart: async (api, event, args) => {
        const configPath = path.resolve(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if (!config.APPROVAL_SYSTEM.APPROVED_THREADS) config.APPROVAL_SYSTEM.APPROVED_THREADS = [];
        if (!config.APPROVAL_SYSTEM.PENDING_THREADS) config.APPROVAL_SYSTEM.PENDING_THREADS = [];

        const action = args[0]?.toLowerCase();

        // Invalid Action Router
        const validActions = ["status", "list", "remove", "scan", "help"];
        if (args[0] && isNaN(args[0]) && !validActions.includes(action)) {
            return api.sendMessage(box("INVALID COMMAND", getGuideLines()), event.threadID);
        }

        if (action === "help") {
            return api.sendMessage(box("HELP MENU", getGuideLines()), event.threadID);
        }

        // 📊 1. Dashboard Status
        if (action === "status") {
            const uptimeSeconds = process.uptime();
            const botUptime = formatUptime(uptimeSeconds);
            const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
            const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
            const usedMem = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);

            const statusContent = `🤖 Name: ${config.BOT_INFO.NAME}\n` +
                                  `⏱️ Uptime: ${botUptime}\n` +
                                  `🟢 Approved Threads: ${config.APPROVAL_SYSTEM.APPROVED_THREADS.length}\n` +
                                  `🟡 Pending Threads: ${config.APPROVAL_SYSTEM.PENDING_THREADS.length}\n` +
                                  `💾 Process Heap: ${usedMem} MB\n` +
                                  `🖥️ Free RAM: ${freeMem}GB / ${totalMem}GB`;

            return api.sendMessage(box("LIVE DASHBOARD", statusContent), event.threadID);
        }

        // 📋 2. Approved List
        if (action === "list") {
            const approvedList = config.APPROVAL_SYSTEM.APPROVED_THREADS;
            if (approvedList.length === 0) {
                return api.sendMessage(box("APPROVED LIST", "No approved groups found in database."), event.threadID);
            }
            
            let msg = "";
            for (let i = 0; i < approvedList.length; i++) {
                let gName = "Unknown Group (Cached out)";
                try {
                    let tInfo = await api.getThreadInfo(approvedList[i]);
                    gName = tInfo.threadName || "Unnamed Group";
                } catch (e) {}
                msg += `${i + 1}. 📛 ${gName}\n🆔 ID: ${approvedList[i]}\n\n`;
            }
            return api.sendMessage(box("APPROVED LIST", msg.trim()), event.threadID);
        }

        // ❌ 3. Remove Group
        if (action === "remove") {
            const targetID = args[1];
            if (!targetID) {
                return api.sendMessage(box("USAGE ERROR", "Missing target Thread ID.\n\n» /approve remove <id>"), event.threadID);
            }

            config.APPROVAL_SYSTEM.APPROVED_THREADS = config.APPROVAL_SYSTEM.APPROVED_THREADS.map(String);
            if (!config.APPROVAL_SYSTEM.APPROVED_THREADS.includes(String(targetID))) {
                return api.sendMessage(box("ERROR", "This Thread ID is not approved."), event.threadID);
            }

            let gName = "Unknown Group";
            try { const tInfo = await api.getThreadInfo(targetID); gName = tInfo.threadName || "Unnamed Group"; } catch(e){}

            config.APPROVAL_SYSTEM.APPROVED_THREADS = config.APPROVAL_SYSTEM.APPROVED_THREADS.filter(id => id !== String(targetID));
            saveConfigAndSync(configPath, config);

            await sendLogToOwner(api, config, "ACCESS_REVOKED", `Name: ${gName}\nID: ${targetID}\nBy: Admin`);

            return api.sendMessage(box("REVOKED", `Successfully removed:\n${gName}\nFrom approved database.`), event.threadID);
        }

        // 🔍 4. Inbox Scan
        if (action === "scan") {
            const waitMsg = await api.sendMessage(box("SCANNING", "Scanning 500 inbox threads, please wait..."), event.threadID);
            try {
                const threads = await api.getThreadList(500, null, ["INBOX"]);
                const groups = threads.filter(t => t.isGroup);
                let addedCount = 0;

                const approvedList = config.APPROVAL_SYSTEM.APPROVED_THREADS.map(String);

                for (const group of groups) {
                    const gID = String(group.threadID);
                    const isApproved = approvedList.includes(gID);
                    const isPending = config.APPROVAL_SYSTEM.PENDING_THREADS.some(t => String(t.id) === gID);

                    if (!isApproved && !isPending) {
                        config.APPROVAL_SYSTEM.PENDING_THREADS.push({
                            id: gID,
                            name: group.name || "Unnamed Group"
                        });
                        addedCount++;
                    }
                }

                saveConfigAndSync(configPath, config);
                await api.deleteMessage(waitMsg.messageID);
                
                await sendLogToOwner(api, config, "DEEP_SCAN", `New Pending: ${addedCount}\nTotal Pending: ${config.APPROVAL_SYSTEM.PENDING_THREADS.length}`);

                const scanContent = `Total Groups: ${groups.length}\nNew Pending: ${addedCount}\nTotal Pending: ${config.APPROVAL_SYSTEM.PENDING_THREADS.length}\n\n» Reply /approve to view`;
                return api.sendMessage(box("SCAN COMPLETE", scanContent), event.threadID);
            } catch (e) {
                return api.sendMessage(box("ERROR", `Scan crashed: ${e.message}`), event.threadID);
            }
        }

        // ⚡ 5. Direct ID Approve
        if (args[0] && !isNaN(args[0]) && args[0].length > 10) {
            const directID = String(args[0]);
            config.APPROVAL_SYSTEM.APPROVED_THREADS = config.APPROVAL_SYSTEM.APPROVED_THREADS.map(String);

            if (config.APPROVAL_SYSTEM.APPROVED_THREADS.includes(directID)) {
                return api.sendMessage(box("INFO", "This group is already approved."), event.threadID);
            }

            let gName = "Unknown Group";
            try { const tInfo = await api.getThreadInfo(directID); gName = tInfo.threadName || "Unnamed Group"; } catch(e){}

            config.APPROVAL_SYSTEM.APPROVED_THREADS.push(directID);
            config.APPROVAL_SYSTEM.PENDING_THREADS = config.APPROVAL_SYSTEM.PENDING_THREADS.filter(t => String(t.id) !== directID);

            saveConfigAndSync(configPath, config);

            await sendLogToOwner(api, config, "DIRECT_APPROVAL", `Name: ${gName}\nID: ${directID}`);

            try {
                await api.sendMessage(`┌─[ GROUP APPROVED ]─┐\n│\n│ Approved By: ${config.OWNER_LOCK.NAME}\n│ Bot: ${config.BOT_INFO.NAME}\n│ Type ${config.BOT_INFO.PREFIX}help to start!\n└────────────────────⭔`, directID);
            } catch (err) {}

            return api.sendMessage(box("SUCCESS", `Group: ${gName}\nApproved successfully!`), event.threadID);
        }

        // 📋 6. Main Pending List Menu
        if (!config.APPROVAL_SYSTEM.PENDING_THREADS || config.APPROVAL_SYSTEM.PENDING_THREADS.length === 0) {
            return api.sendMessage(box("NO REQUESTS", "Pending queue is empty.\n\n» Type /approve scan to fetch."), event.threadID);
        }

        let list = "";
        config.APPROVAL_SYSTEM.PENDING_THREADS.forEach((group, index) => {
            list += `${index + 1}. 👥 ${group.name}\n🆔 ID: ${group.id}\n\n`;
        });
        
        const pendingContent = `${list.trim()}\n\n👉 Reply with serial number to approve.\n👉 Type /approve help for menu.`;
        const info = await api.sendMessage(box("PENDING LIST", pendingContent), event.threadID);
        
        global.msgCache.set(info.messageID, { 
            commandName: "approve",
            body: pendingContent,
            senderID: api.getCurrentUserID()
        });
    },

    onReply: async (api, event, cache) => {
        if (!cache || cache.commandName !== "approve") return;

        const configPath = path.resolve(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const index = parseInt(event.body) - 1;

        if (isNaN(index) || index < 0 || index >= config.APPROVAL_SYSTEM.PENDING_THREADS.length) {
            return api.sendMessage(box("ERROR", "Invalid serial index number!"), event.threadID);
        }

        const targetGroup = config.APPROVAL_SYSTEM.PENDING_THREADS[index];
        const ownerName = config.OWNER_LOCK.NAME;
        const targetID = String(targetGroup.id);

        config.APPROVAL_SYSTEM.APPROVED_THREADS = config.APPROVAL_SYSTEM.APPROVED_THREADS.map(String);
        if (!config.APPROVAL_SYSTEM.APPROVED_THREADS.includes(targetID)) {
            config.APPROVAL_SYSTEM.APPROVED_THREADS.push(targetID);
        }
        config.APPROVAL_SYSTEM.PENDING_THREADS.splice(index, 1);
        
        saveConfigAndSync(configPath, config);
        global.msgCache.delete(event.messageReply.messageID);

        await sendLogToOwner(api, config, "REPLY_APPROVAL", `Name: ${targetGroup.name}\nID: ${targetID}`);

        const driveFileId = "1ITONZqIZdgshuwVC1Sgk1KservMD9lMT";
        const driveDownloadUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
        
        const approvalMsg = `┌─[ GROUP APPROVED ]─┐\n│\n│ Congratulations!\n│ Your group has been approved.\n│\n│ Approved By: ${ownerName}\n│ Date: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}\n│ Bot: ${config.BOT_INFO.NAME}\n│\n│ Type ${config.BOT_INFO.PREFIX}help to view commands\n└────────────────────⭔`;

        try {
            const imgPath = path.resolve(__dirname, `../../temp_approve_${Date.now()}.jpg`);
            const imgRes = await axios.get(driveDownloadUrl, { responseType: "arraybuffer", timeout: 15000 });
            fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

            await api.sendMessage({
                body: approvalMsg,
                attachment: fs.createReadStream(imgPath)
            }, targetID, (err) => {
                if (fs.existsSync(imgPath)) {
                    try { fs.unlinkSync(imgPath); } catch(e) {}
                }
            });
        } catch (e) {
            await api.sendMessage(approvalMsg, targetID);
        }

        api.sendMessage(box("SUCCESS", `Approved:\n${targetGroup.name}\n\nNotice dispatched to thread.`), event.threadID);
    }
};
