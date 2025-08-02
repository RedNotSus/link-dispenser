const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Display the link dispenser panel"),

  async execute(interaction) {
    if (interaction.user.id !== "735641273477890178") {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("Link Dispenser")
      .setDescription(
        "Enjoy your link!\n\n**Limit:** 3 links per month\n**Reset:** Monthly on the same day you first used the dispenser"
      )
      .setColor("#5e7694")
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({
        text: "Link Dispenser System",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("get_link")
        .setLabel("Get Link")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🔗")
    );

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });
  },
};
