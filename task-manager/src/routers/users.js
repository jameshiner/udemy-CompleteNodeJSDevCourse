const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/User');
const auth = require('../middleware/auth');

const router = new express.Router();


router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// included for testing purposes, there shouldnt be a way to return all users
router.get('/users/all', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  const { body, user } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((prop) => allowedUpdates.includes(prop));

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Update!' });
  }

  try {
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    return res.send(user);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    return res.send(req.user);
  } catch (e) {
    return res.status(400).send(e);
  }
});

const upload = multer({
  // if there is no dest property, multer passes the file received through to the function
  // dest: 'avatars',
  limits: {
    // fileSize limit in bytes, 1MB = 1,000,000 bytes
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpe?g|png)$/)) {
      return cb(new Error('File must be an image (.jpg, .jpeg, .png).'));
    }

    return cb(undefined, true);
  },
});

// the parameter to single() needs to be the key of formdata param being sent through
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  // 'buffer' only accessible in the handler if there is no 'dest' set up in multer options
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => { // definition must have all 4 args so express knows its for errors
  res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/me/avatar', async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      return new Error();
    }
    res.set('Content-Type', 'image/png');
    return res.send(user.avatar);
  } catch (e) {
    return res.status(404).send();
  }
});

module.exports = router;
