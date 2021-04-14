const weatherForm = this.document.querySelector('form');
const search = this.document.querySelector('input');
const messageOne = this.document.querySelector('#message-one');
const messageTwo = this.document.querySelector('#message-two');

weatherForm.addEventListener('submit', (e) => {
  const searchLocation = search.value;

  e.preventDefault();
  messageOne.textContent = 'Loading...';
  messageTwo.textContent = '';

  if (searchLocation) {
    this.fetch(`http://localhost:3000/weather?location=${searchLocation}`).then((res) => {
      console.log(res);
      res.json().then(({ error, location, forecast }) => {
        console.log(error);
        console.log(location);
        console.log(forecast);
        if (error) {
          console.log();
          messageOne.textContent = error;
        } else {
          messageOne.textContent = location;
          messageTwo.textContent = forecast;
        }
      });
    });
  }
});
