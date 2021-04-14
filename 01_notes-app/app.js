const yargs = require('yargs');
const notes = require('./notes.js');

yargs.version('1.1.0');
yargs.command('add', 'Add a new note',
  {
    title: {
      describe: 'Note Title',
      alias: 't',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'Note Body',
      alias: 'b',
      demandOption: true,
      type: 'string',
    },
  },
  ({ title, body }) => {
    notes.add(title, body);
    // console.log(`Title: ${argv.title}\nBody: ${argv.body}`);
  });
yargs.command('remove', 'Remove a note',
  {
    title: {
      describe: 'Note Title',
      alias: 't',
      demandOption: true,
      type: 'string',
    },
  },
  ({ title }) => {
    notes.remove(title);
  });
yargs.command('list', 'List the notes',
  () => {
    notes.list();
  });
yargs.command('read', 'Read a note',
  {
    title: {
      describe: 'Note Title',
      alias: 't',
      demandOption: true,
      type: 'string',
    },
  },
  ({ title }) => {
    notes.read(title);
  });

yargs.parse();

// console.log(yargs);
