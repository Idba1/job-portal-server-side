const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()



const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174', ,
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwse58h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
        const alljobCollection = client.db('jobnest').collection('alljob')
        const applyCollection = client.db('jobnest').collection('apply')



        // Save job
        app.post('/alljob', async (req, res) => {
            const jobData = req.body
            const result = await alljobCollection.insertOne(jobData)
            res.send(result)
        })

        // Get job data from mongo
        app.get('/alljob', async (req, res) => {
            const result = await alljobCollection.find().toArray()
            res.send(result)
        })

        // get all jobs posted by a specific user
        app.get('/jobs/:email', async (req, res) => {
            const email = req.params.email
            const query = { 'loggedInUserInfo.email': email }
            const result = await alljobCollection.find(query).toArray()
            res.send(result)
        })


        // Get a single job data from db using job id
        app.get('/job/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await alljobCollection.findOne(query)
            res.send(result)
        })



        // Save Apply
        app.post('/apply', async (req, res) => {
            const applyData = req.body
            const result = await applyCollection.insertOne(applyData)
            res.send(result)
        })


        // Get allapply data from mongo
        app.get('/apply', async (req, res) => {
            const result = await applyCollection.find().toArray()
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hey This is JobNest Server!')
})


app.listen(port, () => console.log(`Server running on port ${port}`))