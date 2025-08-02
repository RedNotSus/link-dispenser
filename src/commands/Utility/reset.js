const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { UserLinkData, UserSentLinks } = require("../../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset a user's link limit")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to reset the limit for")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if user is the owner
    if (interaction.user.id !== "735641273477890178") {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("user");

    try {
      // Find or create user data
      let userData = await UserLinkData.findOne({
        where: { User: targetUser.id },
      });

      if (!userData) {
        // Create new user data if doesn't exist
        userData = await UserLinkData.create({
          User: targetUser.id,
          Remaining: 3,
          LinksGiven: 0,
          FirstUsed: null,
        });
      } else {
        // Reset existing user data
        await userData.update({
          Remaining: 3,
          LinksGiven: 0,
          FirstUsed: null,
        });
      }

      // Note: Not clearing UserSentLinks to preserve link history
      // User will get their count reset but won't receive duplicate links

      const embed = new EmbedBuilder()
        .setTitle("✅ User Reset Successful")
        .setDescription(`Successfully reset link limit for ${targetUser.tag}`)
        .setColor("#5e7694")
        .addFields(
          {
            name: "👤 User",
            value: `${targetUser.tag} (${targetUser.id})`,
            inline: false,
          },
          { name: "🔄 New Limit", value: "3 links", inline: true },
          { name: "📊 Links Used", value: "0", inline: true }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({
          text: "Link Dispenser Admin",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error resetting user limit:", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Reset Failed")
        .setDescription("An error occurred while resetting the user's limit.")
        .setColor("#ff0000")
        .setFooter({
          text: "Link Dispenser Admin",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
