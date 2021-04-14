const request = require('request');
const { mapbox: apiKey } = require('./keys');

const geocode = (query, callback) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${apiKey}`;
  request({
    url,
    json: true,
  }, (err, res) => {
    if (err) {
      callback('Unable to load MapBox API.', null);
    } else if (res.body.features.length === 0) {
      callback('MapBox is unable to find location.', null);
    } else {
      const [feature] = res.body.features;
      const { center } = feature;
      callback(null, {
        latitude: center[1],
        longitude: center[0],
        location: feature.place_name,
      });
    }
  });
};

module.exports = geocode;
