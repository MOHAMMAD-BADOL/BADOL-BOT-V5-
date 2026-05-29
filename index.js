const login = require("stfca");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const logger = require("./BADOL-Main/logger");

if (!fs.existsSync("BADOL-Appstate.json")) {
    logger.error("BADOL-Appstate.json ফাইলটি খুঁজে পাওয়া যায়নি!");
    process.exit(1);
}

const appState = JSON.parse(fs.readFileSync("BADOL-Appstate.json", "utf8"));

login({ appState }, (err, api) => {
    if (err) {
        console.error("Login Failed:", err);
        return;
    }
    
    console.log("BADOL-BOT: Logged in successfully!");

    const handlerPath = path.join(__dirname, "BADOL-Main", "badol.js");
    
    require(handlerPath)(api);

    logger.autoBanner(); 
});
