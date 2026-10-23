const express = require('express');

const app = express();

const cors = require('cors');

const { connectDB } = require('./db.js');

const createRoute = require('./routes/create.js');

const readRoute = require('./routes/read.js');

const updateRoute = require("./routes/update.js");

const deleteRoute = require('./routes/delete.js');

app.use(cors({
  origin:'http://localhost:7700'
}));

app.use(express.json());

app.use( (req,res,next) => {
  console.log(`request received: ${req.method},${req.url}`);
   next()
});

async function startServer(){
  try{
    let db = await connectDB();
    
    app.locals.db = db;
    
    app.use(createRoute);
    app.use(readRoute);
    app.use(updateRoute);
    app.use(deleteRoute);
    
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