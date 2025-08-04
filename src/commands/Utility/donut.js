const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donutStatus")
    .setDescription("Check the status of a user on DonutSMP")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Enter the username to the check status of")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const user = interaction.user;
    const username = interaction.options.getString("username");

    await interaction.deferReply();

    try {
      const url = `https://api.ch3n.cc/donut/${username}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();

      if (!data || !data.user) {
        return interaction.editReply({
          content:
            "`❌` Could not get user status right now, please try again later.",
          ephemeral: true,
        });
      }
      const statusText = `**User:** ${data.user}\n**Online:** ${
        data.online ? "🟢 Yes" : "🔴 No"
      }\n**Location:** ${data.location}\n**Shards:** ${data.shards || "N/A"}`;

      const embed = new EmbedBuilder()
        .setColor(
          data.online ? "#00ff00" : client.config?.embedColor || "#5865F2"
        )
        .setTitle(`DonutSMP Status for ${data.user}`)
        .setDescription(statusText)
        .setFooter({
          text: `Requested by ${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor(client.config?.embedError || "#ff3333")
        .setTitle("`❌` Error")
        .setDescription(`Something went wrong: ${err.message}`)
        .setFooter({
          text: `Requested by ${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
