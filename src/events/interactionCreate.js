const { Events } = require('discord.js');

const ROLE_MAP = {
    // gender
    role_male:        '1546722118656593940',
    role_female:      '1546727111090372678',
    // age
    role_15:          '1546727292720652388',
    role_1617:        '1546727193395339274',
    role_1819:        '1546727370894090260',
    // color
    role_owoo:        '1546725505347092480',
    role_ww:          '1546725957212311682',
    role_tww:         '1546725958055231621',
    role_owob:        '1546726023905681529',
    role_gwg:         '1546726026594353272',
    role_uwu:         '1546726028804628562',
    role_cwc:         '1546726284854562957',
    role_owo:         '1546726287127740547',
    role_uwub:        '1546726288646217769',
    role_dwm:         '1546726289715626036',
    // ping
    role_announce:    '1546729149115146270',
    role_partnership: '1546729209274302474',
    role_deadchat:    '1546729244305137744',
    role_vc:          '1546729294192058369',
    role_hallofshame: '1546729374877745173',
    role_halloffame:  '1546729413985435728',
};

// roles where only one can be held at a time
const EXCLUSIVE_GROUPS = [
    // gender
    ['role_male', 'role_female'],
    // age
    ['role_15', 'role_1617', 'role_1819'],
    // color
    ['role_owoo', 'role_ww', 'role_tww', 'role_owob', 'role_gwg', 'role_uwu', 'role_cwc', 'role_owo', 'role_uwub', 'role_dwm'],
];

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        // ── Slash commands ────────────────────────────────────────────────
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.warn(`[interactionCreate] Unknown command: ${interaction.commandName}`);
                return safeReply(interaction, { content: 'Unknown command.', flags: 64 });
            }
            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(`[interactionCreate] Error in /${interaction.commandName}:`, err);
                await safeReply(interaction, { content: 'There was an error while executing this command.', flags: 64 });
            }
            return;
        }

        // ── Autocomplete ──────────────────────────────────────────────────
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command?.autocomplete) return;
            try {
                await command.autocomplete(interaction);
            } catch (err) {
                console.error(`[interactionCreate] Autocomplete error in /${interaction.commandName}:`, err);
            }
            return;
        }

        // ── Buttons ───────────────────────────────────────────────────────
        if (interaction.isButton()) {
            const roleId = ROLE_MAP[interaction.customId];
            if (!roleId) return;

            await interaction.deferReply({ ephemeral: true });

            const member = interaction.member;

            try {
                // check if they already have the role — if so remove it (toggle)
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.editReply({ content: `removed!` });
                }

                // remove other roles in the same exclusive group first
                const group = EXCLUSIVE_GROUPS.find(g => g.includes(interaction.customId));
                if (group) {
                    for (const key of group) {
                        const otherId = ROLE_MAP[key];
                        if (otherId && member.roles.cache.has(otherId)) {
                            await member.roles.remove(otherId);
                        }
                    }
                }

                await member.roles.add(roleId);
                return interaction.editReply({ content: `done!` });

            } catch (err) {
                console.error('[interactionCreate] role button error:', err);
                return interaction.editReply({ content: 'something went wrong 😭' });
            }
        }

        // ── Select Menu / Modal ───────────────────────────────────────────
        if (interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            return;
        }
    },
};

async function safeReply(interaction, options) {
    try {
        if (interaction.deferred) {
            await interaction.editReply(options);
        } else if (interaction.replied) {
            await interaction.followUp({ ...options, flags: 64 });
        } else {
            await interaction.reply({ ...options, flags: 64 });
        }
    } catch (err) {
        console.error('[safeReply] Could not send error message to user:', err.message);
    }
}
