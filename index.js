const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiav5mh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.use(express.json());

const port = 4000;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = await client.db(`${process.env.DB_NAME}`);
    const appointmentCollection = await db.collection(`${process.env.APPOINTMENT_COLL_NAME}`);

    // View root directory
    app.get('/', async (req, res) => {
      res.send("Hello Ema-John Server. It's Working");
    })

    // CREATE OPERATION
    app.post('/addAppointment', async (req, res) => {
      await client.connect();
      const appointment = req.body;
      console.log(appointment)

      await appointmentCollection.insertOne(appointment)
        .then((result) => {
          res.send(result.acknowledged);
          console.log(result.acknowledged)
        })
    })

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
app.listen(process.env.PORT || port)