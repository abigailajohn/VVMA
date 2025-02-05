// app.js
const express = require('express');
const {specs, swaggerUi } = require('./swagger');
const app = express();
const port = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('Hello, Swagger!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});