const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer'); 
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()



const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://jobnest100.netlify.app',
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
        const careerBlogCollection = client.db('jobnest').collection('blog')
        const subscribersCollection = client.db('jobnest').collection('subscribers');



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

        // update
        app.put('/job/:id', async (req, res) => {
            const id = req.params.id
            const jobData = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...jobData,
                },
            }
            const result = await alljobCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })

        // delete
        app.delete('/job/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await alljobCollection.deleteOne(query)
            res.send(result)
        })

        // Save Apply
        app.post('/apply', async (req, res) => {
            const applyData = req.body
            const result = await applyCollection.insertOne(applyData)
            res.send(result)
        })


        // // Save apply
        // app.post('/apply', async (req, res) => {
        //     const applyData = req.body;
        //     const id = applyData.id; 
        //     const result = await applyCollection.insertOne(applyData);
        
        //     // Update the job's applicant number in the alljob collection
        //     const query = { _id: new ObjectId(id) };
        //     const updateDoc = { $inc: { 'applicantsNumber': 1 } }; 
        //     await alljobCollection.updateOne(query, updateDoc);
        
        //     res.send(result);
        // });


        // Get allapply data from mongo
        app.get('/apply', async (req, res) => {
            const result = await applyCollection.find().toArray()
            res.send(result)
        })


        // get all apply by a specific user
        app.get('/apply/:email', async (req, res) => {
            const email = req.params.email
            const query = { 'email': email }
            const result = await applyCollection.find(query).toArray()
            res.send(result)
        })

        // Get career blog
        app.get('/career-blog', async (req, res) => {
            const result = await careerBlogCollection.find().toArray()
            res.send(result)
        })

        
        // Get a single blog details
        app.get('/career-blog/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await careerBlogCollection.findOne(query)
            res.send(result)
        })


        // Add new endpoint for subscribing to the newsletter
        app.post('/subscribe', async (req, res) => {
            const { email } = req.body;

            // Check if the email is already subscribed
            const existingSubscriber = await subscribersCollection.findOne({ email });
            if (existingSubscriber) {
                return res.status(400).json({ error: 'This email is already subscribed' });
            }

             // Add the new subscriber to the database
             const result = await subscribersCollection.insertOne({ email });
            
             // Set up Nodemailer
             const transporter = nodemailer.createTransport({
                 service: 'gmail',
                 auth: {
                     user: process.env.EMAIL,
                     pass: process.env.EMAIL_PASSWORD,
                 },
             });

               // Mail options
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Subscription Confirmation',
                text: 'Thank you for subscribing to JobNest\'s newsletter! You will receive the latest updates on job listings, career advice, industry insights, and exclusive promotions directly to your inbox.',
            };

            // Send confirmation email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ error: "Thank you for subscribing to JobNest's newsletter! We encountered an issue while sending the confirmation email. However, rest assured, you have been added to our community, and we will resolve this as soon as possible. We appreciate your patience." });
                } else {
                    return res.status(200).json({ message: 'Subscription successful, confirmation email sent!' });
                }
            });
        });


        // Get allapply data from mongo
        app.get('/subscribe', async (req, res) => {
            const result = await subscribersCollection.find().toArray()
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