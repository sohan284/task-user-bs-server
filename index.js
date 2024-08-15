const express = require("express");
const cors = require("cors");
const port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.186ew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("task-user-bs").collection("user");

    app.get("/users", async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch users" });
      }
    });

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to add user" });
      }
    });

    app.get("/users/:id", async (req, res) => {
      try {
        const user = await userCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        if (user) {
          res.send(user);
        } else {
          res.status(404).send({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch user" });
      }
    });
    app.put("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            name: data?.name,
            phone: data?.phone,
            email: data?.email,
          },
        };
        const options = { upsert: true };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );

        if (result.matchedCount > 0) {
          res.send({ message: "User updated successfully", result });
        } else {
          res.send({ message: "User inserted successfully", result });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to update user" });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const _id = req.params.id;
        const query = { _id: new ObjectId(_id) };
        const result = await userCollection.deleteOne(query);
        if (result.deletedCount > 0) {
          res.send(result);
        } else {
          res.status(404).send({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to delete user" });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Backbenchers!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
