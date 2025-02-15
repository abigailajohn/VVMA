// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description: 'A simple User Management API with Swagger documentation',
    },
  },

  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to both routes and controllers
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};