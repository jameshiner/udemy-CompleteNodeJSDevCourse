const geocode = require('./utils/geocode.js');
const weather = require('./utils/weather.js');


const argument = process.argv[2];

if (!argument) {
  console.log('Please provide a location.');
} else {
  geocode(argument, (err, mapRes) => {
    if (err) {
      console.log(err);
      return false;
    }
    return weather(mapRes.latitude, mapRes.latitude, (weatherErr, weatherRes) => {
      if (weatherErr) {
        console.log(weatherErr);
        return false;
      }
      const {
        weatherDescription,
        temperature,
        feelslike,
        precip,
      } = weatherRes;
      console.log(mapRes.location);
      console.log(`${weatherDescription}. It is ${temperature} degrees outside${(temperature === feelslike) ? '' : ` but feels like ${feelslike}`}. There is a ${precip}% chance of precipitation.`);
      return true;
    });
  });
}
