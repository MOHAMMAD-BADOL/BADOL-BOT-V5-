module.exports = {
    config: {
        name: "setting",
        aliases: ["set"],
        prefix: true,
        role: 1, // Admin only
        cooldown: 3,
        credit: "MOHAMMAD BADOL"
    },

    onStart: async (api, event, args) => {
        const { threadID } = event;
        const db = require("../../Database");

        let threadData = await db.getData(threadID, 'threads');
        if (!threadData.data) threadData.data = { resend: true, anti: true, calllog: true };

        const option = args[0];
        const status = args[1];

        // 1. Help Menu (/set)
        if (!option) {
            return api.sendMessage(
                `╭─⚙️ SETTING ─╮\n` +
                `│ /set [option] [on/off]\n` +
                `│\n` +
                `│ 📦 resend - Anti Unsend\n` +
                `│ 🛡️ anti - Anti Change\n` +
                `│ 📞 calllog - Call Info\n` +
                `│ 🌐 all - All Features\n` +
                `│ 📋 list - View Status\n` +
                `╰────────────╯`,
                threadID
            );
        }

        // 2. View Status (/set list)
        if (option === 'list') {
            return api.sendMessage(
                `╭─📊 STATUS ─╮\n` +
                `│ Resend ${threadData.data.resend? "🟢 ON" : "🔴 OFF"}\n` +
                `│ Anti ${threadData.data.anti? "🟢 ON" : "🔴 OFF"}\n` +
                `│ CallLog ${threadData.data.calllog? "🟢 ON" : "🔴 OFF"}\n` +
                `╰────────────╯`,
                threadID
            );
        }

        // 3. Global All Control (/set on /set off)
        if (option === 'on' || option === 'off') {
            const val = (option === 'on');
            threadData.data = { resend: val, anti: val, calllog: val };
            await db.saveData(threadID, threadData, 'threads');
            return api.sendMessage(
                `╭─✅ SUCCESS ─╮\n` +
                `│ All Features\n` +
                `│ ${val? "🟢 ENABLED" : "🔴 DISABLED"}\n` +
                `╰────────────╯`,
                threadID
            );
        }

        // 4. Global All Control (/set all on/off)
        if (option === 'all') {
            if (!status) return api.sendMessage(
                `╭─❌ ERROR ─╮\n` +
                `│ Usage: /set all on/off\n` +
                `╰──────────╯`,
                threadID
            );
            const val = (status === 'on');
            threadData.data = { resend: val, anti: val, calllog: val };
            await db.saveData(threadID, threadData, 'threads');
            return api.sendMessage(
                `╭─✅ SUCCESS ─╮\n` +
                `│ All Features\n` +
                `│ ${val? "🟢 ENABLED" : "🔴 DISABLED"}\n` +
                `╰────────────╯`,
                threadID
            );
        }

        // 5. Individual Control (/set resend on)
        if (['resend', 'anti', 'calllog'].includes(option)) {
            if (status === 'on' || status === 'off') {
                threadData.data[option] = (status === 'on');
                await db.saveData(threadID, threadData, 'threads');

                const icons = { resend: "📦", anti: "🛡️", calllog: "📞" };
                const names = { resend: "Resend", anti: "Anti", calllog: "CallLog" };

                return api.sendMessage(
                    `╭─✅ UPDATED ─╮\n` +
                    `│ ${icons[option]} ${names[option]}\n` +
                    `│ ${status === 'on'? "🟢 ENABLED" : "🔴 DISABLED"}\n` +
                    `╰────────────╯`,
                    threadID
                );
            }
        }

        return api.sendMessage(
            `╭─❌ ERROR ─╮\n` +
            `│ Invalid Option\n` +
            `│ Use /set for help\n` +
            `╰──────────╯`,
            threadID
        );
    }
};