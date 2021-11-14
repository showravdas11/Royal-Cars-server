const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eeauc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const databae = client.db('our_products')
        const carCollection = databae.collection('cars')
        const orderCollection = databae.collection('orders')
        const reviewCollection = databae.collection('reviews')
        const usersCollection = databae.collection('users')

        app.get('/cars/:limit', async (req, res) => {
            const limit = parseInt(req.params.limit);
            // console.log(limit)
            const cursor = carCollection.find({}).limit(limit);
            const cars = await cursor.toArray()
            res.send(cars)
        })

        //POST-API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log("hit the post api", order)

            const result = await orderCollection.insertOne(order)
            res.json(result)
        })

        // GET
        app.get('/orders', async (req, res) => {
            // console.log(limit)
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray()
            res.send(orders)
        })


        app.get('/details/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const detail = await carCollection.findOne(query)
            res.json(detail)
        })

        //delete api

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })



        // review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log("hit the post api", review)
            const result = await reviewCollection.insertOne(review)
            res.json(result)
            // res.send('post hited')
        })

        app.get('/reviews', async (req, res) => {
            // console.log(limit)
            const cursor = reviewCollection.find({});
            const orders = await cursor.toArray()
            res.send(orders)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body
            console.log('put', user);
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('hello royal car')
})

app.listen(port, () => {
    console.log('server connect', port);
})