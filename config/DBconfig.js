// connectDB.cjs
const mongoose = require('mongoose');

function connectDB() {
  mongoose
    .connect("mongodb://localhost:27017/")
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Failed to connect to MongoDB:", error));
}

module.exports = connectDB;  // Export with CommonJS syntax


// Duongmb8602
