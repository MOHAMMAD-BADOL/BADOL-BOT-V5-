const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
 config: {
 name: "help",
 aliases: ["menu"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 0,
 cooldown: 5,
 description: "Custom template style help menu"
 },

 onStart: async (api, event, args) => {
 const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf-8"));
 const prefix = config.BOT_INFO.PREFIX;
 const botName = config.BOT_INFO.BOT_NAME || "BADOL-BOT-V5";
 const commands = global.commands;
 const ownerName = "MOHAMMAD BADOL";
 const imgURL = "https://drive.google.com/uc?export=download&id=1detiUoL9Xqlaf9pdAclNWG32t2W78oDX";

 const getStream = async (url) => {
 const res = await axios.get(url, { responseType: "stream" });
 return res.data;
 };

 if (!args[0]) {
 let totalCommands = 0;
 let msg = `╭───❍ 𝐇𝐞𝐥𝐩-𝐌𝐞𝐧𝐮 ❍───╮\n┏━━━━━━━━━━━━━━━━━━━❥\n`;

 for (const [name, cmd] of commands) {
 totalCommands++;
 msg += `├‣ ${totalCommands} ✿ ${prefix}${name}\n`;
 }

 msg += `┗━━━━━━━━━━━━━━━━━━━❥\n\n`;
 msg += `𝄞⋆⃝🧚‍${botName}🧚‍⋆⃝𝄞\n`;
 msg += `┊│╭──────────────────◈\n`;
 msg += `┊││▸ ✿ Bot Prefix: ${prefix}\n`;
 msg += `┊││▸ ✿ Bot Name: ${botName}\n`;
 msg += `┊││▸ ✿ Total Commands: ${totalCommands}\n`;
 msg += `┊││▸ ✿ Dev: ${ownerName}\n`;
 msg += `┊│╰──────────────────◈\n`;
 msg += `╰────────────────────⟡\n\n`;
 msg += `✨ Use: ${prefix}help [command name] ✨`;

 return api.sendMessage({
 body: msg.trim(),
 attachment: await getStream(imgURL)
 }, event.threadID, event.messageID);
 }

 const cmdName = args[0].toLowerCase();
 const command = Array.from(commands.values()).find(c => c.config.name === cmdName || c.config.aliases?.includes(cmdName));

 if (!command)
 return api.sendMessage(`❌ Command not found. Use ${prefix}help to see all commands.`, event.threadID, event.messageID);

 const configCmd = command.config;
 const msg = `╭──────────────╮
│ 『 COMMAND DETAILS 』
├──────────────┤
│ ✦ Name: ${configCmd.name}
│ ✦ Author: ${configCmd.credit || "Unknown"}
│ ✦ Role: ${configCmd.role == 0? "User" : "Admin"}
│ ✦ Description: ${configCmd.description || "No description"}
╰──────────────╯`;

 return api.sendMessage({
 body: msg,
 attachment: await getStream(imgURL)
 }, event.threadID, event.messageID);
 }
};
