const generateLocation = (username, latitude, longitude) => ({
  username,
  locationUrl: `https://google.com/maps?q=${latitude},${longitude}`,
  createdAt: new Date().getTime(),
});

module.exports = { generateLocation };
