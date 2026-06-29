module.exports = {
    config: {
        name: "acp",
        credit: "MOHAMMAD BADOL",
        role: 1,
        cooldown: 5
    },

    onStart: async (api, event, args) => {
        const form = {
            av: api.getCurrentUserID(),
            fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
            fb_api_caller_class: "RelayModern",
            doc_id: "4499164963466303",
            variables: JSON.stringify({ input: { scale: 3 } })
        };
        
        try {
            const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
            const listRequest = JSON.parse(res).data.viewer.friending_possibilities.edges;
            
            let msg = "Friend Requests List:\n";
            listRequest.forEach((user, i) => {
                msg += `\n${i + 1}. ${user.node.name} (ID: ${user.node.id})`;
            });
            
            msg += `\n\nReply with: <add | del> <number | all>`;
            
            api.sendMessage(msg, event.threadID, (err, info) => {
                global.msgCache.set(info.messageID, { 
                    type: "acp_reply", 
                    commandName: "acp", // মেইন ফাইলের জন্য গুরুত্বপূর্ণ
                    listRequest, 
                    author: event.senderID 
                });
            }, event.messageID);
        } catch (e) {
            api.sendMessage("Error: " + e.message, event.threadID);
        }
    },

    onReply: async (api, event, replyData) => {
        if (replyData.type !== "acp_reply") return;
        if (replyData.author !== event.senderID) return;

        const { listRequest } = replyData;
        const args = event.body.toLowerCase().split(" ");
        const action = args[0];
        const target = args[1];

        if (!["add", "del"].includes(action)) return api.sendMessage("Usage: add/del <all/number>", event.threadID);

        const form = {
            av: api.getCurrentUserID(),
            fb_api_caller_class: "RelayModern",
            variables: {
                input: { source: "friends_tab", actor_id: api.getCurrentUserID(), client_mutation_id: Math.round(Math.random() * 19).toString() },
                scale: 3, refresh_num: 0
            }
        };

        if (action == "add") {
            form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
            form.doc_id = "3147613905362928";
        } else {
            form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
            form.doc_id = "4108254489275063";
        }

        let targetIDs = target === "all" ? listRequest.map((_, i) => i + 1) : [parseInt(target)];
        
        for (const stt of targetIDs) {
            const u = listRequest[stt - 1];
            if (!u) continue;
            form.variables.input.friend_requester_id = u.node.id;
            form.variables = JSON.stringify(form.variables);
            await api.httpPost("https://www.facebook.com/api/graphql/", form);
            form.variables = JSON.parse(form.variables);
        }
        api.sendMessage(`✅ Action ${action} completed for ${target}.`, event.threadID);
    }
};
