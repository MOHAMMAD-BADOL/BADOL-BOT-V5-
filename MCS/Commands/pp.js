const axios = require("axios");

module.exports.config = {
  name: "pp",
  aliases: ["pfp", "profile"],
  version: "2.2.2",
  credit: "MOHAMMAD BADOL",
  role: 0,
  prefix: true,
  description: "Get profile picture of user",
  category: "utility",
  usages: "[@mention | reply | uid]",
  cooldown: 5
};

module.exports.onStart = async function (api, event, args) { // এখানে destructure করবা না
  // event undefined কিনা চেক করো
  if (!event ||!event.threadID) return;

  let targetID;

  if (event.mentions && Object.keys(event.mentions).length > 0) {
    targetID = Object.keys(event.mentions)[0];
  }
  else if (event.messageReply) {
    targetID = event.messageReply.senderID;
  }
  else if (args[0] &&!isNaN(args[0])) {
    targetID = args[0];
  }
  else {
    targetID = event.senderID;
  }

  try {
    const url = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const res = await axios({
      url,
      method: "GET",
      responseType: "stream"
    });

    const userInfo = await api.getUserInfo(targetID);
    const name = userInfo[targetID]?.name || "Unknown User";

    return api.sendMessage(
      {
        body: `📷 Profile Picture\n👤 Name: ${name}\n🆔 UID: ${targetID}`,
        attachment: res.data
      },
      event.threadID,
      event.messageID
    );

  } catch (e) {
    console.log(e);
    return api.sendMessage(
      "❌ Failed to get profile picture।",
      event.threadID,
      event.messageID
    );
  }
};
