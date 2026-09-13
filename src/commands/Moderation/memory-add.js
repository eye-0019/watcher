const { SlashCommandBuilder } = require('discord.js');
const { updateMemory } = require('../../utils/aiMemoryStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory-add')
        .setDescription('Add a categorized memory for a user')

        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to save memory for')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('Memory category')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Profile',
                        value: 'profile'
                    },
                    {
                        name: 'Personality',
                        value: 'personality'
                    },
                    {
                        name: 'Projects',
                        value: 'projects'
                    },
                    {
                        name: 'Importance',
                        value: 'importance'
                    }
                )
        )

        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Memory to save')
                .setRequired(true)
        ),

    async execute(interaction) {

        // Owner only
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: '❌ You cannot use this command.',
                flags: 64
            });
        }


        const user = interaction.options.getUser('user');
        const category = interaction.options.getString('category');
        const text = interaction.options.getString('text');


        let memoryData = {
            profile: {},
            personality: {},
            projects: {},
            importance: 0
        };


        switch (category) {

            case 'profile':
                memoryData.profile = {
                    note: text
                };
                break;


            case 'personality':
                memoryData.personality = {
                    note: text
                };
                break;


            case 'projects':
                memoryData.projects = {
                    note: text
                };
                break;


            case 'importance':
                memoryData.importance = 5;
                memoryData.profile = {
                    important_note: text
                };
                break;
        }


        await updateMemory(
            user.id,
            memoryData
        );


        await interaction.reply({
            content:
                `🧠 Saved **${category}** memory for **${user.username}**:\n> ${text}`,
            flags: 64
        });
    }
};