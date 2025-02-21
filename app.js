const express = require('express');
const {specs, swaggerUi } = require('./swagger');
const routes = require('./src/routes');
const groupRoutes = require('./src/routes/group');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('Hello, Swagger!');
});

app.use('/api', routes);
app.use('/api/groups', groupRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api-docs`);
});
