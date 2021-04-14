const request = require('request');
const { weatherStack: apiKey } = require('./keys');

const weather = (lat, long, callback) => {
  const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${lat},${long}&units=f`;
  request({
    url,
    json: true,
  }, (err, res) => {
    if (err) {
      callback('Unable to load WeatherStack API.', {});
    } else if (res.body.error) {
      callback('WeatherStack is unable to find location.', {});
    } else {
      const {
        current: {
          temperature,
          weather_descriptions: [weatherDescription],
          feelslike,
          wind_speed: windSpeed,
          precip,
          humidity,

        },
      } = res.body;
      callback(null, {
        temperature,
        weatherDescription,
        feelslike,
        windSpeed,
        precip,
        humidity,
        forecast: `${weatherDescription}. It is ${temperature} degrees outside${(temperature === feelslike) ? '' : ` but feels like ${feelslike}`}. There is a ${precip}% chance of precipitation.`,
      });
    }
  });
};

module.exports = weather;
