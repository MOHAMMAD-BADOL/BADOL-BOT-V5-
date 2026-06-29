const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports.config = {
    name: "golbalbadolprefix",
    version: "1.0.6",
    role: 0,
    credit: "MOHAMMAD BADOL",
    description: "Send Islamic post",
    commandCategory: "religious",
    usages: "/",
    cooldown: 5,
    prefix: true,
    aliases: ["golbalbadolprefix"]
};

module.exports.onStart = async function (api, event, args) {
    const { threadID, messageID, senderID } = event;

    const captions = [
        "– কোনো নেতার পিছনে নয়.!!🤸‍♂️\n– মসজিদের ইমামের পিছনে দাড়াও জীবন বদলে যাবে ইনশাআল্লাহ.!!🖤🌻",
        "„আল্লাহর রহমত থেকে নিরাশ হওয়া যাবে না!” আল্লাহ অবশ্যই তোমাকে ক্ষমা করে দিবেন☺️🌻\nসুরা যুমাহ্ আয়াত ৫২..৫৩💙🌸",
        "- ইসলাম অহংকার করতে শেখায় না!🌸\n- ইসলাম শুকরিয়া আদায় করতে শেখায়!🤲🕋🥀",
        "বেপর্দা নারী যদি নায়িকা হতে পারে\n_____🤗🥀 -তবে পর্দাশীল নারী গুলো সব ইসলামের শাহাজাদী __🌺🥰",
        "স্মার্ট নয় ইসলামিক জীবন সঙ্গি খুঁজুন 🖤🥰",
        "যখন বান্দার জ্বর হয়,😇\nতখন গুনাহ গুলো ঝড়ে পড়তে থাকে☺️\n– হযরত মুহাম্মদ(সাঃ)●───༊",
        "Happiness Is Enjoying The Little Things In Life..♡🌸\nAlhamdulillah For Everything...💗🥰",
        "তুমি আসক্ত হও—তবে নেশায় নয় আল্লাহর ইবাদতে-||-🖤🌸✨",
        "হাসতে হাসতে একদিন সবাইকে কাদিয়ে বিদায় নিবো..!!🙂💔🥀",
        "হাজারো স্বপ্নের শেষ স্থান—কবরস্থান♡❤",
        "প্রসঙ্গ যখন ধর্ম নিয়ে•🥰😊\nতখন আমাদের ইসলামই সেরা•❤️\n𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥𝐢𝐥𝐥𝐚🌸❤️",
        "কেউ পছন্দ না করলে কি যায় আসে,,🙂\nআল্লাহ তো পছন্দ করেই বানিয়েছে,,♥️🥀\nAlhamdulillah 🕋",
        "এত অহংকার করে লাভ নেই! 🌺\nমৃত্যুটা নিশ্চিত,, শুধু সময়টা অনিশ্চিত।🖤🙂",
        "ছিঁড়ে ফেলুন অতীতের সকল পাপের অধ্যায়।\nফিরে আসুন রবের ভালোবাসায়••🖤🥀",
        "বুকে হাজারো কষ্ট নিয়ে আলহামডেলিল্লাহ বলাটা••!☺️\nআল্লাহর প্রতি অগাধ বিশ্বাসের নমুনা❤️🥀",
        "আল্লাহর ভালোবাসা পেতে চাও•••!🤗\nতবে রাসুল (সা:)কে অনুসরণ করো••!🥰"
    ];

    const links = [
        "https://i.postimg.cc/7LdGnyjQ/images-31.jpg",
        "https://i.postimg.cc/65c81ZDZ/images-30.jpg",
        "https://i.postimg.cc/Y0wvTzr6/images-29.jpg",
        "https://i.postimg.cc/1Rpnw2BJ/images-28.jpg",
        "https://i.postimg.cc/mgrPxDs5/images-27.jpg",
        "https://i.postimg.cc/yxXDK3xw/images-26.jpg",
        "https://i.postimg.cc/kXqVcsh9/muslim-boy-having-worship-praying-fasting-eid-islamic-culture-mosque-73899-1334.webp",
        "https://i.postimg.cc/hGzhj5h8/muslims-reading-from-quran-53876-20958.webp",
        "https://i.postimg.cc/x1Fc92jT/blue-mosque-istanbul-1157-8841.webp",
        "https://i.postimg.cc/j5y56nHL/muhammad-ali-pasha-cairo-219717-5352.webp",
        "https://i.postimg.cc/dVWyHfhr/images-1-21.jpg",
        "https://i.postimg.cc/q7MGgn3X/images-1-22.jpg",
        "https://i.postimg.cc/sX5CXtSh/images-1-16.jpg",
        "https://i.postimg.cc/66Rp2Pwz/images-1-17.jpg",
        "https://i.postimg.cc/Qtzh9pY2/images-1-18.jpg",
        "https://i.postimg.cc/MGrhdz0R/images-1-19.jpg",
        "https://i.postimg.cc/LsMSj9Ts/images-1-20.jpg",
        "https://i.postimg.cc/KzNXyttX/images-1-13.jpg"
    ];

    const randomCaption = captions[Math.floor(Math.random() * captions.length)];
    const randomImageLink = links[Math.floor(Math.random() * links.length)];

    let name = "User";
    try {
        const userInfo = await api.getUserInfo(senderID);
        name = userInfo[senderID]?.name || "User";
    } catch (e) {}

    let stylishMsg = `╔══════════════════╗\n`;
    stylishMsg += ` ✨ISLAMIC REMINDER✨\n`;
    stylishMsg += `╚══════════════════╝\n\n`;
    stylishMsg += `» ${randomCaption} «\n\n`;
    stylishMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
    stylishMsg += `👤 **Receiver:** ${name}\n`;
    stylishMsg += `🛡️ **DEV:** MOHAMMAD BADOL\n`;
    stylishMsg += `━━━━━━━━━━━━━━━━━━━━`;

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const pathImg = path.join(cacheDir, `islamic_${senderID}_${Date.now()}.jpg`);

    const callback = () => {
        api.sendMessage({
            body: stylishMsg,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => {
            if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
        }, messageID);
    };

    request(encodeURI(randomImageLink))
        .pipe(fs.createWriteStream(pathImg))
        .on("close", callback)
        .on("error", (err) => {
            api.sendMessage("❌ কন্টেন্ট লোড করতে সমস্যা হয়েছে!", threadID, messageID);
        });
};