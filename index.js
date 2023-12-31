const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewaree
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER, process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qiitqce.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const toysCollection = client.db("addedToys").collection("toys");

    // Creating index on two fields
    const indexKeys = { title: 1, category: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
    const result = await toysCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get("/toysSearchByTitle/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await toysCollection
        .find({
          $or: [
            { toysname: { $regex: searchText, $options: "i" } },
            { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();

      res.send(result);
    });

    // all toy section

    app.get("/allToys/:text", async (req, res) => {
      const result = await toysCollection
        .find({
          category: req.params.text,
        })
        .limit(20)
        .toArray();
      res.send(result);
    });

    app.get("/addToys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    app.get("/singleToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToys = req.body;
      const toys = {
        $set: {
          name: updateToys.name,
          price: updateToys.price,
          subcategory: updateToys.subcategory,
          category: updateToys.category,
          description: updateToys.description,
          toysname: updateToys.toysname,
          img: updateToys.img,
          email: updateToys.email,
          quantity: updateToys.quantity,
        },
      };
      const result = await toysCollection.updateOne(filter, toys, options);
      res.send(result);
    });

    app.post("/addToys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await toysCollection.insertOne(newToys);
      res.send(result);
    });

    app.delete("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/addToys/:email", async (req, res) => {
      console.log(req.params.email);
      const toys = await toysCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(toys);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("mini wheel is available");
});

app.listen(port, () => {
  console.log(`mini wheel is running on port ${port}`);
});
