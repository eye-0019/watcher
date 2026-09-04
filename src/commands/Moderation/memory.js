const { getNotes } = require("../../utils/aiMemoryStore");

module.exports = {
    name: "memory",
    description: "View Watcher's memory about a user",

    async execute(message) {

        // owner only
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply("nah 😭");
        }

        const user = message.mentions.users.first();

        if (!user) {
            return message.reply(
                "mention someone so i can check 👀"
            );
        }

        const memory = await getNotes(user.id);

        if (!memory || memory.exchange_count === 0) {
            return message.reply(
                `i don't have any memories about ${user.username} yet 🫩`
            );
        }

        const notes = memory.notes || "No notes saved.";

        message.reply({
            embeds: [
                {
                    title: "🧠 Watcher Memory",
                    description:
                        `**User:** ${user.username}\n` +
                        `**ID:** ${user.id}\n\n` +
                        `**Notes:**\n${notes}\n\n` +
                        `**Conversations remembered:** ${memory.exchange_count}`,
                    timestamp: new Date()
                }
            ]
        });
    }
};
