const express = require('express');
require('./db/mongoose');

// routers
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

const { PORT } = process.env;
const app = express();

// without middleware:    new request        -->         run route handler
// with middleware:       new request -> do something -> run route handler

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
