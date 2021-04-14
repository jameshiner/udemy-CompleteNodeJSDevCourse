/* eslint-disable no-undef */
const socket = io();

// server (emit) --> client (receive) --acknowledgement--> server
// client (emit) --> server (receive) --acknowledgement--> client

// elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const {
  username: queryUsername,
  room: queryRoom,
} = Qs.parse(this.location.search, { ignoreQueryPrefix: true });


const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom, 10);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // get visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // were we scrolled to the bottom before the new message was added
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};


socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.message,
    createdAt: moment(message.createdAt).format('h:mm A'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (locationMessage) => {
  const html = Mustache.render(locationTemplate, {
    username: locationMessage.username,
    locationUrl: locationMessage.locationUrl,
    createdAt: moment(locationMessage.createdAt).format('h:mm A'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  const message = $messageFormInput.value;

  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  console.log('aaaaa');
  console.log(message);

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled', 'disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    return console.log('Message delivered!');
  });
});

$sendLocationButton.addEventListener('click', () => {
  const { geolocation } = navigator;

  $messageFormButton.setAttribute('disabled', 'disabled');

  if (!geolocation) {
    return console.log('Geolocation is not supported by this browser.');
  }

  return geolocation.getCurrentPosition((position) => {
    const { coords: { latitude, longitude } } = position;
    socket.emit('sendLocation', { latitude, longitude }, (error) => {
      $messageFormButton.removeAttribute('disabled', 'disabled');
      if (error) {
        return console.log(error);
      }
      return console.log('Location shared.');
    });
  });
});

socket.emit('join', { username: queryUsername, room: queryRoom }, (error) => {
  if (error) {
    console.log(error);
    this.location.href = '/';
  }
});
