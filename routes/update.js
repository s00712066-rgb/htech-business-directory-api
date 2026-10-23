const express = require('express');

const router = express.Router();

const {ObjectId} = require('mongodb');

const {validate} = require("../validation.js");

router.patch('/api/business/:id', async (req,res) => {
  
  if (!ObjectId.isValid(req.params.id)){
    return res.status(400).json({messag:"Invalid business Id"})
  }
  
  let businessId = new ObjectId(req.params.id);
  
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
        
        const db = req.app.locals.db
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
});

module.exports = router;