const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an AI image.")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt for the AI image.")
        .setRequired(true)
    ),
  developer: false,
  async execute(interaction, client) {
    const promptInput = interaction.options.getString("prompt");

    const loadingMessage = new EmbedBuilder()
      .setColor(client.config.embedSuccess)
      .setDescription(`🎨 Generating image...\n**Prompt:** ${promptInput}`)
      .setTimestamp();

    await interaction.reply({ embeds: [loadingMessage] });

    try {
      const apiKey = process.env.HACKAI_API_KEY;
      const response = await fetch(
        "https://ai.hackclub.com/proxy/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: promptInput,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      const images = data.choices[0]?.message?.images;

      if (images && images.length > 0) {
        const imageUrl = images[0]?.image_url?.url;

        if (!imageUrl) {
          throw new Error("No image URL found in response");
        }

        if (imageUrl.startsWith("data:image")) {
          const base64Data = imageUrl.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          const attachment = new AttachmentBuilder(buffer, {
            name: "ai-generated-image.png",
          });

          const replyMessage = new EmbedBuilder()
            .setColor(client.config.embedSuccess)
            .setTitle("✨ AI Generated Image")
            .setDescription(`**Prompt:** ${promptInput}`)
            .setImage("attachment://ai-generated-image.png")
            .setTimestamp();

          return interaction.editReply({
            embeds: [replyMessage],
            files: [attachment],
          });
        }

        const replyMessage = new EmbedBuilder()
          .setColor(client.config.embedSuccess)
          .setTitle("✨ AI Generated Image")
          .setDescription(`**Prompt:** ${promptInput}`)
          .setImage(imageUrl)
          .setTimestamp();

        return interaction.editReply({ embeds: [replyMessage] });
      }

      const messageContent = data.choices[0]?.message?.content;

      if (!messageContent) {
        throw new Error("No response from AI");
      }

      if (
        typeof messageContent === "string" &&
        messageContent.startsWith("data:image")
      ) {
        const base64Data = messageContent.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        const attachment = new AttachmentBuilder(buffer, {
          name: "ai-generated-image.png",
        });

        const replyMessage = new EmbedBuilder()
          .setColor(client.config.embedSuccess)
          .setTitle("✨ AI Generated Image")
          .setDescription(`**Prompt:** ${promptInput}`)
          .setImage("attachment://ai-generated-image.png")
          .setTimestamp();

        return interaction.editReply({
          embeds: [replyMessage],
          files: [attachment],
        });
      }

      // If the response is a URL
      if (
        typeof messageContent === "string" &&
        (messageContent.startsWith("http://") ||
          messageContent.startsWith("https://"))
      ) {
        const replyMessage = new EmbedBuilder()
          .setColor(client.config.embedSuccess)
          .setTitle("✨ AI Generated Image")
          .setDescription(`**Prompt:** ${promptInput}`)
          .setImage(messageContent)
          .setTimestamp();

        return interaction.editReply({ embeds: [replyMessage] });
      }
      console.log("Unexpected response format:", JSON.stringify(data, null, 2));

      const noImageMessage = new EmbedBuilder()
        .setColor(client.config.embedError)
        .setDescription(
          `\`❌\` Unexpected response format. Please try again.\n**Debug:** ${
            typeof messageContent === "string"
              ? messageContent.substring(0, 100)
              : "Non-string content"
          }`
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [noImageMessage] });
    } catch (error) {
      console.error(`Error executing Image command: ${error.message}`);

      const errorMessage = new EmbedBuilder()
        .setColor(client.config.embedError)
        .setDescription(
          `\`❌\` An error occurred while generating the image. Please try again later.\n**Error:** ${error.message}`
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [errorMessage] });
    }
  },
};
