const express = require('express');
require('./db/mongoose');

// routers
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

const app = express();

// without middleware:    new request        -->         run route handler
// with middleware:       new request -> do something -> run route handler

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);


module.exports = app;
