const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      // add user in local db or now store it in memory.
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User registered successfully, you can login now..." });
    } else {
      return res.status(404).json({ message: "User already exists, please add a different account or login instead." });
    }
  }
  return res.status(404).json({ message: "A error ocurred when trying to register user, please try again." });
});

// Function to get the books using Promise.
function getBooksPromise(booksFromDb) {
  return booksFromDb ? Promise.resolve(booksFromDb) : Promise.reject("There are no books in the database");
}


// Get the list of books available in the shop by async/await
public_users.get('/', async function (req, res) {
  let bookList = await getBooksPromise(books);
  res.send(bookList);
});

//Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getBooksPromise(books[isbn])
    .then(
      result => res.send(result),
      error => res.send(error)
    )
});


//Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  let bookList = await getBooksPromise(books);
  let book = Object.values(bookList).filter(book => book.author.toLowerCase() === author.toLowerCase());

  res.send(book);
});

// Get book details based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  let bookList = await getBooksPromise(books);
  const book = Object.values(bookList).filter(book => book.title.toLowerCase() === title.toLowerCase());
  res.send(book);
});

//  Task 5: Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  let bookList = await getBooksPromise(books);
  /// this will get the list of review for the isbn sent in the request
  res.send(bookList[isbn].reviews)
});

module.exports.general = public_users;
