const mongoose = require("mongoose");
const todoSchema = new mongoose.Schema(
    {
        title : {type : String, required :true},
        status : {type : Boolean, default : false},
        //this userId to be added behind the scenes through auth middleware
        userId : {type : mongoose.Schema.Types.ObjectId, ref :  "User"}
    }
)

const TodoModel = mongoose.model("Todos",todoSchema);
module.exports = TodoModel;