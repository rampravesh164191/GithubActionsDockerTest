const env = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: env === "test" ? ".env.testing" : ".env"
});

const cors  = require("cors")
const express = require("express");
const connectToDB = require("./config/db");
const UserRouter = require("./routes/user.routes");
const TodoRouter = require("./routes/todo.routes");
const app = express();
const PORT = process.env.PORT || 3000;
connectToDB();
app.use(cors()); //cors middleware
//body parser middleware 
app.use(express.json());

//for swagger js-doc
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require("./swagger")
//swagger api route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));  //next npm run server (remember we have changed command in package.json)
//open local host link in the browser to see the swagger UI

//swagger : write this for every routes
//indentation is very important
//next check the user routes as well
/**
 * @openapi
 * /test:
 *   get:
 *     tags: [Test]
 *     description: This is test route
 *     responses:
 *       200:
 *         description: This is test route
 *       500:
 *         description: Something went wrong
 */

//doing testing
console.log("Node_Env", process.env.NODE_ENV)
console.log("MONGO PATH", process.env.MONGO_URI)
//test route
app.get("/test", (req,res)=>{
    res.status(200).json({msg : "this is a test route"})
    res.status(500).json({msg : "Something went wrong"})
})

app.get("/login",(req,res)=>{
    res.send("please login again...")
})

//handling user routes
app.use("/users", UserRouter);

//handling todo routes
app.use("/todos", TodoRouter);

//handling wrong routes
app.use((req, res)=>{
    res.json({msg : "wrong route bro"})
})

//starting a server
app.listen(PORT, ()=>{
    console.log("Server connecting to port", PORT);
})

//for testing - comment the app.listen
//we are not starting a sever we are testing a function
//jest and supertest won't work if app.listen is on
module.exports = app;