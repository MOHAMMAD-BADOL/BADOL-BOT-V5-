const axios = require("axios");

module.exports.config = {
    name: "noticeListener",
    version: "1.0.0",
    credit: "MOHAMMAD BADOL",
    description: "MOHAMMAD BADOL এর অফিশিয়াল নোটিশ রিসিভার। ডিলিট করবেন না।"
};

// মেইন ফাইলের ইভেন্ট ভ্যালিডেশন পাস করানোর জন্য ডামি মেথড
module.exports.onChat = async function() {
    // এটি খালি থাকবে, শুধু মেইন ফাইলের ভ্যালিডেশন বাইপাস করার জন্য
};

// মেইন ফাইলের ইভেন্ট লোডার অনুযায়ী onLoad মেথড
module.exports.onLoad = async function({ api }) {
    console.log(" \x1b[32m[ NOTICE LISTENER ]\x1b[0m Master notice system ব্যাকগ্রাউন্ডে সফলভাবে চালু হয়েছে...");
    
    // গ্লোবাল নোটিশ টাইমস্ট্যাম্প ইনিশিয়ালাইজেশন
    global.lastNoticeTime = global.lastNoticeTime || 0;
    
    // প্রতি ৫ মিনিট (৩০০০০০ মিলি-সেকেন্ড) পর পর নোটিশ চেক করার লুপ
    setInterval(async () => {
        try {
            // ক্যাশ এড়াতে কারেন্ট টাইমস্ট্যাম্প সহ র ইউআরএল কল
            const res = await axios.get(`https://raw.githubusercontent.com/mohammadbadol/mohammadbadol/refs/heads/main/notice.json?t=${Date.now()}`, { 
                timeout: 10000 
            });
            
            // নোটিশ অ্যাক্টিভ আছে কিনা এবং সেটি নতুন কিনা তা যাচাই
            if (res.data && res.data.active && res.data.time > global.lastNoticeTime) {
                global.lastNoticeTime = res.data.time;
                
                const compiledMessage = `📢 **MOHAMMAD BADOL - অফিশিয়াল অ্যানাউন্সমেন্ট** 📢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${res.data.text}\n\n━━━━━━━━━━━━━━━━━━━━\n🤖 **BADOL-BOT-V5**\n👑 **MAIN DEVELOPER:** MOHAMMAD BADOL\n━━━━━━━━━━━━━━━━━━━━`;

                console.log(`\x1b[33m[ NOTICE LISTENER ]\x1b[0m নতুন নোটিশ রিসিভড: ${res.data.text}`);
                
                // মেইন ফাইলের গ্লোবাল ডাটা স্ট্রাকচার থেকে সব সচল গ্রুপ আইডি সংগ্রহ
                const allThreads = global.data?.allThreadID || [];
                let successCount = 0;
                
                for (const threadID of allThreads) {
                    try {
                        await api.sendMessage(compiledMessage, threadID);
                        successCount++;
                        // রেট লিমিট এড়াতে ১.২ সেকেন্ড ডিলে
                        await new Promise(resolve => setTimeout(resolve, 1200)); 
                    } catch (e) {
                        console.log(`\x1b[31m[ NOTICE LISTENER ]\x1b[0m থ্রেড আইডি: ${threadID} এ নোটিশ পাঠানো যায়নি বা বট রিমুভড।`);
                    }
                }
                
                console.log(`\x1b[32m[ NOTICE LISTENER ]\x1b[0m মোট ${successCount}/${allThreads.length} টি গ্রুপে নোটিশ সফলভাবে ব্রডকাস্ট করা হয়েছে।`);
            }
        } catch (e) {
            // এরর হলে সাইলেন্ট থাকবে
        }
    }, 300000);
};
