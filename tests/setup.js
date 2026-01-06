const mongoose = require("mongoose")

// how js will know -> link in a package.json 
/*
"jest" : {
    "testEnvironment" : "node",
    "setupFilesAfterEnv" : [
      "<rootDir>/tests/setup.js"
    ]
  },
*/
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to DB in JEST", process.env.MONGO_URI)
})

//once testing is finished, clean the DB and close the connection
afterAll(async () =>{
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log("DB deleted and connection closed")
})