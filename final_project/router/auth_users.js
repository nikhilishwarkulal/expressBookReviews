const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Login if you are a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).json({ message: "Error while trying to login, please try again." });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User logged in successfully");
  } else {
    return res.status(208).json({ message: "Your user name or password doesnt match, please try again." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Please provide a review." });
  }
  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    res.send(`The review of the book with ISBN: ${isbn} for user: ${username} is published.`);
  } else {
    return res.status(404).json({ message: `There is no books with ISBN: ${isbn} is found in the database.` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;
  // Check if username or ISBN is missing
  if (!username || !isbn) {
    return res.status(400).json({ message: "Please provide ISBN and ensure you are logged in." });
  }
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    res.send(`The review of the book with ISBN: ${isbn} for user: ${username} is deleted.`);
  } else {
    return res.status(404).json({ message: `No reviews found for ISBN: ${isbn} by user: ${username}.` });
  }
});

//// - validation code
// Check if user is a vaild user
const isValid = (username) => {
  return users.some(user => user.username === username);
}
// check if user is authenticated
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
