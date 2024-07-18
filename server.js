const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require('path')
const {fileURLToPath} = require('url')
const bodyParser = require('body-parser');


//DB Link: https://cloud.mongodb.com/v2/66821979b1c025127e852e14#/metrics/replicaSet/66917f0aa266f14f1f54d0dd/explorer/sample_mflix/users/find
//Host Link: http://localhost:8000/

dotenv.config()
const MONGO_URI = process.env.MONGO_URI
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//open server & db connection 
const PORT = process.env.PORT || 7000
mongoose.connect(MONGO_URI).then(()=>{
    console.log("Database connected successfully.")
    app.listen(PORT, ()=>{
        console.log(`running on Port: ${PORT}.`)
    })
}).catch((error) => {console.error(error)})
const db = mongoose.connection
const collection = db.collection('users')





app.get('/', (req, res)=> {
    res.sendFile(__dirname + '/views/index.html');
})

app.get('/users', async(req, res)=>{
    try{
        let data = await collection.find({}).toArray()
        res.send(data)
    }
    catch(err){ res.status(500).json({message: err})}
})


app.get('/getUsers', async (req, res)=>{
    let searched_name = req.query.name
    let data = await collection.find({name:searched_name}).toArray()
    if (data.length){ res.json(data)}
    else{ res.send(`Could not find user with the name ${searched_name}.`)}
})

app.post('/add_user', async (req, res)=>{
    let user_mail_exists = await collection.findOne({email: req.body.new_email})
    if (user_mail_exists){
        res.send(`<h1>Email already exists</h1><a href="/sign_in">Go to Sign in form</a>`)
        return
    }
    if(req.body.new_name && req.body.new_email && req.body.new_pw){
        var add_user = collection.insertOne({"name": req.body.new_name, "email": req.body.new_email, "password": req.body.new_pw})
        res.send("You have successfully created an account.")
    } else{ res.send("Please fill out every field.")}
})


app.post('/remove_user', (req, res)=>{
    console.log(req.body.remove_user_name)
    try{
        collection.deleteOne({'name': req.body.remove_user_name})
        res.send(`User ${req.body.remove_user_name} has been removed`)
    } catch(e){
        res.send("Something went wrong " + e)
    }
})

app.get('/sign_in', (req, res)=>{
    res.sendFile(__dirname + '/views/sign_in.html')
})

app.get('/signing_in', async (req, res)=>{
    user = await collection.findOne({name: req.query.user_name, email: req.query.user_email, password: req.query.user_pw}, (err, result)=>{
        if(!err){
            if(result){
                res.send("You have signed in.")
            } else{
                res.send("Password didn't match username/email.")
            }
        }
        else{
            res.send("MongoDB error")
        }
    })
})

