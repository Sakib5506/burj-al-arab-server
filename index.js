const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase-admin/app');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
console.log(process.env.DB_PASS);


const uri = "mongodb+srv://arabian:arabian@cluster0.iz1nfji.mongodb.net/?retryWrites=true&w=majority";
// const uri = `mongodb+srv://${process.env.DB_PASS}:${process.env.DB_PASS}@cluster0.iz1nfji.mongodb.net/?retryWrites=true&w=majority`;

const port = 5000
const app = express();

//jwt admin
var admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-arab-auth-7165b-firebase-adminsdk-jdgze-0fa004aa32.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://burj-al-arab.firebaseio.com'
});

const pass = "arabian";

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

//test db


const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db("burjAlArab");
        const bookingCollection = database.collection("bookings");

        // Post/Create
        app.post('/addBooking', async (req, res) => {
            const newBooking = req.body;
            await bookingCollection.insertOne(newBooking)
                .then(result => {
                    // res.send(result.insertedCount > 0);
                    console.log(result);
                })
            console.log(newBooking);
        })

        // Get
        app.get('/getBookings', (req, res) => {
            console.log(req.headers.authorization);
            const bearer = req.headers.authorization;
            if (bearer && bearer.startsWith('Bearer ')) {
                const idToken = bearer.split(' ')[1];
                console.log({ idToken });
                // idToken comes from the client app
                admin.auth()
                    .verifyIdToken(idToken)
                    .then((decodedToken) => {
                        const tokenEmail = decodedToken.email;
                        const queryEmail = req.query.email;
                        console.log(tokenEmail, queryEmail);
                        if (tokenEmail == queryEmail) {
                            bookingCollection.find({ email: queryEmail })
                                .toArray((err, documents) => {
                                    res.status(200).send(documents);
                                })
                        } else {
                            res.send(401).send('Unauthorized access')
                        }

                    })
                    .catch((error) => {
                        // Handle error
                        res.send(401).send('Unauthorized access')
                    });
            } else {
                res.send(401).send('Unauthorized access')
            }





        })



        // perform actions on the collection object
        // console.log(collection);
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })


app.listen(port)