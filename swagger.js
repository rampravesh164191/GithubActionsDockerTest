//this is a configuration file

const swaggerJsdoc = require('swagger-jsdoc');


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personalized Todo Application',
      version: '1.0.0',
      description : "API documentation for auth and protected CURD"
    },
    servers : [
        {url : "http://localhost:3000"}
    ],
    components : {
        securitySchemes :{
            bearerAuth:{
                type : "http",
                scheme : "bearer",
                bearerFormat : 'JWT'
            }
        }
    },
    security : [
        {bearerAuth : []}
    ]
  },
  apis: ['./routes/*.js','./app.js'],
}

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;

//call the swagger Ui express in app.js