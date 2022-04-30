const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8080;

// middlewer
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.33ezl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();

    const inventoryCollection = client
      .db("impelColect")
      .collection("inventory");

    // get all inventory
    app.get("/inventory", async (req, res) => {
      const cursor = inventoryCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // get one item by id
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.findOne(query);
      res.send(result);
    });

    // get one item for reduce
    app.put("/quantity/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const findData = await inventoryCollection.findOne(query);
      const found = findData.quantity - 1;

      const result = await inventoryCollection.updateOne(query, {
        $set: { ...req.body, quantity: found },
      });
      res.send(result);
    });

    console.log("connected to db");
  } finally {
  }
}

run().catch(console.dir());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`listen example port ${port}`);
});

