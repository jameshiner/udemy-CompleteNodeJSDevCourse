const generateMessage = (username, message) => ({
  username,
  message,
  createdAt: new Date().getTime(),
});

module.exports = { generateMessage };
