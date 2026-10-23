const express = require('express');
const router = express.Router();

const {validate} = require('../validation.js');
  
 router.post('/api/business', async (req,res) => {
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
    
      try {
          const db = req.app.locals.db;
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
});

module.exports = router;

