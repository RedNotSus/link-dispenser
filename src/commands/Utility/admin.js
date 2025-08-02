const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Links } = require("../../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Display the admin panel for link management"),

  async execute(interaction) {
    // Check if user is the owner
    if (interaction.user.id !== "735641273477890178") {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Get current link count
    const linkCount = await Links.count();

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Admin Panel - Link Management")
      .setDescription("Manage the link dispenser system from here.")
      .setColor("#5e7694")
      .addFields(
        {
          name: "📊 Current Stats",
          value: `**Total Links:** ${linkCount}\n**Status:** Active`,
          inline: false,
        },
        {
          name: "🛠️ Available Actions",
          value: "Use the buttons below to manage links",
          inline: false,
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({
        text: "Admin Panel - Link Dispenser",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("admin_view_links")
        .setLabel("View Links")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("👁️"),
      new ButtonBuilder()
        .setCustomId("admin_add_link")
        .setLabel("Add Link")
        .setStyle(ButtonStyle.Success)
        .setEmoji("➕"),
      new ButtonBuilder()
        .setCustomId("admin_remove_link")
        .setLabel("Remove Link")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🗑️")
    );

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
      ephemeral: true,
    });
  },
};
