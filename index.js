const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= process.env.PORT || 5000



app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wslenxe.mongodb.net/?retryWrites=true&w=majority`;

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

    
    const brandsCollections = client.db('brandsDB').collection('brands');

    const brandsCategoryCollection = client.db('brandsDB').collection('brandsCategory');

    const addToCartCollection = client.db('brandsDB').collection('addToCart');


    
    app.get('/brands', async(req, res) => {
      const cursor = brandsCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/brands', async(req, res) => {
      const addBrands = req.body;
      const result = await brandsCollections.insertOne(addBrands);
      res.send(result);
    })


    // lagbe // 
    app.post('/brandsCategory', async(req, res) => {
      const addProduct = req.body;
      const result = await brandsCategoryCollection.insertOne(addProduct);
      res.send(result);
    })

    // lagbe//


    // lagbe //
    app.get('/brandsCategory/:brandName', async(req, res) => {
      const brandName = req.params.brandName;
      const cursor = brandsCategoryCollection.find({brandName: brandName});
      const result = await cursor.toArray();
      res.send(result);

    })
    // lagbe //

    app.get('/product/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id) }
      const result = await brandsCategoryCollection.findOne(query);
      res.send(result);
    })


    
    app.put('/product/:id', async(req, res) => {
      const updateProduct = req.body;
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const options = { upsert: true };

      const newProduct = {
        $set: {
          image : updateProduct.image,
          name : updateProduct.name,
          rating : updateProduct.rating,
          brandName : updateProduct.brandName,
          type : updateProduct.type,
          price : updateProduct.price
        }
      }
      const result = await brandsCategoryCollection.updateOne(filter, newProduct, options)
      res.send(result);

    })


    
    app.post('/addToCart', async(req, res) => {

      const addToCart = req.body;
      
      const existingAdd = await addToCartCollection.findOne({ userEmail : addToCart.userEmail, 'products._id': addToCart.products._id, })

      if(existingAdd) {
        return res.send({
        message: "You have already added to cart",
        insertedId: null,
      });

      }

      const result = await addToCartCollection.insertOne(addToCart);
      res.send(result);
    })


    app.get('/addToCart', async(req, res) => {
      const cursor = addToCartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/addToCart/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await addToCartCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Automotive server is running');
})

app.listen(port, () => {
    console.log(`Automotive server is running on PORT ${port}`);
})