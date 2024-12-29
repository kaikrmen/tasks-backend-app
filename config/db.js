const mongoose = require("mongoose");
const { MONGODB_URI } = require("./../config");

const connectDB = async () => {
  try {
    const db = await mongoose.connect(MONGODB_URI);
    console.log("Database is connected to", db.connection.name);
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = { connectDB };
