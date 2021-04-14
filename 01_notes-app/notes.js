const fs = require('fs');
const chalk = require('chalk');

const load = () => {
  try {
    const dataBuffer = fs.readFileSync('notes.json');
    const noteJSON = dataBuffer.toString();
    return JSON.parse(noteJSON);
  } catch (e) {
    return [];
  }
};

const save = (notes) => {
  const JSONstring = JSON.stringify(notes);
  fs.writeFileSync('notes.json', JSONstring);
};

const add = (title, body) => {
  const notes = load();
  const duplicate = notes.find((note) => note.title === title) || false;
  if (!duplicate) {
    notes.push({
      title,
      body,
    });
    save(notes);
    console.log(chalk.green.inverse('New note added!'));
  } else {
    console.log(chalk.red.inverse('Note title in use!'));
  }
};

const remove = (title) => {
  const notes = load();
  const notesToSave = notes.filter((note) => note.title !== title);
  if (notesToSave.length < notes.length) {
    save(notesToSave);
    console.log(chalk.green.inverse('Note removed!'));
  } else {
    console.log(chalk.red.inverse('No note found!'));
  }
};

const list = () => {
  const notes = load();
  console.log(chalk.inverse('Your notes:'));
  notes.forEach((note) => {
    console.log(note.title);
  });
};

const read = (title) => {
  const notes = load();
  const noteToPrint = notes.find((note) => note.title === title) || false;

  if (noteToPrint) {
    console.log(chalk.inverse(noteToPrint.title));
    console.log(noteToPrint.body);
  } else {
    console.log(chalk.red.inverse('No note found!'));
  }
};

module.exports = {
  add,
  remove,
  list,
  read,
};
