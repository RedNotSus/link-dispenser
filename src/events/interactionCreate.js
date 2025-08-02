const {
  Interaction,
  EmbedBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const color = {
      red: "\x1b[31m",
      orange: "\x1b[38;5;202m",
      yellow: "\x1b[33m",
      green: "\x1b[32m",
      blue: "\x1b[34m",
      reset: "\x1b[0m",
    };

    function getTimestamp() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({
        content: `This Command is Outdated.`,
        ephemeral: true,
      });
    }

    if (command.developer && interaction.user.id !== "735641273477890178") {
      return interaction.reply({
        content: `This Command Is only for developers`,
        ephemeral: true,
      });
    }

    const Embed = new EmbedBuilder()
      .setColor("Random")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(
        `${
          color.red
        }[${getTimestamp()}] [INTERACTION_CREATE] Error while executing command. \n${
          color.red
        }[${getTimestamp()}] [INTERACTION_CREATE] Please check you are using the correct execute method: "async execute(interaction, client)":`,
        error
      );

      const errorEmbed = new EmbedBuilder()
        .setColor(client.config.embedError)
        .setDescription(
          `There was an error while executing this command!\n\`\`\`${error}\`\`\``
        );

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
