const {
  Interaction,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { Links, UserLinkData, UserSentLinks } = require("../database");
const moment = require("moment");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // Handle button interactions
    if (interaction.isButton()) {
      return handleButtonInteraction(interaction, client);
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      return handleModalSubmit(interaction, client);
    }

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

// Handle button interactions
async function handleButtonInteraction(interaction, client) {
  const { customId } = interaction;

  try {
    if (customId === "get_link") {
      await handleGetLink(interaction);
    } else if (customId === "open_link") {
      await handleOpenLink(interaction);
    } else if (customId === "admin_view_links") {
      await handleViewLinks(interaction);
    } else if (customId === "admin_add_link") {
      await handleAddLink(interaction);
    } else if (customId === "admin_remove_link") {
      await handleRemoveLink(interaction);
    } else if (customId.startsWith("remove_link_")) {
      await handleConfirmRemoveLink(interaction);
    }
  } catch (error) {
    console.error("Error handling button interaction:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  }
}

// Handle modal submissions
async function handleModalSubmit(interaction, client) {
  const { customId } = interaction;

  try {
    if (customId === "add_link_modal") {
      await handleAddLinkSubmit(interaction);
    }
  } catch (error) {
    console.error("Error handling modal submit:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  }
}

// Get Link Handler
async function handleGetLink(interaction) {
  const userId = interaction.user.id;
  const now = Date.now();

  // Find or create user data
  let userData = await UserLinkData.findOne({ where: { User: userId } });

  if (!userData) {
    userData = await UserLinkData.create({
      User: userId,
      Remaining: 3,
      LinksGiven: 0,
      FirstUsed: now,
    });
  } else {
    // Check if month has passed since first use
    if (userData.FirstUsed) {
      const firstUsed = moment(parseInt(userData.FirstUsed));
      const currentTime = moment(now);

      if (currentTime.diff(firstUsed, "months") >= 1) {
        // Reset the limit and clear sent links
        await userData.update({
          Remaining: 3,
          LinksGiven: 0,
          FirstUsed: now,
        });

        // Clear all sent links for this user to allow them to get links again
        await UserSentLinks.destroy({
          where: { userId: userId },
        });
      }
    } else {
      // Set first used time if not set
      await userData.update({ FirstUsed: now });
    }
  }

  // Check if user has remaining links
  if (userData.Remaining <= 0) {
    const nextReset = moment(parseInt(userData.FirstUsed)).add(1, "month");
    const resetDate = nextReset.format("MMMM Do, YYYY");

    const limitEmbed = new EmbedBuilder()
      .setTitle("❌ Monthly Limit Reached")
      .setDescription(`You have used all 3 of your monthly links.`)
      .setColor("#ff0000")
      .addFields(
        { name: "🔄 Reset Date", value: resetDate, inline: false },
        {
          name: "📊 Links Used",
          value: `${userData.LinksGiven}/3`,
          inline: true,
        },
        { name: "⏰ Time Remaining", value: nextReset.fromNow(), inline: true }
      )
      .setFooter({
        text: "Link Dispenser",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [limitEmbed], ephemeral: true });
  }

  // Get all available links
  const allLinks = await Links.findAll();

  if (allLinks.length === 0) {
    const noLinksEmbed = new EmbedBuilder()
      .setTitle("❌ No Links Available")
      .setDescription(
        "There are currently no links available. Please try again later."
      )
      .setColor("#ff0000")
      .setFooter({
        text: "Link Dispenser",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [noLinksEmbed], ephemeral: true });
  }

  // Get links already sent to this user
  const sentLinks = await UserSentLinks.findAll({
    where: { userId: userId },
    attributes: ["linkId"],
  });

  const sentLinkIds = sentLinks.map((sent) => sent.linkId);

  // Filter out links already sent to this user
  const availableLinks = allLinks.filter(
    (link) => !sentLinkIds.includes(link.id)
  );

  if (availableLinks.length === 0) {
    const noAvailableEmbed = new EmbedBuilder()
      .setTitle("❌ No Available Links")
      .setDescription(
        "Sorry, no available links. You have already received all the links we have available."
      )
      .setColor("#ff0000")
      .addFields(
        { name: "📊 Total Links", value: `${allLinks.length}`, inline: true },
        {
          name: "✅ Already Received",
          value: `${sentLinkIds.length}`,
          inline: true,
        }
      )
      .setFooter({
        text: "Link Dispenser",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [noAvailableEmbed], ephemeral: true });
  }

  // Get a random link from available links
  const randomLink =
    availableLinks[Math.floor(Math.random() * availableLinks.length)];

  // Update user data
  await userData.update({
    Remaining: userData.Remaining - 1,
    LinksGiven: userData.LinksGiven + 1,
  });

  // Record that this link was sent to this user
  await UserSentLinks.create({
    userId: userId,
    linkId: randomLink.id,
  });

  // Send DM to user
  try {
    const dmEmbed = new EmbedBuilder()
      .setTitle("🔗 Your Link")
      .setDescription("Here is your unblocked website link!")
      .setColor("#5e7694")
      .addFields(
        {
          name: "🌐 Website Link",
          value: `${randomLink.link}`,
          inline: false,
        },
        {
          name: "📊 Usage",
          value: `${userData.LinksGiven}/3 links used this month`,
          inline: true,
        },
        {
          name: "⏰ Remaining",
          value: `${userData.Remaining} links left`,
          inline: true,
        }
      )
      .setFooter({
        text: "Link Dispenser",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const linkButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Open Link")
        .setStyle(ButtonStyle.Link)
        .setURL(randomLink.link)
        .setEmoji("🌐")
    );

    await interaction.user.send({
      embeds: [dmEmbed],
      components: [linkButton],
    });

    const confirmEmbed = new EmbedBuilder()
      .setTitle("✅ Link Sent!")
      .setDescription("Check your DMs for your personal link!")
      .setColor("#5e7694")
      .addFields({
        name: "📊 Remaining Links",
        value: `${userData.Remaining}/3`,
        inline: true,
      })
      .setFooter({
        text: "Link Dispenser",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  } catch (error) {
    console.error("Error sending DM:", error);

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Could Not Send DM")
      .setDescription(
        "I couldn't send you a DM. Please make sure your DMs are open and try again."
      )
      .setColor("#ff0000")
      .setFooter({
        text: "Link Dispenser",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await userData.update({
      Remaining: userData.Remaining,
      LinksGiven: userData.LinksGiven - 1,
    });

    await UserSentLinks.destroy({
      where: {
        userId: userId,
        linkId: randomLink.id,
      },
    });

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleViewLinks(interaction) {
  if (interaction.user.id !== "735641273477890178") {
    return interaction.reply({ content: "❌ Access denied.", ephemeral: true });
  }

  const links = await Links.findAll();

  if (links.length === 0) {
    const noLinksEmbed = new EmbedBuilder()
      .setTitle("📋 Link Database")
      .setDescription("No links in the database.")
      .setColor("#5e7694")
      .setFooter({
        text: "Admin Panel",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [noLinksEmbed], ephemeral: true });
  }

  const linkList = links
    .map((link, index) => `${index + 1}. ${link.link}`)
    .join("\n");

  const linksEmbed = new EmbedBuilder()
    .setTitle("📋 Link Database")
    .setDescription(
      `**Total Links:** ${links.length}\n\n\`\`\`${linkList}\`\`\``
    )
    .setColor("#5e7694")
    .setFooter({
      text: "Admin Panel",
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [linksEmbed], ephemeral: true });
}

async function handleAddLink(interaction) {
  if (interaction.user.id !== "735641273477890178") {
    return interaction.reply({ content: "❌ Access denied.", ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId("add_link_modal")
    .setTitle("Add New Link");

  const linkInput = new TextInputBuilder()
    .setCustomId("link_input")
    .setLabel("Website Link")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("https://example.com")
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(linkInput);
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

// Admin Add Link Submit Handler
async function handleAddLinkSubmit(interaction) {
  if (interaction.user.id !== "735641273477890178") {
    return interaction.reply({ content: "❌ Access denied.", ephemeral: true });
  }

  const link = interaction.fields.getTextInputValue("link_input");

  // Validate URL
  try {
    new URL(link);
  } catch (error) {
    const invalidEmbed = new EmbedBuilder()
      .setTitle("❌ Invalid URL")
      .setDescription(
        "Please provide a valid URL (including http:// or https://)"
      )
      .setColor("#ff0000")
      .setFooter({
        text: "Admin Panel",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [invalidEmbed], ephemeral: true });
  }

  // Check if link already exists
  const existingLink = await Links.findOne({ where: { link } });

  if (existingLink) {
    const existsEmbed = new EmbedBuilder()
      .setTitle("❌ Link Already Exists")
      .setDescription("This link is already in the database.")
      .setColor("#ff0000")
      .setFooter({
        text: "Admin Panel",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [existsEmbed], ephemeral: true });
  }

  // Add link to database
  await Links.create({ link });

  const successEmbed = new EmbedBuilder()
    .setTitle("✅ Link Added Successfully")
    .setDescription(`Added link: ${link}`)
    .setColor("#5e7694")
    .setFooter({
      text: "Admin Panel",
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [successEmbed], ephemeral: true });
}

// Admin Remove Link Handler
async function handleRemoveLink(interaction) {
  if (interaction.user.id !== "735641273477890178") {
    return interaction.reply({ content: "❌ Access denied.", ephemeral: true });
  }

  const links = await Links.findAll();

  if (links.length === 0) {
    const noLinksEmbed = new EmbedBuilder()
      .setTitle("❌ No Links to Remove")
      .setDescription("There are no links in the database.")
      .setColor("#ff0000")
      .setFooter({
        text: "Admin Panel",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [noLinksEmbed], ephemeral: true });
  }

  // Create buttons for each link (max 5 per message due to Discord limits)
  const linkButtons = [];
  const maxButtons = Math.min(links.length, 5);

  for (let i = 0; i < maxButtons; i++) {
    linkButtons.push(
      new ButtonBuilder()
        .setCustomId(`remove_link_${links[i].id}`)
        .setLabel(`Remove Link ${i + 1}`)
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🗑️")
    );
  }

  const actionRow = new ActionRowBuilder().addComponents(linkButtons);

  const linkList = links
    .slice(0, 5)
    .map((link, index) => `${index + 1}. ${link.link}`)
    .join("\n");

  const removeEmbed = new EmbedBuilder()
    .setTitle("🗑️ Remove Link")
    .setDescription(`Select a link to remove:\n\n\`\`\`${linkList}\`\`\``)
    .setColor("#5e7694")
    .setFooter({
      text: "Admin Panel",
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  if (links.length > 5) {
    removeEmbed.addFields({
      name: "⚠️ Note",
      value: `Showing first 5 links. Total: ${links.length}`,
      inline: false,
    });
  }

  await interaction.reply({
    embeds: [removeEmbed],
    components: [actionRow],
    ephemeral: true,
  });
}

// Admin Confirm Remove Link Handler
async function handleConfirmRemoveLink(interaction) {
  if (interaction.user.id !== "735641273477890178") {
    return interaction.reply({ content: "❌ Access denied.", ephemeral: true });
  }

  const linkId = interaction.customId.split("_")[2];

  const link = await Links.findByPk(linkId);

  if (!link) {
    const notFoundEmbed = new EmbedBuilder()
      .setTitle("❌ Link Not Found")
      .setDescription("The selected link could not be found.")
      .setColor("#ff0000")
      .setFooter({
        text: "Admin Panel",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
  }

  await link.destroy();

  const successEmbed = new EmbedBuilder()
    .setTitle("✅ Link Removed Successfully")
    .setDescription(`Removed link: ${link.link}`)
    .setColor("#5e7694")
    .setFooter({
      text: "Admin Panel",
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [successEmbed], ephemeral: true });
}
