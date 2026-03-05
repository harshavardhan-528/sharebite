const cron = require("node-cron");
const Food = require("../models/food");

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {

    console.log("Checking expired food...");

    const result = await Food.deleteMany({
      expiryTime: { $lt: new Date() }
    });

    console.log(`Expired food removed: ${result.deletedCount}`);

  } catch (error) {
    console.error("Expiry job error:", error);
  }
});