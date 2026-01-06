const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
        userName : String,
        email : {type : String, unique : true},
        password : {type : String},
        role : {type : String, enum : ["admin", "user"], default : "user"},
        //githubUserId
        profileId : Number
    }
)

const UserModel = mongoose.model("User",UserSchema);
module.exports = UserModel;