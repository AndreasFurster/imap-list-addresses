// Load packages
const Imap = require('imap');
const inspect = require('util').inspect;
const readline = require('readline');

// Configure
require('dotenv').config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Global variables
var imapBoxes = [];
var imapBoxesCounter = 0;

// Create (disconnected) imap box
var imap = new Imap({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  tls: process.env.TLS
});

// Define functions

// Get all boxes and list them
function listBoxes(callback) {
  imap.getBoxes(function(err, boxes) {
    listBoxesRecursive(boxes, 0, "");
    callback();
  })
}

// Recursive function to list boxes with children
function listBoxesRecursive(boxes, level, path) {
  for(var key in boxes) {
    if (!boxes.hasOwnProperty(key)) continue;

    var spacer = new Array(level + 1).join('-');
    console.log(`${++imapBoxesCounter} ${spacer} ${key}`);
    imapBoxes[imapBoxesCounter] = path + key;

    if (boxes[key].children) {
      listBoxesRecursive(boxes[key].children, level + 1, path + key + "//")
    }
  };
}

// List all emails in a box
function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

// Stuff todo when the imap box is opened
imap.once('ready', function() {
  listBoxes(function(){
    rl.question('Which box do you want to explore? ', (answer) => {
      if(!imapBoxes[answer]) {
        console.log('Wrong option!')
        return;
      }

      var box = imapBoxes[answer];
      console.log('Exploring: ' + box)

      // TODO: Explor the box...

      rl.close();
    });
  });
});

// Show errors
imap.once('error', function(err) {
  console.log(err);
});

// Show disconnect
imap.once('end', function() {
  console.log('Connection ended');
});

// Start connecting and trigger the whole application
imap.connect();