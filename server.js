const express = require('express');
const app = express();

const cors = require('cors');

const {validate} = require('./validation.js');

const { connectDB } = require('./db.js');

const {ObjectId} = require("mongodb");

app.use(cors({
  origin:'http://localhost:7700'
}));

app.use(express.json());

let db;

app.use( (req,res,next) => {
  console.log(`request received: ${req.method},${req.url}`);
   next()
})

app.get('/api/businesses', (req,res) => {
  
  async function loadDB(){
    try{
    let storage = await db.collection('businesses').find({}).toArray();
  
    if (storage.length === 0){
      return res.status(200).json({message:"No businesses found"})
    }
    else{
      return res.status(200).json(storage)
      }
    } 
    catch(error){
      return res.status(500).json({message: 'Something went wrong'});
    }
  }
  loadDB();
})

app.post('/api/business', (req,res) => {
  const error = validate(req.body);
  
  if (error){
    return res.status(400).json({message:error})
  }
  
  else{
    let business = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      createdAt: new Date()
    }
    
    async function register(){
      try {
        let registered = await db.collection('businesses').insertOne(business);
        
        const saved = {
          _id: registered.insertedId, ...business
        }
        return res.status(201).json({message: "Business created successful", business:saved})
      }
      catch (error) {
        return res.status(500).json({message:"something went wrong"})
      }
    }
    register();
  }
})

app.get('/api/business/:id', (req,res) => {
  
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({message: "Invalid business ID"});
    }
    
   let businessId = new ObjectId(req.params.id);
   
   async function getOne(){
     try{
    const business = await db.collection('businesses').findOne({_id: businessId})
   
    if (!business){
     return res.status(404).json({message:"Business not found"})
    }
   
    else{
     return res.status(200).json(business)
      }
    }
    catch (error) {
      return res.status(500).json({message:"Something went wrong",error: error.message})
    }
   }
   getOne();
})

app.patch('/api/business/:id', (req,res) => {
  
  if (!ObjectId.isValid(req.params.id)){
    return res.status(400).json({messag:"Invalid business Id"})
  }
  
  let businessId = new ObjectId(req.params.id);
  
  async function update(){
    try{
    const error = validate(req.body);
    
    if (error){
      return res.status(400).json({message: error})
    }
  
    else{
      const {
      name,
      category,
      description,
      phone, 
      address, 
      city 
      } = req.body;
        
        const result = await db.collection('businesses'). updateOne({_id: businessId},{$set:{
         name,
         category,
         description, 
         phone, 
         address,
         city
        }
        })
        
        if (result.matchedCount ===0){
          return res.status(404).json({message: "No business found"})
        }
        
        return res.status(200).json({message:"Business Updated successful"})
        }
    }
    catch(error){
      return res.status(500).json({message:"Something went wrong", error:error.message})
    }
 }
 update();
})

app.delete('/api/business/:id', (req,res) => {
  
  if (!ObjectId.isValid(req.params.id)){
    return res.status(400).json({message:"Invalid business Id"})
  }
  
  const businessId = new ObjectId(req.params.id);
  
  async function deleteBusiness(){
  try{
  const result =await db.collection("businesses").deleteOne({_id: businessId})
  
  if (result.deletedCount === 0){
    return res.status(404).json({message: "Business doesn't exist"})
  }
  
  else{
    return res.status(200).json({message:"Business deleted successful"})
    }
  }
  catch(error){
    return res.status(500).json({message: "Something went wrong", error: error.message})
  }
 }
 deleteBusiness();
})

//////////////////////////

async function startServer(){
  try{
    db = await connectDB();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,() => {
      console.log(`Server is running on port: ${PORT}`)
    })
 }
 catch(error){
   console.error("failed to connect to db", error.message);
 }
};

startServer(); 