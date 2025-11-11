const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { GoogleGenAI } = require("@google/genai");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an AI Image.")
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
      const ai = new GoogleGenAI({
        apiKey: process.env.gemini,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: promptInput,
      });

      for (const part of response.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");

          const attachment = new AttachmentBuilder(buffer, {
            name: "gemini-generated-image.png",
          });

          const replyMessage = new EmbedBuilder()
            .setColor(client.config.embedSuccess)
            .setTitle("AI Generated Image")
            .setDescription(`**Prompt:** ${promptInput}`)
            .setImage("attachment://gemini-generated-image.png")
            .setTimestamp();

          return interaction.editReply({
            embeds: [replyMessage],
            files: [attachment],
          });
        }
      }

      const noImageMessage = new EmbedBuilder()
        .setColor(client.config.embedError)
        .setDescription(
          `\`❌\` No image was generated. Please try a different prompt.`
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
