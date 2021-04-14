const mongoose = require('mongoose');

const { DB_CONNECTION_URL, DB_NAME } = process.env;

mongoose.connect(DB_CONNECTION_URL + DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
