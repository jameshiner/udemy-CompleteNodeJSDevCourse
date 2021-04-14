const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Anonymous',
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid!');
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number!');
      }
    },
  },
  password: {
    type: String,
    minLength: 7,
    required: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password can not contain \'password\'');
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  avatar: {
    type: Buffer,
  },
}, {
  // adds createdAt and updatedAt properties to documents
  timestamps: true,
});

// doesnt actually change what is stored on a user document
// just a way for mongoose to figure out how these two are related
userSchema.virtual('tasks', {
  // name of a related schema
  ref: 'Task',
  // name of field in this schema that relates to the other schema
  localField: '_id',
  // name of field in the other schema that relates that in this schema
  foreignField: 'author',
});

userSchema.methods.generateAuthToken = async function generateAuthToken() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// override toJSON to alter what gets sent back when sending
userSchema.methods.toJSON = function getPublicProfile() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login.');
  }

  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login.');
  }

  return user;
};

// delete a users tasks when user is deleted
userSchema.pre('remove', async function onBeforeUserDelete(next) {
  const user = this;

  await Task.deleteMany({ author: user._id });
  next();
});


// hash the plain text password before saving
userSchema.pre('save', async function hashPw(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
