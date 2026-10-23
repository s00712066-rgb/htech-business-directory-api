const express = require('express');

const app = express();

require("dotenv").config();

const cors = require('cors');

const session = require("express-session");

const bcrypt = require("bcryptjs");

const { connectDB } = require('./db.js');

const createRoute = require('./routes/create.js');

const readRoute = require('./routes/read.js');

const updateRoute = require("./routes/update.js");

const deleteRoute = require('./routes/delete.js');

app.use(cors({
  origin:'http://localhost:7700'
}));

app.use(express.json());

app.use(session({
	secret:process.env.SESSION_SECRET,
	resave:false,
	saveUninitialized:false,
	cookie:{
		httpOnly:true,
		secure:false,
		sameSite:"lax",
		maxAge:1000*60*60
	}
}));

app.use( (req,res,next) => {
  console.log(`request received: ${req.method},${req.url}`);
   next()
});

app.post("/api/auth", async (req,res) => {
	const {username, password} = req.body;

	if (typeof username !=="string" || username.trim()===""){
		return res.status(400).json({message:"Username is invalid"});
	}

	else if (typeof password !=="string" || password.trim()===""){
		return res.status(400).json({message:"Password is invalid"});
	}

	else if (username !== process.env.ADMIN_NAME){
		return res.status(401).json({message:"invalid username or password"});
	}

	try{
		const isMatched = await bcrypt.compare(password,process.env.PASSWORD_HASH)
		if (!isMatched){
			return res.status(401).json({message:"invalid username or password"});
		}

		await new Promise( (resolve,reject)=>{
			req.session.regenerate((error)=>{
				if (error){
					return reject (error);
				}
				resolve();
			});
		});

		req.session.isAdmin = true;

		await new Promise( (resolve,reject)=>{
			req.session.save( (error)=>{
				if (error){
					return reject(error);
				}

				resolve();
			});
		});

		return res.status(200).json({message:"Login successful"});
	}
	catch(error){
		console.error("error",error);
		return res.status(500).json({message:"Something went wrong"});
	}
});

app.post("/api/logout", (req,res) => {
	req.session.destroy( (err) => {
		if (err){
			return res.status(500).json({message:"Logout Failed"});
			console.err(err);
		}
		res.clearCookie("connect.sid");
		return res.status(200).json({message:"Logged out"});
	});
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
