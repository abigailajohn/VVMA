const express = require('express');
const {specs, swaggerUi } = require('./swagger');
const routes = require('./src/routes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('<div style="text-align: center; font-size: 24px; font-weight: bold;">Welcome to the Very Vulnerable Management API!</div>');
});

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api-docs`);
});