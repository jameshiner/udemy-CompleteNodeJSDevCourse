const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    author: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const {
    completed, limit, skip, sortBy,
  } = req.query;
  const match = {};
  const sort = {};

  if (completed) {
    match.completed = completed === 'true';
  }
  if (sortBy) {
    const [property, order] = sortBy.split(':');
    sort[property] = order === 'desc' ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({ author: req.user._id });
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10),
        sort,
      },
    }).execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

// included for testing purposes, there shouldnt be a way to return all tasks
router.get('/tasks/all', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, author: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    return res.send(task);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const { body } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((prop) => allowedUpdates.includes(prop));

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Update!' });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, author: req.user._id });
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();

    if (!task) {
      return res.status(404).send();
    }

    return res.send(task);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, author: req.user._id });

    if (!task) {
      return res.status(404).send();
    }
    return res.send(task);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

module.exports = router;
