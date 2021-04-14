const path = require('path');
const express = require('express');
const hbs = require('hbs');
const geocode = require('./utils/geocode');
const weather = require('./utils/weather');

const PORT = 3000;

const app = express();
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');


// set handlebards as the view engine
app.set('view engine', 'hbs');
// views path defaults to '/views', use this to change
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// setup static directory to server
app.use(express.static(publicDirectoryPath));

app.get('', (req, res) => {
  res.render('index', {
    title: 'Weather App',
    name: 'jj',
  });
});

app.get('/weather', (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.send({
      error: 'You must provide a location.',
    });
  }

  return geocode(location, (geocodeError, { latitude, longitude, locationDesc }) => {
    if (geocodeError) {
      return res.send({
        error: geocodeError,
      });
    }

    return weather(latitude, longitude, (weatherError, weatherData) => {
      const weatherResponse = weatherData;
      if (weatherError) {
        return res.send({
          error: weatherError,
        });
      }
      weatherResponse.location = locationDesc;
      return res.send(weatherResponse);
    });

    // res.send(geoData);
  });

  // return res.send({
  //   location: location,
  // });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Me',
    name: 'jj',
  });
});

app.get('/help', (req, res) => {
  res.render('help', {
    title: 'Help',
    msg: 'this is the help message',
    name: 'jj',
  });
});

app.get('/help/*', (req, res) => {
  res.render('404', {
    title: 'Error 404',
    msg: 'Help article not found',
    name: 'jj',
  });
});

app.get('*', (req, res) => {
  res.render('404', {
    title: 'Error 404',
    msg: 'Page not found',
    name: 'jj',
  });
});

app.listen(PORT || 3000, () => {
  console.log(`Server is up on ${PORT || 3000}`);
});
