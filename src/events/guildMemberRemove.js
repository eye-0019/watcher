const { pool } = require('../utils/db');

const LEAVE_CHANNEL_ID = '1543128041616703548';

module.exports = {
    name: 'guildMemberRemove',

    async execute(member) {
        try {
            const channel =
                member.guild.channels.cache.get(LEAVE_CHANNEL_ID);

            if (!channel || !channel.isTextBased()) return;

            const result = await pool.query(
                `
                SELECT joined_at
                FROM member_joins
                WHERE user_id = $1
                  AND guild_id = $2
                  AND left_at IS NULL
                ORDER BY joined_at DESC
                LIMIT 1
                `,
                [member.id, member.guild.id]
            );

            const joinedAt = result.rows[0]?.joined_at
                ? new Date(result.rows[0].joined_at)
                : null;

            const accountCreated = new Date(member.user.createdTimestamp);

            function formatDuration(ms) {
                const totalMinutes = Math.floor(ms / 60000);
                const days = Math.floor(totalMinutes / 1440);
                const hours = Math.floor((totalMinutes % 1440) / 60);
                const minutes = totalMinutes % 60;

                const parts = [];
                if (days) parts.push(`${days}d`);
                if (hours) parts.push(`${hours}h`);
                if (minutes || parts.length === 0) parts.push(`${minutes}m`);
                return parts.join(' ');
            }

            const lines = [
                `**${member.user.tag}** left the server.`,
                `ID: \`${member.id}\``,
                `Account created: <t:${Math.floor(accountCreated.getTime() / 1000)}:F>`
            ];

            if (joinedAt) {
                lines.push(`Joined server: <t:${Math.floor(joinedAt.getTime() / 1000)}:F>`);
                lines.push(`Time in server: ${formatDuration(Date.now() - joinedAt.getTime())}`);
            } else {
                lines.push('Join date: unknown (no record found)');
            }

            await channel.send(lines.join('\n'));

            await pool.query(
                `
                UPDATE member_joins
                SET left_at = NOW()
                WHERE user_id = $1
                  AND guild_id = $2
                  AND left_at IS NULL
                `,
                [member.id, member.guild.id]
            );

        } catch (error) {
            console.error(
                `[Leave] Error handling ${member.user.tag} leaving ${member.guild.name}:`,
                error
            );
        }
    }
};
