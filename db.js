require ("dotenv").config();

const {MongoClient} = require("mongodb");

const uri = process.env.MONGODB_URI;

console.log("MongoDB URI loaded:", Boolean(uri));

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    
    return client.db("htechDirectory");
  }
  catch (error) {
    console.error("mongoDB connection failed", error.message)
    
    throw error;
  }
}

module.exports = {connectDB, client};