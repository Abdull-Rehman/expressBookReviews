const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if(!username) return false;
  return !users.some(u => u.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }
  if(!authenticatedUser(username, password)){
    return res.status(401).json({message: "Invalid username or password"});
  }
  const token = jwt.sign({username: username}, 'access', {expiresIn: 60*60});
  req.session.authorization = {
    accessToken: token,
    username: username
  };
  return res.status(200).json({message: "User successfully logged in", token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session && req.session.authorization && req.session.authorization.username;
  if(!username){
    return res.status(401).json({message: "User not logged in"});
  }
  const isbn = req.params.isbn;
  const review = req.query.review;
  if(!review){
    return res.status(400).json({message: "Review text is required as query parameter 'review'"});
  }
  const book = books[isbn];
  if(!book){
    return res.status(404).json({message: "Book not found"});
  }
  // add or modify review for this user
  if(!book.reviews) book.reviews = {};
  book.reviews[username] = review;
  return res.status(200).json({message: "Review added/updated successfully", reviews: book.reviews});
});

// Delete a book review by logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session && req.session.authorization && req.session.authorization.username;
  if(!username){
    return res.status(401).json({message: "User not logged in"});
  }
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(!book || !book.reviews){
    return res.status(404).json({message: "Book or reviews not found"});
  }
  if(!book.reviews[username]){
    return res.status(404).json({message: "No review by this user found"});
  }
  delete book.reviews[username];
  return res.status(200).json({message: "Review deleted successfully", reviews: book.reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
