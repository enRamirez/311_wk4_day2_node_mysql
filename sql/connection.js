require('dotenv').config();

const mysql = require('mysql')

//define the connection
let connection = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
  }
);

//make the connection
connection.connect();

// make an async call to test the connection

connection.query("select now()", (err, rows) => {
  if(err){
    console.log("Connection not successful", err)
  } else {
    console.log("Connection successful", rows)
  }
});



module.exports = connection;



