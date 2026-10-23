function validate(data){
  if (typeof data.name !=="string" || data.name.trim()==="") {
    return "Username is invalid"
}

else if (typeof data.category !=="string" || data.category.trim()==="") {
    return  "Category is invalid"
}

else if (typeof data.description !=="string" || data.description.trim()==="") {
    return "Description is invalid"
}

else if (typeof data.phone !=="string" || data.phone.trim()==="") {
    return "Phone number is invalid"
}

else if (typeof data.whatsapp !=="string" || data.whatsapp.trim()===""){
	return "Whatsapp number is invalid"
}

else if (typeof data.email !=="string" || !data.email.includes("@") || data.email.trim()===""){
	return "Email is invalid"
}

else if (typeof data.address !=="string" || data.address.trim()==="") {
    return "Address is invalid"
}

else if (typeof data.city !=="string" || data.city.trim()==="") {
   return "city is invalid"
}

 return null
}

module.exports = {validate};
