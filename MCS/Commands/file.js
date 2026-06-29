const fs = require("fs");
const path = require("path");

function box(title, content) {
    return `┌─[ ${title} ]─┐\n│\n${content.split('\n').map(line => `│ ${line}`).join('\n')}\n│\n└───────────⭔`;
}

module.exports = {
    config: {
        name: "file",
        aliases: ["files"],
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1, 
        cooldown: 0,
        description: "Browse or download files as text"
    },

    onStart: async (api, event, args) => {
        const rootPath = path.resolve(__dirname, "../../"); 
        
        const sendFileAsTxt = (filePath) => {
            if (!fs.existsSync(filePath)) {
                return api.sendMessage(box("ERROR", `File not found:\n${path.basename(filePath)}`), event.threadID);
            }
            
            if (fs.lstatSync(filePath).isDirectory()) {
                return api.sendMessage(box("ERROR", "Cannot download a folder!"), event.threadID);
            }

            const tempPath = filePath + ".txt";
            fs.copyFileSync(filePath, tempPath); 

            return api.sendMessage({
                body: `[ FILE READY ]\nName: ${path.basename(filePath)}\nFormat: .txt`,
                attachment: fs.createReadStream(tempPath)
            }, event.threadID, () => {
                fs.unlinkSync(tempPath);
            });
        };

        if (args[0] === "get") {
            const fileName = args.slice(1).join(" ").trim();
            const filePath = path.resolve(rootPath, fileName);
            return sendFileAsTxt(filePath);
        }

        if (args[0] && args[0].endsWith(".js")) {
            const fileName = args[0].trim();
            const commandsPath = path.resolve(rootPath, "MCS/Commands"); 
            const filePath = path.resolve(commandsPath, fileName);
            return sendFileAsTxt(filePath);
        }

        const targetPath = args.length > 0 ? path.resolve(rootPath, args.join(" ").trim()) : rootPath;

        if (!fs.existsSync(targetPath)) {
            return api.sendMessage(box("ERROR", `Path not found:\n${targetPath}`), event.threadID);
        }

        const files = fs.readdirSync(targetPath);
        let list = "";
        files.forEach((f, i) => {
            const isDir = fs.lstatSync(path.join(targetPath, f)).isDirectory();
            list += `${i + 1}. ${isDir ? "📁" : "📄"} ${f}\n`;
        });
        
        const currentFolder = targetPath.replace(rootPath, "") || "/";
        const content = `Target: ${currentFolder}\n\n${list}\n[ USAGE ]\n/file [folder]\n/file get [file]\n/file [filename.js]`;
        
        api.sendMessage(box("FILE EXPLORER", content), event.threadID);
    }
};


