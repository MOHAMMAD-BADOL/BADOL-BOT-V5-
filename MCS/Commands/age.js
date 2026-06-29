/**
 * 🤖 MCS-BOT COMMAND: AGE CALCULATOR (FULL DETAILS + PHOTO)
 * 👤 AUTHOR: MOHAMMAD BADOL
 */

const axios = require("axios");
const fs = require("fs");

module.exports = {
    config: {
        name: "age",
        aliases: ["myage"],
        description: "ছবিসহ বয়সের পূর্ণাঙ্গ তথ্য (ঘণ্টা, মিনিট, সেকেন্ডসহ)",
        usage: "age DD-MM-YYYY",
        role: 0,
        cooldown: 5,
        prefix: true,
        credit: "MOHAMMAD BADOL"
    },

    onStart: async (api, event, args) => {
        const { threadID, messageID, senderID } = event;
        const credit = "MOHAMMAD BADOL";

        let input = args.join(" ");
        if (!input) {
            return api.sendMessage(
                `╭─⚠️ WARNING ─╮\n` +
                `│ জন্মতারিখ দিন!\n` +
                `│ 💡 উদাহরণ: /age 06-01-1998\n` +
                `╰─────────────╯`,
                threadID, messageID
            );
        }

        let parts = input.trim().split(/[-\/.]/);
        if (parts.length!== 3) {
            return api.sendMessage(
                `╭─❌ ERROR ─╮\n` +
                `│ ভুল ফরম্যাট!\n` +
                `│ ফরম্যাট: DD-MM-YYYY\n` +
                `╰──────────╯`,
                threadID, messageID
            );
        }

        let d = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let y = parseInt(parts[2], 10);

        let birthDate = new Date(y, m - 1, d);
        let now = new Date();

        if (isNaN(birthDate.getTime()) || birthDate > now) {
            return api.sendMessage(
                `╭─❌ ERROR ─╮\n` +
                `│ সঠিক জন্মতারিখ দিন!\n` +
                `│ ভবিষ্যতের তারিখ না\n` +
                `╰──────────╯`,
                threadID, messageID
            );
        }

        // --- বয়স ক্যালকুলেশন (বছর, মাস, দিন) ---
        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();

        if (days < 0) {
            let lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate();
            months--;
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        // --- ডিটেইলড ক্যালকুলেশন (ঘণ্টা, মিনিট, সেকেন্ড) ---
        let diffMs = now - birthDate;
        let totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let totalHours = Math.floor(diffMs / (1000 * 60 * 60));
        let totalMinutes = Math.floor(diffMs / (1000 * 60));
        let totalSeconds = Math.floor(diffMs / 1000);

        // --- পরবর্তী জন্মদিন ---
        let nextBD = new Date(now.getFullYear(), m - 1, d);
        if (now > nextBD) nextBD.setFullYear(now.getFullYear() + 1);
        let diffNextBD = nextBD - now;
        let leftDays = Math.floor(diffNextBD / (1000 * 60 * 60 * 24));
        let leftHours = Math.floor((diffNextBD % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let leftMinutes = Math.floor((diffNextBD % (1000 * 60 * 60)) / (1000 * 60));

        const weekdays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
        const monthsBangla = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

        let userInfo = await api.getUserInfo(senderID);
        let userName = userInfo[senderID]?.name || "ইউজার";

        let msgBody = `╭─🎉 AGE INFO ─╮\n` +
            `│ 👤 ${userName}\n` +
            `│ 🎂 ${d} ${monthsBangla[m-1]} ${y}\n` +
            `├─────────────────\n` +
            `│ 📌 বর্তমান বয়স\n` +
            `│ ┗ ${years} বছর ${months} মাস ${days} দিন\n` +
            `├─────────────────\n` +
            `│ ⏳ পরবর্তী জন্মদিন\n` +
            `│ ┗ ${nextBD.getDate()} ${monthsBangla[nextBD.getMonth()]} (${weekdays[nextBD.getDay()]})\n` +
            `│ ┗ বাকি: ${leftDays}দিন ${leftHours}ঘণ্টা ${leftMinutes}মি\n` +
            `├─────────────────\n` +
            `│ 📊 মোট সময়\n` +
            `│ ┗ দিন: ${totalDays.toLocaleString()}\n` +
            `│ ┗ ঘণ্টা: ${totalHours.toLocaleString()}\n` +
            `│ ┗ মিনিট: ${totalMinutes.toLocaleString()}\n` +
            `│ ┗ সেকেন্ড: ${totalSeconds.toLocaleString()}\n` +
            `╰─────────────────╯\n` +
            `🛡️ Credit: ${credit}`;

        try {
            let imgUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            let path = __dirname + `/cache/age_full_${senderID}.png`;

            let response = await axios.get(imgUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

            return api.sendMessage({
                body: msgBody,
                attachment: fs.createReadStream(path)
            }, threadID, () => {
                if (fs.existsSync(path)) fs.unlinkSync(path);
            }, messageID);

        } catch (err) {
            return api.sendMessage(msgBody, threadID, messageID);
        }
    }
};
