const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8080;

// middleware
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

    // add new item
    app.post("/add-inventory", async (req, res) => {
      const body = req.body;
      const result = await inventoryCollection.insertOne(body);
      res.send(result);
    });

    // get all inventory
    app.get("/inventory", async (req, res) => {
      const cursor = inventoryCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // get item for under specific person by query
    app.get("/getItemByEmail", (req, res) => {
      const getAuth = req.headers.authorization;
      if (!getAuth) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      jwt.verify(getAuth, process.env.JWT_TOKEN, async (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden access" });
        }

        if (decoded === req.query.email) {
          const findingData = inventoryCollection.find({
            email: req.query.email,
          });
          const result = await findingData.toArray();
          res.send(result);
        }
      });
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
      const quantity = findData.quantity - 1;
      const sold = findData.sold + 1;
      const result = await inventoryCollection.updateOne(query, {
        $set: { quantity: quantity, sold: sold },
      });
      res.send(result);
    });

    // get one item for update quantity
    app.put("/add-quantity/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const quantity = req.body.quantity;
      const findData = await inventoryCollection.findOne(query);
      const found = findData.quantity + parseInt(quantity);
      const result = await inventoryCollection.updateOne(query, {
        $set: { quantity: found },
      });
      res.send(result);
    });

    // delete one item by id parameter
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });

    // generate web jwt token sign
    app.post("/generate", async (req, res) => {
      const user = req.body.email;
      const token = jwt.sign(user, process.env.JWT_TOKEN);
      res.send({ token });
    });

    // get all data for pagination with query parameters
    app.get("/queryData", async (req, res) => {
      const page = req.query.page;
      const skip = 10;
      const cursor = inventoryCollection.find({});
      let inventory;
      if (page) {
        inventory = await cursor
          .skip(page * skip)
          .limit(skip)
          .toArray();
      } else {
        inventory = await cursor.toArray();
      }
      res.send(inventory);
    });

    // get total inventory count
    app.get("/totalInventoryCount", async (req, res) => {
      const count = await inventoryCollection.estimatedDocumentCount();
      res.send({ count });
    });

    console.log("connected to db");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`listening impel server ${port}`);
});
