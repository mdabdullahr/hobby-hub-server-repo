require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.yzsvddi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const groupCollection = client.db("groupDB").collection("groups");

    app.get("/groups", async (req, res) => {
      const search = req.query.search || "";
      const sort = req.query.sort || ""; 
    

      // Search Query
      const query = search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { groupName: { $regex: search, $options: "i" } },
              { location: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      let sortOption = {};
      if (sort === "newest") {
        sortOption = { startDate: -1 };
      } else if (sort === "oldest") {
        sortOption = { startDate: 1 };
      }

      const result = await groupCollection.find(query).sort(sortOption).toArray();

      res.send(result);
    });

    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.findOne(query);
      res.send(result);
    });

    app.post("/groups", async (req, res) => {
      const group = req.body;
      const result = await groupCollection.insertOne(group);
      res.send(result);
    });

    app.put("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const updateGroup = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateGroup,
      };
      const result = await groupCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // JOIN GROUP API
    app.put("/groups/:id/join", async (req, res) => {
      const id = req.params.id;
      const { email } = req.body;

      const group = await groupCollection.findOne({ _id: new ObjectId(id) });

      const now = new Date();
      const groupStartDate = new Date(group?.startDate);

      if (
        !group ||
        !email ||
        group.members?.includes(email) ||
        group.members.length >= Number(group.maxMembers) ||
        groupStartDate < now
      ) {
        return res.send({
          success: false,
          reason: !group
            ? "Group not found"
            : !email
            ? "Email is required"
            : group.members.includes(email)
            ? "Already a member"
            : groupStartDate < now
            ? "Group is no longer active"
            : "Group is full",
        });
      }

      const updateResult = await groupCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { members: email } }
      );

      res.send({
        success: true,
        result: updateResult,
      });
    });

    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My Assignment 10 Server site is running");
});

app.listen(port, () => {
  console.log(`My Server Site Running on port : ${port}`);
});
