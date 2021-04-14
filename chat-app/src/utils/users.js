const users = [];


const addUser = ({ id, username, room }) => {
  // clean data
  const cleanUsername = username.trim().toLowerCase();
  const cleanRoom = room.trim().toLowerCase();

  // validate data
  if (!cleanUsername || !cleanRoom) {
    return {
      error: 'Username and room are required!',
    };
  }

  // check for existing users
  const userExists = users.find((user) => user.room === cleanRoom
  && user.username === cleanUsername);

  // validate username
  if (userExists) {
    return {
      error: 'This username is in use!',
    };
  }

  // store user
  const user = {
    id, username: cleanUsername, room: cleanRoom,
  };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  return index > -1 ? users.splice(index, 1)[0] : {
    error: 'User not found!',
  };
};

const getUser = (id) => users.find((user) => user.id === id);
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
