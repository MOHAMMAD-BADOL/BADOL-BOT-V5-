const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
    config: {
        name: "midiack",
        version: "5.0.0",
        credit: "MOHAMMAD BADOL",
        cooldown: 5,
        role: 0,
        description: "Display complete bot information and statistics",
        category: "System",
        prefix: false
    },

    onStart: async function (api, event) {
        const { threadID, messageID, senderID } = event;
        const config = global.config || require("../../config.json");
        const startTime = Date.now();

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const botRam = (memUsage.rss / 1024 / 1024).toFixed(2);
        const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
        const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
        const external = (memUsage.external / 1024 / 1024).toFixed(2);
        const systemRam = ((usedMem / totalMem) * 100).toFixed(2);

        const cpus = os.cpus();
        const cpuModel = cpus[0].model.split(" ").slice(0, 4).join(" ");
        const cpuCores = cpus.length;
        const cpuSpeed = (cpus[0].speed / 1000).toFixed(2);
        const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(", ");

        const networkInterfaces = os.networkInterfaces();
        let localIP = "N/A";
        for (const name of Object.keys(networkInterfaces)) {
            for (const net of networkInterfaces[name]) {
                if (net.family === "IPv4" &&!net.internal) {
                    localIP = net.address;
                    break;
                }
            }
            if (localIP!== "N/A") break;
        }

        const totalGroups = global.data?.allThreadID?.length || 0;
        const totalCommands = global.commands?.size || 0;
        const totalEvents = global.events?.size || 0;
        const totalUsers = Object.keys(global.data?.users || {}).length;

        const categories = {};
        let totalAliases = 0;
        for (const cmd of global.commands.values()) {
            const cat = cmd.config.category || "Other";
            categories[cat] = (categories[cat] || 0) + 1;
            if (cmd.config.aliases) totalAliases += cmd.config.aliases.length;
        }
        const categoryList = Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([cat, count]) => `${cat}:${count}`)
          .join(" | ");

        const admins = config.ADMIN_SYSTEM?.ADMINS || [];
        let adminNames = [];
        try {
            const adminInfo = await api.getUserInfo(admins);
            adminNames = admins.map(id => adminInfo[id]?.name || id).slice(0, 2);
        } catch (e) {}

        const bannedUsers = config.ACCESS_CONTROL?.BANNED_USERS?.length || 0;
        const bannedThreads = config.ACCESS_CONTROL?.BANNED_THREADS?.length || 0;
        const approvedThreads = config.APPROVAL_SYSTEM?.APPROVED_THREADS?.length || 0;
        const pendingThreads = config.APPROVAL_SYSTEM?.PENDING_THREADS?.length || 0;

        let dbSize = "0 KB";
        let dbFiles = 0;
        try {
            const dbPath = path.join(__dirname, "../../Database");
            if (fs.existsSync(dbPath)) {
                const files = fs.readdirSync(dbPath);
                dbFiles = files.length;
                let totalSize = 0;
                files.forEach(file => {
                    const stats = fs.statSync(path.join(dbPath, file));
                    totalSize += stats.size;
                });
                dbSize = (totalSize / 1024).toFixed(2) + " KB";
            }
        } catch (e) {}

        let cacheSize = "0 KB";
        let cacheFiles = 0;
        try {
            const cachePath = path.join(__dirname, "../../cache");
            if (fs.existsSync(cachePath)) {
                const files = fs.readdirSync(cachePath);
                cacheFiles = files.length;
                let totalSize = 0;
                files.forEach(file => {
                    const stats = fs.statSync(path.join(cachePath, file));
                    totalSize += stats.size;
                });
                cacheSize = (totalSize / 1024).toFixed(2) + " KB";
            }
        } catch (e) {}

        const isAdmin = config.ADMIN_SYSTEM?.ADMINS?.includes(senderID);
        const isOwner = senderID === config.OWNER_LOCK?.ID;
        const userRole = isOwner? "Owner" : isAdmin? "Admin" : "User";
        const isBanned = config.ACCESS_CONTROL?.BANNED_USERS?.includes(senderID);
        const isGroupBanned = config.ACCESS_CONTROL?.BANNED_THREADS?.includes(threadID);
        const isApproved = config.APPROVAL_SYSTEM?.APPROVED_THREADS?.includes(threadID);

        const pingStart = Date.now();
        await new Promise(resolve => setImmediate(resolve));
        const ping = Date.now() - pingStart;

        const nodeVersion = process.version;
        let packageVersion = "5.1.0";
        let dependencies = 0;
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8"));
            packageVersion = pkg.version || "5.1.0";
            dependencies = Object.keys(pkg.dependencies || {}).length;
        } catch (e) {}

        const pid = process.pid;
        const platform = `${os.platform()} ${os.arch()}`;
        const hostname = os.hostname().slice(0, 20);

        const currentTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
            hour12: true,
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        const botStartTime = new Date(global.botStartTime).toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
            hour12: true,
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        let userName = "Unknown";
        try {
            const userInfo = await api.getUserInfo(senderID);
            userName = userInfo[senderID]?.name || "Unknown";
        } catch (e) {}

        let threadName = "Inbox";
        let threadMemberCount = 0;
        let threadAdminIDs = [];
        let threadImage = "No";
        let threadType = "Unknown";
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            threadName = threadInfo.threadName || "Unknown Group";
            threadMemberCount = threadInfo.participantIDs?.length || 0;
            threadAdminIDs = threadInfo.adminIDs?.map(a => a.id) || [];
            threadImage = threadInfo.imageSrc? "Yes" : "No";
            threadType = threadInfo.isGroup? "Group" : "Private";
        } catch (e) {}

        let errorCount = 0;
        try {
            const logPath = path.join(__dirname, "../../bot.log");
            if (fs.existsSync(logPath)) {
                const logs = fs.readFileSync(logPath, "utf-8");
                errorCount = (logs.match(/ERROR/gi) || []).length;
            }
        } catch (e) {}

        let maxCooldown = 0;
        let maxCooldownCmd = "None";
        for (const cmd of global.commands.values()) {
            if (cmd.config.cooldown > maxCooldown) {
                maxCooldown = cmd.config.cooldown;
                maxCooldownCmd = cmd.config.name;
            }
        }

        const responseTime = Date.now() - startTime;

        const message =
`╭─────────────────────────╮
│ 🤖 BADOL-BOT-V5 INFO │
╰─────────────────────────╯

👑 DEVELOPER
├ Name: MOHAMMAD BADOL
├ ID: ${config.OWNER_LOCK?.ID || "61590785637035"}
├ Facebook: fb.com/B4D9L00
└ GitHub: github.com/mohammadbadol

⚡ BOT CORE
├ Name: ${config.BOT_INFO?.NAME || "BADOL-BOT-V5"}
├ Prefix: ${config.BOT_INFO?.PREFIX || "/"}
├ Version: V${packageVersion}
├ Node: ${nodeVersion}
├ PID: ${pid}
├ Started: ${botStartTime}
├ Uptime: ${uptimeString}
├ Ping: ${ping}ms | Response: ${responseTime}ms
└ Status: Online

💻 SYSTEM
├ Bot RAM: ${botRam} MB (Heap: ${heapUsed}/${heapTotal} MB)
├ External: ${external} MB
├ System RAM: ${systemRam}% Used
├ Free RAM: ${(freeMem / 1024).toFixed(2)} GB
├ CPU: ${cpuModel}
├ Cores: ${cpuCores} @ ${cpuSpeed}GHz
├ Load: ${loadAvg}
├ Platform: ${platform}
├ Host: ${hostname}
└ Local IP: ${localIP}

📊 STATISTICS
├ Commands: ${totalCommands} (${totalAliases} aliases)
├ Events: ${totalEvents}
├ Groups: ${totalGroups}
├ Users: ${totalUsers}
├ Admins: ${admins.length}
├ Cache: ${global.msgCache?.size || 0} msgs
├ Database: ${dbFiles} files (${dbSize})
├ Cache Dir: ${cacheFiles} files (${cacheSize})
├ Dependencies: ${dependencies}
├ Errors: ${errorCount}
└ Top Categories: ${categoryList}

🔐 SECURITY
├ Banned Users: ${bannedUsers}
├ Banned Groups: ${bannedThreads}
├ Approved: ${approvedThreads}
├ Pending: ${pendingThreads}
├ Approval: ${config.APPROVAL_SYSTEM?.ENABLED? "ON" : "OFF"}
├ Admin Mode: ${config.ADMIN_SYSTEM?.ADMIN_ONLY_MODE? "ON" : "OFF"}
├ Remote Ban: ON
├ Max Cooldown: ${maxCooldown}s (${maxCooldownCmd})
└ Top Admins: ${adminNames.join(", ") || "None"}

⚙️ ACTIVE SYSTEMS
├ Auto Reconnect: ON
├ Keep-Alive: ON (4min)
├ Resend: ON
├ Strict Prefix: ON
├ Levenshtein: ON
├ Cooldown: ON
├ Role System: ON
├ Notice Listener: ON
└ Owner Lock: ON

👤 YOUR PROFILE
├ Name: ${userName}
├ ID: ${senderID}
├ Role: ${userRole}
├ Ban Status: ${isBanned? "Banned" : "Clean"}
└ Access: ${isOwner || isAdmin? "Full Access" : "Limited"}

💬 CURRENT THREAD
├ Name: ${threadName}
├ ID: ${threadID}
├ Type: ${threadType}
├ Members: ${threadMemberCount}
├ Admins: ${threadAdminIDs.length}
├ Image: ${threadImage}
├ Approval: ${config.APPROVAL_SYSTEM?.ENABLED? (isApproved? "Approved" : "Pending") : "Disabled"}
└ Ban: ${isGroupBanned? "Banned" : "Clean"}

🕐 TIME
└ ${currentTime}

╭──────────────────╮
│ ${config.BOT_INFO?.PREFIX || "/"}help - All Commands
│ ${config.BOT_INFO?.PREFIX || "/"}call - Support
│ ${config.BOT_INFO?.PREFIX || "/"}rules - Rules
╰──────────────────╯`;

        return api.sendMessage(message, threadID, messageID);
    }
};