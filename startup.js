#!/usr/bin/env node
require("dotenv").config();

console.log("🚀 Link Dispenser Bot - Startup Check");
console.log("=====================================");

// Check required environment variables
const requiredVars = ["DISCORD_TOKEN", "CLIENT_ID", "DATABASE_URL"];

const optionalVars = [
  "GUILD_ID",
  "API_KEY",
  "PORT",
  "NODE_ENV",
  "DATABASE_SSL",
];

console.log("\n📋 Required Environment Variables:");
let missingRequired = false;
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    missingRequired = true;
  }
}

console.log("\n📋 Optional Environment Variables:");
for (const varName of optionalVars) {
  const value = process.env[varName];
  if (value) {
    console.log(
      `✅ ${varName}: ${
        varName === "DISCORD_TOKEN" || varName === "API_KEY"
          ? "[HIDDEN]"
          : value
      }`
    );
  } else {
    console.log(`⚠️  ${varName}: Not set (using default)`);
  }
}

if (missingRequired) {
  console.log("\n❌ Cannot start bot - missing required environment variables");
  console.log("💡 Please check your .env file or environment configuration");
  process.exit(1);
}

console.log("\n🔍 Testing database connection...");

// Test database connection
const { sequelize } = require("./src/database");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful");

    // Test sync
    await sequelize.sync({ alter: false }); // Don't alter in production
    console.log("✅ Database sync successful");

    console.log("\n🎉 All checks passed! Starting bot...");

    // Start the main application
    require("./src/index.js");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    if (error.message.includes("SSL") || error.message.includes("ssl")) {
      console.log("\n💡 SSL Connection Error Solutions:");
      console.log("   1. Set DATABASE_SSL=false in your environment variables");
      console.log("   2. Check if your database provider requires SSL");
      console.log("   3. Verify your DATABASE_URL is correct");
    }

    console.log("\n🔧 Troubleshooting tips:");
    console.log(
      "   - Verify your DATABASE_URL format: postgresql://user:pass@host:port/db"
    );
    console.log("   - Check if your database server is running");
    console.log("   - Ensure your database credentials are correct");

    process.exit(1);
  }
}

testConnection();
