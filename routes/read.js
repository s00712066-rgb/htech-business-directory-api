const express = require('express');

const router = express.Router();

const {ObjectId} = require("mongodb");

router.get('/api/businesses', async (req,res) => {
  
    try{
    const db = req.app.locals.db;
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
      console.error(error);
    }
});

router.get('/api/business/:id', async (req,res) => {
  
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({message: "Invalid business ID"});
    }
    
   let businessId = new ObjectId(req.params.id);
   
     try{
    const db = req.app.locals.db;
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
});

module.exports = router;


