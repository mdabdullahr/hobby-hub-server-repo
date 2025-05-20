const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.yzsvddi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const groupCollection = client.db("groupDB").collection("groups");

    app.get("/groups", async(req, res) => {
      const result = await groupCollection.find().toArray();
      res.send(result);
    })

    app.get("/groups/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await groupCollection.findOne(query);
      res.send(result)
    })

    app.post("/groups", async(req, res) => {
      const group = req.body;
      const result = await groupCollection.insertOne(group);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My Assignment 11 Server site is running");
});

app.listen(port, () => {
  console.log(`My Server Site Running on port : ${port}`);
});
