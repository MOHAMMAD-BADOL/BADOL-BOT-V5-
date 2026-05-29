const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, 'database.json');

if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, { threads: {}, users: {} });
}

module.exports = {
    getData: async (id, type = 'threads') => {
        const db = await fs.readJson(dataPath);
        return db[type][id] || { status: false, name: "BADOL GROUP" };
    },
    saveData: async (id, newData, type = 'threads') => {
        const db = await fs.readJson(dataPath);
        if (!db[type]) db[type] = {};
        db[type][id] = newData;
        await fs.writeJson(dataPath, db, { spaces: 4 });
    }
};
