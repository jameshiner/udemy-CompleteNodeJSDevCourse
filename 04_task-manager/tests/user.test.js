const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

const testUserOneID = new mongoose.Types.ObjectId();
const testUserOne = {
  _id: testUserOneID,
  name: 'Mike',
  email: 'mike@example.xyz',
  password: '56What!!',
  tokens: [{
    token: jwt.sign({ _id: testUserOneID }, process.env.JWT_SECRET),
  }],
};

beforeEach(async () => {
  await User.deleteMany();
  try {
    await new User(testUserOne).save();
  } catch (e) {
    console.log(e);
  }
});

test('Should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'James',
    email: 'james@example.xyz',
    password: 'MyPass777!',
  }).expect(201);

  // assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'James',
      email: 'james@example.xyz',
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe('MyPass777!');
});

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: testUserOne.email,
    password: testUserOne.password,
  }).expect(200);

  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non existant user', async () => {
  await request(app).post('/users/login').send({
    email: testUserOne.email,
    password: 'asd',
  }).expect(400);
});

test('Should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('Should delete user account', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(testUserOneID);
  expect(user).toBeNull();
});

test('Should not delete account while unauthenticated', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(testUserOneID);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({
      name: 'Jess',
    })
    .expect(200);

  const user = await User.findById(testUserOneID);
  expect(user.name).toEqual('Jess');
});
