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
    const doctorCollection = await db.collection(`${process.env.DOCTORS_COLL_NAME}`);

    // View root directory
    app.get('/', async (req, res) => {
      res.send("Hello Ema-John Server. It's Working.....");
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
    });

    // See All Appointments
    app.get('/appointments', async (req, res) => {
      await client.connect();

      const cursor = appointmentCollection.find({})
      // const service = await cursor.toArray((err, document) => {
      //   res.send(document);
      // })
      const services = await cursor.toArray()
      res.send(services);
    })

    // FIND OPERATION
    app.post('/appointmentsByDate', async (req, res) => {
      await client.connect();

      const date = req.body;
      console.log(date.date)

      const cursor = appointmentCollection.find({ date: date.date })
      // const services = await cursor.toArray((err, document) => {
      //   res.send(document);
      // })
      const services = await cursor.toArray()
      res.send(services);
    });

    // Add Doctor
    app.post('/addADoctor', async (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const email = req.body.email;
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };

      await doctorCollection.insertOne({ name, email, image })
        .then((result) => {
          res.send(result.acknowledged);
          console.log(result.acknowledged)
        })
    })

    // All Doctors
    app.get('/doctors', async (req, res) => {
      const cursor = doctorCollection.find({})
      const service = await cursor.toArray((err, document) => {
        res.send(document);
      })
    });

    // Is Doctor
    app.post('/isDoctor', async (req, res) => {
      const email = await req.body.email;

      const cursor = doctorCollection.find({ email: email })
      const service = await cursor.toArray((err, doctors) => {
        res.send(doctors.acknowledged);
        console.log(doctors.acknowledged)
      })
    })

    // app.post('/isDoctor', (req, res) => {
    //   const email = req.body.email;
    //   doctorCollection.find({ email: email })
    //     .toArray((err, doctors) => {
    //       res.send(doctors.length > 0);
    //     })
    // })


  } finally {
    await client.close();
  }
}
run().catch(console.dir);
app.listen(process.env.PORT || port)