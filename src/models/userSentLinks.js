const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserSentLinks = sequelize.define(
    "UserSentLinks",
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user-sent-links",
      indexes: [
        {
          unique: true,
          fields: ["userId", "linkId"],
        },
      ],
    }
  );

  return UserSentLinks;
};
