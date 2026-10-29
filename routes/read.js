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

router.get("/api/recents", async (req,res) => {
	try{
		const db = req.app.locals.db;

		const results = await db.collection("businesses").find({})
		.sort({createdAt: -1})
		.limit(6)
		.toArray();

		return res.status(200).json({
			count: results.length,
			businesses: results
		});
	 }
	 catch(error){
	 	console.error("failed to fetch recents", error.message);
	 	return res.status(500).json({message:"Something went erong"});
	 } 
	
});

router.get("/api/search", async (req, res) => {
  // Get search text 'q', page number, and limit from URL query. e.g. /api/search?q=laptop&page=1&limit=20
  const { q, page = 1, limit = 20 } = req.query;

  // If no search query provided, return empty array immediately
  if (!q || q.trim() === "") {
    return res.json({ message: "Please enter a search term", results: [] });
  }

  // List of useless words we want to ignore in search
  const stopWords = ["where","can","i","buy","find","need","want","in","the","a","an","is","are","for","to","me","my","get","of","at","near","here","there"];

  // Function to escape special regex characters so search doesn't crash
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Convert query to lowercase, split into words, clean symbols, remove stop words and short words
  const keywords = q.toLowerCase()
    .split(/\s+/) // split by spaces into array of words
    .map(w => w.replace(/[^a-z0-9]/g, "")) // remove symbols like ? , . etc
    .filter(word => !stopWords.includes(word) && word.length > 1); // keep only meaningful words

  // If after filtering no keywords remain, return empty
  if (keywords.length === 0) {
    return res.json({ message: "No business found", results: [] });
  }

  // Build MongoDB search conditions for each keyword
  const regexConditions = keywords.map(word => {
    const regex = new RegExp(escapeRegex(word), "i"); // create case-insensitive regex for the word
    return {
      $or: [ // check if word exists in any of these fields
        { name: regex }, // check in business name - e.g. "Jide Laptop Store"
        { category: regex }, // check in category - e.g. "Electronics"
        { description: regex }, // check in description - e.g. "we sell laptops"
        { address: regex } // check in address - e.g. "Lugbe"
      ]
    };
  });

  try {
    // Get database from app.locals
    const db = req.app.locals.db;

    // Convert page and limit to numbers for math
    const pageNum = parseInt(page); // e.g. "1" -> 1
    const limitNum = parseInt(limit); // e.g. "20" -> 20
    const skip = (pageNum - 1) * limitNum; // calculate how many docs to skip. Page 2 = skip first 20

    // Find businesses matching ANY keyword
    const results = await db.collection("businesses").find({
      $or: regexConditions // $or means match at least one keyword
    }).toArray(); // convert cursor to array

    // Score each business based on where keyword appears
    const scored = results.map(biz => {
      let score = 0; // start score at 0
      const name = (biz.name || "").toLowerCase(); // get business name or empty string, make lowercase
      const category = (biz.category || "").toLowerCase(); // get category
      const address = (biz.address || "").toLowerCase(); // get address
      const description = (biz.description || "").toLowerCase(); // get description

      // For each keyword, add points based on field importance
      keywords.forEach(k => {
        if (category.includes(k)) score += 3; // category match is most important
        if (name.includes(k)) score += 2; // business name match is second - e.g. name contains "laptop"
        if (address.includes(k)) score += 2; // address match important for location like lugbe
        if (description.includes(k)) score += 1; // description match is least
      });
      return { ...biz, _score: score }; // return business with new _score field
    })
    .filter(b => b._score > 0) // remove businesses with zero score
    .sort((a,b) => b._score - a._score); // sort highest score first

    // If no business matches at all, return "No business found"
    if (scored.length === 0) {
      return res.json({
        message: "No business found",
        results: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false
      });
    }

    // Count total matching results before pagination
    const total = scored.length;

    // Slice results for pagination - only return the page requested
    const paginated = scored.slice(skip, skip + limitNum);

    // Send back paginated results with pagination info
    res.json({
      message: "Businesses found", // success message
      results: paginated, // the 20 businesses for this page
      total: total, // total number found e.g. 87
      page: pageNum, // current page e.g. 1
      totalPages: Math.ceil(total / limitNum), // total pages e.g. 5 pages if 87/20
      hasMore: skip + limitNum < total // true if more pages exist
    });

  } catch (err) {
    // Log error to server console
    console.error(err);
    // Return error to frontend
    res.status(500).json({ message: "Search failed", results: [] });
  }
});

module.exports = router;


