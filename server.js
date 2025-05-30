const express = require('express');
const sequelize = require('./config/database');
const routes = require('./routes');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { initModels } = require('./models/initModels');
const checkPembayaran = require("./jobs/checkPembayaran");

initModels();
setInterval(checkPembayaran, 1000);
const PenitipanScheduler = require('./utils/penitipanScheduler');
PenitipanScheduler.init();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/api', routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}).catch(err => console.log('Error:', err));
