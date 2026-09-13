const { EmbedBuilder } = require("discord.js");

const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

const {
    getCachedInvites,
    cacheGuildInvites
} = require("../utils/inviteCache");

const {
    addInviteCredit,
    getInviteCount
} = require("../utils/inviteStore");


const welcomeMessages = [
    `welcome <@{id}> 👀`,
    `<@{id}> just joined, hey!`,
    `we got a new one, welcome <@{id}> 🗣️`,
    `<@{id}> pulled up, welcome in`,
    `hey <@{id}>, glad you're here ❤️`,
    `<@{id}> just joined the server`,
    `welcome to sɪʟᴇɴᴛ ᴇʏᴇ <@{id}> 😼`,
];


module.exports = {
    name: "guildMemberAdd",

    async execute(member) {


        // =====================================================
        // Invite reward system
        // =====================================================

        try {

            const oldInvites =
                getCachedInvites(member.guild.id);

            const newInvites =
                await member.guild.invites.fetch();


            let usedInvite = null;


            newInvites.forEach(invite => {

                const oldUses =
                    oldInvites.get(invite.code) || 0;


                if (invite.uses > oldUses) {
                    usedInvite = invite;
                }

            });



            if (usedInvite?.inviter) {

                const inviter =
                    usedInvite.inviter;


                await addInviteCredit({

                    guildId: member.guild.id,

                    inviterId: inviter.id,

                    invitedUserId: member.id,

                    inviteCode: usedInvite.code

                });



                const count =
                    await getInviteCount(
                        member.guild.id,
                        inviter.id
                    );


                console.log(
                    `[INVITE REWARD] ${inviter.tag} now has ${count} invites`
                );



                const gifRole =
                    process.env.GIF_ROLE_ID;

                const picRole =
                    process.env.PIC_ROLE_ID;



                const inviterMember =
                    await member.guild.members
                    .fetch(inviter.id)
                    .catch(() => null);



                if (inviterMember) {


                    if (count >= 1 && gifRole) {

                        await inviterMember.roles.add(gifRole)
                        .then(() =>
                            console.log(
                                `[ROLE] Added GIF role to ${inviter.tag}`
                            )
                        )
                        .catch(console.error);

                    }



                    if (count >= 2 && picRole) {

                        await inviterMember.roles.add(picRole)
                        .then(() =>
                            console.log(
                                `[ROLE] Added PIC role to ${inviter.tag}`
                            )
                        )
                        .catch(console.error);

                    }

                }

            }


            await cacheGuildInvites(member.guild);


        } catch (err) {

            console.error(
                "[invite system error]",
                err
            );

        }



        // =====================================================
        // Welcome embed
        // =====================================================


        const welcomeChannelId =
            process.env.WELCOME_CHANNEL_ID;



        if (welcomeChannelId) {

            try {


                const welcomeChannel =
                    await member.guild.channels
                    .fetch(welcomeChannelId)
                    .catch(() => null);



                if (welcomeChannel?.isTextBased()) {


                    const random =
                        welcomeMessages[
                            Math.floor(
                                Math.random() *
                                welcomeMessages.length
                            )
                        ];



                    const message =
                        random.replace(
                            /{id}/g,
                            member.id
                        );



                    const embed =
                        new EmbedBuilder()

                        .setColor(0x808080)

                        .setTitle("👋 New Member")

                        .setDescription(message)

                        .addFields(

                            {
                                name: "User",
                                value:
                                `${member.user.tag}\n<@${member.id}>`
                            },

                            {
                                name: "Account Created",
                                value:
                                `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                            },

                            {
                                name: "Member Count",
                                value:
                                `${member.guild.memberCount}`
                            }

                        )

                        .setThumbnail(
                            member.user.displayAvatarURL()
                        )

                        .setTimestamp();



                    await welcomeChannel.send({

                        embeds: [embed]

                    });


                }


            } catch(err) {

                console.error(
                    "[welcome error]",
                    err
                );

            }

        }




        // =====================================================
        // Logger
        // =====================================================


        await createLog(

            member.guild,

            {

                type: "member",

                action: "Member Joined",

                target: member.id,

                description:
                `${member.user.tag} joined the server.`,

                severity: "normal",

                logChannel:
                channels.members.join,

                color: 0x808080,


                fields: [

                    {
                        name: "User",

                        value:
                        `${member.user.tag} (${member.id})`
                    },

                    {
                        name: "Account Created",

                        value:
                        `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                    }

                ]

            }

        ).catch(() => {});


    }
};