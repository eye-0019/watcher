const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");
const { EmbedBuilder } = require("discord.js");

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
        // Invite tracking
        // =====================================================

        try {

            const oldInvites = getCachedInvites(member.guild.id);

            const newInvites = await member.guild.invites.fetch();


            let usedInvite = null;


            newInvites.forEach(invite => {

                const oldUses = oldInvites.get(invite.code) || 0;

                if (invite.uses > oldUses) {
                    usedInvite = invite;
                }

            });


            if (usedInvite?.inviter) {

                const inviter = usedInvite.inviter;


                await addInviteCredit({
                    guildId: member.guild.id,
                    inviterId: inviter.id,
                    invitedUserId: member.id,
                    inviteCode: usedInvite.code
                });


                const count = await getInviteCount(
                    member.guild.id,
                    inviter.id
                );


                const gifRole = process.env.GIF_ROLE_ID;
                const picRole = process.env.PIC_ROLE_ID;


                const inviterMember =
                    await member.guild.members
                    .fetch(inviter.id)
                    .catch(() => null);


                if (inviterMember) {

                    if (count >= 1 && gifRole) {
                        await inviterMember.roles.add(gifRole)
                            .catch(() => {});
                    }


                    if (count >= 2 && picRole) {
                        await inviterMember.roles.add(picRole)
                            .catch(() => {});
                    }

                }

            }


            await cacheGuildInvites(member.guild);


        } catch (err) {
            console.error("[invite system]", err);
        }



        // =====================================================
        // Welcome message
        // =====================================================

        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;


        if (welcomeChannelId) {

            try {

                const welcomeChannel =
                    await member.guild.channels.fetch(welcomeChannelId)
                    .catch(() => null);


                if (welcomeChannel?.isTextBased()) {


                    const random =
                        welcomeMessages[
                            Math.floor(Math.random() * welcomeMessages.length)
                        ];


                    const message =
                        random.replace(/{id}/g, member.id);



                    const embed = new EmbedBuilder()

                        .setColor(0x000000)

                        .setAuthor({
                            name: member.user.username,
                            iconURL:
                                member.user.displayAvatarURL({
                                    dynamic:true
                                })
                        })

                        .setDescription(message)

                        .setThumbnail(
                            member.user.displayAvatarURL({
                                dynamic:true,
                                size:256
                            })
                        )

                        .addFields(
                            {
                                name:"get started",
                                value:
                                `📜 read <#1541587463028605060>\n🎭 get your <#1543126010394972232>`
                            },
                            {
                                name:"member count",
                                value:`\`${member.guild.memberCount}\``,
                                inline:true
                            },
                            {
                                name:"account age",
                                value:
                                `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`,
                                inline:true
                            }
                        )

                        .setFooter({
                            text:"sɪʟᴇɴᴛ ᴇʏᴇ"
                        })

                        .setTimestamp();



                    await welcomeChannel.send({
                        embeds:[embed]
                    });


                }


            } catch(err) {
                console.error("[welcome]", err);
            }

        }



        // =====================================================
        // Logs
        // =====================================================

        await createLog(member.guild, {

            type:"member",

            action:"Member Joined",

            target:member.id,

            description:
            `${member.user.tag} joined the server.`,

            severity:"normal",

            logChannel:channels.members.join,

            thumbnailUrl:
            member.user.displayAvatarURL({
                dynamic:true
            }),

            metadata:{
                username:member.user.tag,
                userId:member.id,
                accountCreated:member.user.createdAt
            },

            color:0x00ff99,

            fields:[
                {
                    name:"Account Created",
                    value:
                    `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`
                },
                {
                    name:"Member Count",
                    value:`${member.guild.memberCount}`,
                    inline:true
                }
            ]

        });

    }
};