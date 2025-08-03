const express = require("express");
const cors = require("cors");
const path = require("path");
const moment = require("moment");
const { Links, UserLinkData, UserSentLinks, sequelize } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API Authentication middleware (simple API key)
const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  const validApiKey = process.env.API_KEY;

  if (apiKey !== validApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};

// Routes

// Get all links
app.get("/api/links", authenticate, async (req, res) => {
  try {
    const links = await Links.findAll({
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      count: links.length,
      links: links.map((link) => ({
        id: link.id,
        url: link.link,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new link
app.post("/api/links", authenticate, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check if link already exists
    const existingLink = await Links.findOne({ where: { link: url } });

    if (existingLink) {
      return res.status(409).json({ error: "Link already exists" });
    }

    const newLink = await Links.create({ link: url });

    res.status(201).json({
      success: true,
      message: "Link added successfully",
      link: {
        id: newLink.id,
        url: newLink.link,
        createdAt: newLink.createdAt,
        updatedAt: newLink.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error adding link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove a link
app.delete("/api/links/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Links.findByPk(id);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    await link.destroy();

    res.json({
      success: true,
      message: "Link removed successfully",
      removedLink: {
        id: link.id,
        url: link.link,
      },
    });
  } catch (error) {
    console.error("Error removing link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user statistics
app.get("/api/users", authenticate, async (req, res) => {
  try {
    const users = await UserLinkData.findAll({
      order: [["LinksGiven", "DESC"]],
    });

    const stats = {
      totalUsers: users.length,
      totalLinksDispensed: users.reduce(
        (sum, user) => sum + user.LinksGiven,
        0
      ),
      activeUsers: users.filter((user) => user.LinksGiven > 0).length,
      usersAtLimit: users.filter((user) => user.Remaining === 0).length,
    };

    res.json({
      success: true,
      statistics: stats,
      users: users.map((user) => ({
        userId: user.User,
        remaining: user.Remaining,
        linksGiven: user.LinksGiven,
        firstUsed: user.FirstUsed
          ? moment(parseInt(user.FirstUsed)).format("YYYY-MM-DD HH:mm:ss")
          : null,
        nextReset: user.FirstUsed
          ? moment(parseInt(user.FirstUsed))
              .add(1, "month")
              .format("YYYY-MM-DD HH:mm:ss")
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset user limit
app.post("/api/users/:userId/reset", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    let userData = await UserLinkData.findOne({ where: { User: userId } });

    if (!userData) {
      userData = await UserLinkData.create({
        User: userId,
        Remaining: 3,
        LinksGiven: 0,
        FirstUsed: null,
      });
    } else {
      await userData.update({
        Remaining: 3,
        LinksGiven: 0,
        FirstUsed: null,
      });
    }

    // Also clear all sent links for this user
    await UserSentLinks.destroy({
      where: { userId: userId },
    });

    res.json({
      success: true,
      message: "User limit reset successfully",
      user: {
        userId: userData.User,
        remaining: userData.Remaining,
        linksGiven: userData.LinksGiven,
      },
    });
  } catch (error) {
    console.error("Error resetting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get system statistics
app.get("/api/stats", authenticate, async (req, res) => {
  try {
    const linkCount = await Links.count();
    const userCount = await UserLinkData.count();
    const totalLinksDispensed = (await UserLinkData.sum("LinksGiven")) || 0;
    const activeUsers = await UserLinkData.count({
      where: {
        LinksGiven: {
          [sequelize.Op.gt]: 0,
        },
      },
    });

    res.json({
      success: true,
      statistics: {
        totalLinks: linkCount,
        totalUsers: userCount,
        totalLinksDispensed,
        activeUsers,
        averageLinksPerUser:
          userCount > 0 ? (totalLinksDispensed / userCount).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Link Dispenser API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Web Interface Routes (HTML pages)

// Main dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    app.listen(PORT, () => {
      console.log(`🌐 Link Dispenser API server running on port ${PORT}`);
      console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
      console.log(
        `🔑 API Key required for endpoints (set API_KEY environment variable)`
      );
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

// Export app for potential external use
module.exports = { app, startServer };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
