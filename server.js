const express = require('express');
const sequelize = require('./config/database');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}).catch(err => console.log('Error:', err));