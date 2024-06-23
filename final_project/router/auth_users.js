const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
// Check if user is a vaild user
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
// check if user is authenticated
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Login if you are a registered user
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
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

// Task 8: Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.body.review;
    if (!review){
      res.send(`You have not provided any review`);
      return;
    }
    if (books[isbn]){
        books[isbn].reviews[username] = review;
        res.send(`The review of the book with ISBN: ${isbn} from user: ${username} has been published.`);
    } else {
        res.send(`There is no books with ISBN: ${isbn} were found in the database.`);
    }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (books[isbn].reviews[username]){
        delete books[isbn].reviews[username];
        res.send(`The review of the book with ISBN ${isbn} from user ${username} has been deleted.`);
    } else {
        res.send(`No reviews with ISBN ${isbn} from user ${username} were found in the database.`);
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
