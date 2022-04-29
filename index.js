const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 8080;

// middlewer
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.33ezl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    await client.connect();
    
    const inventoryCollection = client.db("impelColect").collection("inventory");

    // get all inventory
    app.get("/inventory", async (req, res) => {
      const cursor = inventoryCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    console.log("connected to db");
  } finally {
  }
}

run().catch(console.log('error found'));


app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`listen example port ${port}`);
});
