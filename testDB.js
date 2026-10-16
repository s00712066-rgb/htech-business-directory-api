const { connectDB } = require("./db.js");

async function testConnection() {
  try {
    const db = await connectDB();

    console.log("Database test successful!");

    const collections = await db.listCollections().toArray();

    console.log("Collections:", collections.map(collection => collection.name));

  } catch (error) {
    console.error("Database test failed:", error.message);
  }
}

testConnection();