const box = (title, content) => `╭─[ ${title} ]\n${content}\n╰────────────❖`;

module.exports = {
  config: {
    name: 'nickname',
    aliases: ['nick', 'setname', 'nn'],
    credit: 'MOHAMMAD BADOL',
    prefix: true,
    role: 1,
    cooldown: 5,
    description: 'Change single or all group member nicknames instantly.'
  },

  onStart: async function (api, event, args) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    // 1. CHANGE ALL MEMBERS NICKNAME
    if (args[0]?.toLowerCase() === 'all') {
      const newNickname = args.slice(1).join(' ');
      if (!newNickname) {
        return api.sendMessage(box("❌ ERROR", "│ Please provide a nickname.\n│ e.g: /nickname all BOT USER"), threadID, messageID);
      }

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const participantIDs = threadInfo.participantIDs;

        api.sendMessage(box("⏳ PROCESSING", `│ Updating nicknames for ${participantIDs.length} members...`), threadID);

        let successCount = 0;
        for (const id of participantIDs) {
          try {
            await api.changeNickname(newNickname, threadID, id);
            successCount++;
          } catch (err) {
            // Skip restricted or deactivated accounts smoothly
          }
        }

        return api.sendMessage(box("✅ SUCCESS", `│ Successfully changed ${successCount} nicknames!`), threadID);
      } catch (e) {
        return api.sendMessage(`🔴 [ERROR]: ${e.message}`, threadID, messageID);
      }
    }

    // 2. CHANGE MENTIONED USER NICKNAME
    if (Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      const mentionText = mentions[targetID];
      const fullInput = args.join(' ');
      const newNickname = fullInput.replace(mentionText, '').trim();

      if (!newNickname) {
        return api.sendMessage(box("❌ ERROR", "│ Please provide a nickname after mention.\n│ e.g: /nickname @tag Boss"), threadID, messageID);
      }

      try {
        await api.changeNickname(newNickname, threadID, targetID);
        return api.sendMessage(box("✅ UPDATED", `│ User nickname updated successfully!`), threadID, messageID);
      } catch (e) {
        return api.sendMessage(`🔴 [ERROR]: ${e.message}`, threadID, messageID);
      }
    }

    // 3. CHANGE REPLY USER NICKNAME
    if (messageReply && messageReply.senderID) {
      const newNickname = args.join(' ');
      if (!newNickname) {
        return api.sendMessage(box("❌ ERROR", "│ Please provide a nickname.\n│ e.g: Reply & type: /nickname King"), threadID, messageID);
      }

      try {
        await api.changeNickname(newNickname, threadID, messageReply.senderID);
        return api.sendMessage(box("✅ UPDATED", `│ Replied user nickname updated!`), threadID, messageID);
      } catch (e) {
        return api.sendMessage(`🔴 [ERROR]: ${e.message}`, threadID, messageID);
      }
    }

    // 4. CHANGE SELF NICKNAME
    if (args.length > 0) {
      const newNickname = args.join(' ');
      try {
        await api.changeNickname(newNickname, threadID, senderID);
        return api.sendMessage(box("✅ UPDATED", `│ Your nickname has been updated!`), threadID, messageID);
      } catch (e) {
        return api.sendMessage(`🔴 [ERROR]: ${e.message}`, threadID, messageID);
      }
    }

    // 5. COMMAND USAGE GUIDE
    return api.sendMessage(box("📋 USAGE GUIDE", 
      "│ 1. Self Nickname: /nickname <name>\n" +
      "│ 2. Tag User: /nickname @tag <name>\n" +
      "│ 3. Reply User: /nickname <name>\n" +
      "│ 4. All Members: /nickname all <name>"
    ), threadID, messageID);
  }
};
