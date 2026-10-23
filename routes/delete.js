const express = require('express');

const router = express.Router();

const {ObjectId} = require("mongodb");

const requireAdmin = require("../middleware/auth.js");

router.delete('/api/business/:id', requireAdmin, async (req,res) => {
  
  if (!ObjectId.isValid(req.params.id)){
    return res.status(400).json({message:"Invalid business Id"})
  }
  
  const businessId = new ObjectId(req.params.id);
  
  try{
  const db = req.app.locals.db;
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
});

module.exports = router; 
