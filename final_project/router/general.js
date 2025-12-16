const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }
  const userExists = users.some(u => u.username === username);
  if(userExists){
    return res.status(409).json({message: "User already exists"});
  }
  users.push({username, password});
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book){
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const results = {};
  Object.keys(books).forEach(isbn => {
    if(books[isbn].author === author){
      results[isbn] = books[isbn];
    }
  });
  if(Object.keys(results).length === 0){
    return res.status(404).json({message: "No books found for this author"});
  }
  return res.status(200).send(JSON.stringify(results, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const results = {};
  Object.keys(books).forEach(isbn => {
    if(books[isbn].title === title){
      results[isbn] = books[isbn];
    }
  });
  if(Object.keys(results).length === 0){
    return res.status(404).json({message: "No books found for this title"});
  }
  return res.status(200).send(JSON.stringify(results, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(!book){
    return res.status(404).json({message: "Book not found"});
  }
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

// Task 10: Get all books using async-await
public_users.get('/books', async function (req, res) {
  try {
    // Simulating async operation with Promise
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    
    const bookList = await getBooks;
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn-async/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  // Using Promise to get book details
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({message: "Book not found"});
    }
  });

  getBookByISBN
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json(error));
});

// Task 12: Get book details based on Author using async-await
public_users.get('/author-async/:author', async function (req, res) {
  try {
    const author = req.params.author;
    
    // Using async-await with Promise
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const results = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].author === author) {
          results[isbn] = books[isbn];
        }
      });
      
      if (Object.keys(results).length === 0) {
        reject({message: "No books found for this author"});
      } else {
        resolve(results);
      }
    });

    const booksByAuthor = await getBooksByAuthor;
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json(error);
  }
});

// Task 13: Get book details based on Title using async-await
public_users.get('/title-async/:title', async function (req, res) {
  try {
    const title = req.params.title;
    
    // Using async-await with Promise
    const getBooksByTitle = new Promise((resolve, reject) => {
      const results = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].title === title) {
          results[isbn] = books[isbn];
        }
      });
      
      if (Object.keys(results).length === 0) {
        reject({message: "No books found for this title"});
      } else {
        resolve(results);
      }
    });

    const booksByTitle = await getBooksByTitle;
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json(error);
  }
});

module.exports.general = public_users;
