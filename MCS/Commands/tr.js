const axios = require("axios");

// ভাষা কোডসমূহ
const LANGUAGES = {
    af: "Afrikaans", ar: "Arabic", bn: "Bangla", en: "English",
    fr: "French", de: "German", el: "Greek", gu: "Gujarati",
    hi: "Hindi", id: "Indonesian", it: "Italian", ja: "Japanese",
    ko: "Korean", ml: "Malayalam", mr: "Marathi", ne: "Nepali",
    pa: "Punjabi", pl: "Polish", pt: "Portuguese", ru: "Russian",
    es: "Spanish", sv: "Swedish", ta: "Tamil", te: "Telugu",
    th: "Thai", tr: "Turkish", ur: "Urdu", vi: "Vietnamese", zh: "Chinese"
};

module.exports.config = {
    name: "tr",
    aliases: ["translate", "অনুবাদ", "trlist"],
    version: "1.0.2",
    credit: "MOHAMMAD BADOL",
    role: 0,
    prefix: false, // reply দিয়ে ইউজ হয় তাই false
    description: "Google API ব্যবহার করে টেক্সট অনুবাদ করুন",
    category: "utility",
    usages: "[langCode] [text] বা মেসেজে রিপ্লাই",
    cooldown: 5
};

module.exports.onStart = async function (api, event, args) {
    if (!event ||!event.threadID) return;

    const { threadID, messageID, type, messageReply, body } = event;

    // ১. ল্যাঙ্গুয়েজ লিস্ট চেক করা
    if (body.toLowerCase().includes("trlist") || (args[0] && args[0].toLowerCase() === "list")) {
        let listMsg = "🌍 Available Language Codes\n\n";
        for (const [code, name] of Object.entries(LANGUAGES)) {
            listMsg += `• ${code} = ${name}\n`;
        }
        listMsg += "\n📘 ব্যবহারের উদাহরণ:\n/tr ar I love you\n/tr hi Hello\n\n💡 Reply দিয়ে: tr en";
        return api.sendMessage(listMsg, threadID, messageID);
    }

    let replyText = null;
    if (type === "message_reply" && messageReply?.body) {
        replyText = messageReply.body;
    }

    // ২. ইনপুট চেক করা
    if (args.length === 0 &&!replyText) {
        return api.sendMessage(
            "⚠️ অনুবাদ করার জন্য কিছু লিখুন বা মেসেজ রিপ্লাই করুন!\n\n🌍 সব ভাষা দেখতে: /tr list লিখুন\n\n📘 উদাহরণ:\n/tr en আমি তোমাকে ভালোবাসি\n/tr bn Hello",
            threadID,
            messageID
        );
    }

    let targetLang = "bn"; // ডিফল্ট বাংলা
    let textToTranslate = replyText || args.join(" ");

    // ৩. ল্যাঙ্গুয়েজ কোড ডিটেক্ট করা
    if (args[0] && args[0].length === 2 && /^[a-zA-Z]+$/.test(args[0])) {
        const inputCode = args[0].toLowerCase();
        if (LANGUAGES[inputCode]) {
            targetLang = inputCode;
            if (replyText) {
                textToTranslate = replyText;
            } else {
                textToTranslate = args.slice(1).join(" ");
            }
        }
    }

    if (!textToTranslate || textToTranslate.trim() === "") {
        return api.sendMessage("⚠️ অনুবাদ করার জন্য টেক্সট খুঁজে পাওয়া যায়নি!", threadID, messageID);
    }

    try {
        // প্রথমে সোর্স ল্যাঙ্গুয়েজ ডিটেক্ট করা
        const detectURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(textToTranslate)}`;
        const detectRes = await axios.get(detectURL);
        const detectedLang = detectRes.data[2] || "auto";

        // যদি ইউজার কোড না দেয়, অটো-সুইচ: বাংলা থাকলে ইংলিশ, না হলে বাংলা
        if (!args[0] ||!LANGUAGES[args[0].toLowerCase()]) {
            if (detectedLang === "bn") targetLang = "en";
            else targetLang = "bn";
        }

        // মূল অনুবাদ প্রসেস
        const trURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
        const { data } = await axios.get(trURL);

        let translated = "";
        if (data && data[0]) {
            data[0].forEach(item => { if (item[0]) translated += item[0]; });
        }

        if (!translated) {
            return api.sendMessage("❌ অনুবাদ পাওয়া যায়নি। অন্য টেক্সট ট্রাই করুন।", threadID, messageID);
        }

        const fromLangName = LANGUAGES[detectedLang] || detectedLang.toUpperCase();
        const toLangName = LANGUAGES[targetLang] || targetLang.toUpperCase();

        const resultMessage = `🌐 Google Translate\n\n🗣️ From: ${fromLangName}\n🎯 To: ${toLangName}\n\n📝 Original:\n${textToTranslate.substring(0, 800)}\n\n💬 Result:\n${translated}`;

        return api.sendMessage(resultMessage, threadID, messageID);

    } catch (error) {
        console.error("Translation Error:", error.message);
        return api.sendMessage("❌ অনুবাদ করতে সমস্যা হয়েছে। নেটওয়ার্ক চেক করুন বা একটু পরে ট্রাই করুন।", threadID, messageID);
    }
};
