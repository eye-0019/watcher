const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "guildMemberRemove",

    async execute(member) {

        let moderator = null;
        let reason = null;
        let action = "Member Left";
        let severity = "normal";


        // Check if it was a kick
        try {
            const logs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 5
            });


            const entry = logs.entries.find(
                e =>
                    e.target.id === member.id &&
                    Date.now() - e.createdTimestamp < 5000
            );


            if (entry) {
                moderator = entry.executor;
                reason = entry.reason;

                action = "Member Kicked";
                severity = "high";
            }

        } catch {}



        await createLog(member.guild, {

            type: "member",

            action,


            target: member.id,


            executor: moderator
                ? moderator.id
                : null,


            description:
                action === "Member Kicked"
                    ? `${member.user.tag} was kicked.\nReason: ${reason || "No reason provided"}`
                    : `${member.user.tag} left the server.`,


            severity,


            logChannel: channels.members.leave,


            metadata: {
                username: member.user.tag,
                userId: member.id,
                reason: reason || null
            },


            color:
                action === "Member Kicked"
                    ? 0xff0000
                    : 0xffcc00,


            fields: moderator
                ? [
                    {
                        name: "Moderator",
                        value: `${moderator.tag} (${moderator.id})`
                    }
                ]
                : []

        });

    }
};
