const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

const {
    getInviter,
    removeInviteCredit,
    getInviteCount
} = require("../utils/inviteStore");


module.exports = {
    name: "guildMemberRemove",

    async execute(member) {

        console.log(
            `[LEAVE] ${member.user.tag} left ${member.guild.name}`
        );


        let moderator = null;
        let reason = null;

        let action = "Member Left";
        let severity = "normal";



        // Check kick
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



        // Remove invite reward
        try {

            const inviterId = await getInviter(
                member.guild.id,
                member.id
            );


            if (inviterId) {

                await removeInviteCredit(
                    member.guild.id,
                    member.id
                );


                const count = await getInviteCount(
                    member.guild.id,
                    inviterId
                );


                console.log(
                    `[INVITE REMOVE] inviter ${inviterId} now has ${count} invites`
                );


                const inviterMember =
                    await member.guild.members
                    .fetch(inviterId)
                    .catch(() => null);



                if (inviterMember) {


                    const gifRole =
                        process.env.GIF_ROLE_ID;


                    const picRole =
                        process.env.PIC_ROLE_ID;



                    if (picRole && count < 2) {

                        if (
                            inviterMember.roles.cache.has(picRole)
                        ) {

                            await inviterMember.roles.remove(picRole);

                            console.log(
                                `[INVITE REMOVE] Removed PIC role`
                            );

                        }

                    }



                    if (gifRole && count < 1) {

                        if (
                            inviterMember.roles.cache.has(gifRole)
                        ) {

                            await inviterMember.roles.remove(gifRole);

                            console.log(
                                `[INVITE REMOVE] Removed GIF role`
                            );

                        }

                    }

                }

            }


        } catch (err) {

            console.error(
                "[INVITE REMOVE ERROR]",
                err
            );

        }




        await createLog(member.guild, {

            type: "member",

            action,

            target: member.id,


            executor:
                moderator
                ? moderator.id
                : null,


            description:
                action === "Member Kicked"
                ? `${member.user.tag} was kicked.\nReason: ${reason || "No reason"}`
                : `${member.user.tag} left the server.`,


            severity,


            logChannel:
                channels.members.leave,


            metadata: {

                username:
                    member.user.tag,

                userId:
                    member.id,

                reason:
                    reason || null

            },


            color:
                action === "Member Kicked"
                ? 0xff0000
                : 0xffcc00,


            fields:
                moderator
                ? [
                    {
                        name: "Moderator",
                        value:
                            `${moderator.tag} (${moderator.id})`
                    }
                ]
                : []

        });

    }
};