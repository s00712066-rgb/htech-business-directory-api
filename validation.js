function validate(data){
  if (!data.name || data.name.trim()==="") {
    return "Username is invalid"
}

else if (!data.category || data.category.trim()==="") {
    return  "Category is invalid"
}

else if (!data.description || data.description.trim()==="") {
    return "Description is invalid"
}

else if (!data.phone || data.phone.trim()==="") {
    return "Phone number is invalid"
}

else if (!data.address || data.address.trim()==="") {
    return "Address is invalid"
}

else if (!data.city || data.city.trim()==="") {
   return "city is invalid"
}

 return null
}

module.exports = {validate};