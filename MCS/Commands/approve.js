const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BOT_NAME = "BADOL-BOT-V5";
const DRIVE_LINK = "https://drive.google.com/uc?export=download&id=1ITONZqIZdgshuwVC1Sgk1KservMD9lMT";

function box(title, content) {
    return `╔═[ ${BOT_NAME} ]═╗\n║ ❯ ${title}\n╚════════════════╝\n${content}\n╚════════════════╝`;
}

const saveConfigAndSync = (configPath, config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
    if (typeof global.reloadConfig === "function") global.reloadConfig();
};

module.exports = {
    config: {
        name: "approve",
        version: "5.2.1",
        credit: "MOHAMMAD BADOL",
        role: 1,
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

        if (action === "help") {
            const helpMsg = `• /apv start : Status\n• /apv list : Approved\n• /apv scan : Sync Threads\n• /apv remove <id> : Remove\n• /apv <id> : Direct Approve`;
            return api.sendMessage(box("HELP MENU", helpMsg), event.threadID);
        }

        if (action === "start") {
            const content = `• Bot: ${BOT_NAME}\n• Approved: ${config.APPROVAL_SYSTEM.APPROVED_THREADS.length}\n• Pending: ${config.APPROVAL_SYSTEM.PENDING_THREADS.length}`;
            return api.sendMessage(box("LIVE DASHBOARD", content), event.threadID);
        }

        if (action === "list") {
            const list = config.APPROVAL_SYSTEM.APPROVED_THREADS;
            if (list.length === 0) return api.sendMessage(box("LIST", "No groups found."), event.threadID);
            let msg = "";
            for (let i = 0; i < list.length; i++) {
                let info = await api.getThreadInfo(list[i]).catch(() => ({}));
                msg += `${i + 1}. ${info.threadName || "Unnamed Group"}\n`;
            }
            return api.sendMessage(box("APPROVED LIST", msg.trim()), event.threadID);
        }

        if (action === "remove") {
            const id = args[1];
            if (!id) return api.sendMessage("Provide ID", event.threadID);
            config.APPROVAL_SYSTEM.APPROVED_THREADS = config.APPROVAL_SYSTEM.APPROVED_THREADS.filter(i => i !== id);
            saveConfigAndSync(configPath, config);
            return api.sendMessage(box("SUCCESS", "Removed successfully."), event.threadID);
        }

        if (action === "scan") {
            const threads = await api.getThreadList(50, null, ["INBOX"]);
            let count = 0;
            for (const t of threads.filter(t => t.isGroup)) {
                if (!config.APPROVAL_SYSTEM.APPROVED_THREADS.includes(t.threadID) && !config.APPROVAL_SYSTEM.PENDING_THREADS.some(p => p.id === t.threadID)) {
                    config.APPROVAL_SYSTEM.PENDING_THREADS.push({ id: t.threadID, name: t.threadName || "Unnamed Group" });
                    count++;
                }
            }
            saveConfigAndSync(configPath, config);
            return api.sendMessage(box("SCAN COMPLETE", `Found ${count} new groups.`), event.threadID);
        }

        if (!action) {
            if (!config.APPROVAL_SYSTEM.PENDING_THREADS.length) return api.sendMessage(box("PENDING", "No requests."), event.threadID);
            
            let list = "";
            for (let i = 0; i < config.APPROVAL_SYSTEM.PENDING_THREADS.length; i++) {
                let g = config.APPROVAL_SYSTEM.PENDING_THREADS[i];
                let info = await api.getThreadInfo(g.id).catch(() => ({}));
                g.name = info.threadName || g.name || "Unnamed Group";
                list += `${i + 1}. ${g.name}\n`;
            }
            saveConfigAndSync(configPath, config);

            const info = await api.sendMessage(box("PENDING LIST", list + "\nReply number to approve."), event.threadID);
            global.msgCache.set(info.messageID, { commandName: "approve" });
        }
    },

    onReply: async (api, event, cache) => {
        if (!cache || cache.commandName !== "approve") return;
        const configPath = path.resolve(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const index = parseInt(event.body) - 1;

        if (isNaN(index) || !config.APPROVAL_SYSTEM.PENDING_THREADS[index]) return api.sendMessage("Invalid index.", event.threadID);
        
        let group = config.APPROVAL_SYSTEM.PENDING_THREADS[index];
        let info = await api.getThreadInfo(group.id).catch(() => ({}));
        group.name = info.threadName || group.name;

        config.APPROVAL_SYSTEM.APPROVED_THREADS.push(group.id);
        config.APPROVAL_SYSTEM.PENDING_THREADS.splice(index, 1);
        saveConfigAndSync(configPath, config);

        api.sendMessage(box("SUCCESS", `Approved: ${group.name}`), event.threadID);

        const approvalMsg = `✅ Congratulations!\n\nGroup '${group.name}' has been approved by MOHAMMAD BADOL\n\nBot: ${BOT_NAME}`;
        try {
            const imgPath = path.resolve(__dirname, `../../temp_${Date.now()}.jpg`);
            const res = await axios.get(DRIVE_LINK, { responseType: "arraybuffer", timeout: 15000 });
            fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));
            await api.sendMessage({ body: approvalMsg, attachment: fs.createReadStream(imgPath) }, group.id, () => fs.unlinkSync(imgPath));
        } catch (e) {
            api.sendMessage(approvalMsg, group.id);
        }
    }
};
