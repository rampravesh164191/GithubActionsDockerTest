const mongoose = require("mongoose");
const connectToDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI); 
        console.log("connected to DB",process.env.MONGO_URI) 
    }catch(err){
        console.log("failed connecting to DB", err);
    }
}

module.exports = connectToDB;