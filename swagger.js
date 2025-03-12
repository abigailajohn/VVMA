// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VVMA',
      version: '1.0.0',
      description: 'Very Vulnerable Management API (VVMA) is an intentionally vulnerable RESTful API for educational and testing purposes',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },

  apis: ['./src/routes/v1/*.js', './src/routes/v2/*.js', './src/controllers/v1/*.js', './src/controllers/v2/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};