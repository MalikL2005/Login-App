import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from 'path'
import fileURLToPath from 'url'

//DB Link: https://cloud.mongodb.com/v2/66821979b1c025127e852e14#/metrics/replicaSet/66917f0aa266f14f1f54d0dd/explorer/sample_mflix/users/find
//Host Link: http://localhost:8000/

dotenv.config()
const MONGO_URI = process.env.MONGO_URI
const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//open server & db connection 
const PORT = process.env.PORT || 7000
mongoose.connect(MONGO_URI).then(()=>{
    console.log("Database connected successfully.")
    app.listen(PORT, ()=>{
        console.log(`running on Port: ${PORT}.`)
    })
}).catch((error) => {console.error(error)})
const db = mongoose.connection



app.get('/users', async(req, res)=>{
    const collection = db.collection('users')
    try{
        let data = await collection.find({}).toArray()
        res.send(data)
    }
    catch(err){
        res.status(500).json({message: err})
    }
})

app.get('/hello', (req, res)=> {
    res.send("Hello")
})

app.get('/getUsers', async (req, res)=>{
    const collection = db.collection('users')
    let searched_name = req.query.name
    let data = await collection.find({name:searched_name}).toArray()
    if (data.length){
        res.json(data)
    }
    else{res.send(`Could not find user with the name ${searched_name}.`)}

})


app.get('/', (req, res)=> {
    res.sendFile(__dirname + '/views/index.html');
})
