const mysql = require('mysql')
const db = require('../sql/connection')
const { handleSQLError } = require('../sql/error')

const getAllUsers = (req, res) => {
  // SELECT ALL USERS
  let sql ="select first_name, last_name, address, city, county, state, zip, phone1, phone2, email ";
  sql += "from users u join usersAddress ua on u.id = ua.user_id join usersContact uc on u.id = uc.user_id"

  console.log(sql)
  
db.query(sql, (err, rows) => {
  if(err) {
    console.log("getAllUsers query failed", err)
    res.sendStatus(500) // it was server's fault
  } else {
    return res.json(rows);
  }
})

  // OLDER SYNTAX
  // db.query("SELECT * FROM users", (err, rows) => {
  //   if (err) return handleSQLError(res, err)
  //   return res.json(rows);
  // })
}

const getUserById = (req, res) => {
  // SELECT USERS WHERE ID = <REQ PARAMS ID>

  let id = req.params.id // this will get whatever is sent form the frontend form in text field

  let params = [id]; // you can have more than one ? in your query, and they have to be in order of use in the query 

if(!id){
  res.sendStatus(400);
  return;
}

  
  let sql = "select first_name, last_name, address, city, county, state, zip, phone1, phone2, email ";
  sql += "from users u join usersAddresss ua on u.id = ua.user_id join usersContact uc on u.id = uc.user_id ";
  slq += "where u.id = ? and first_name = ?";

  // the ? is a dynamic value that is restricted to a query parameter
  // the query parameter isnt combined with the main query until AFTER the query has been parsed,
  // so there's no way the parameter can introduce unintended syntax

  db.query(sql, params, (err, rows) => {
    if(err){
      console.log("getUserById query failed", err);
      res.sendStatus(500); // its our fault
    } else {
      if(rows.length > 1){
        console.log("Returned more than 1 row for id ", id);
        res.sendStatus(500); // data integrity error
      } else if(rows.length == 0){
        // res.send(null); // dont send anything back
        // or
        res.sendStatus(400).send('User not found');
      } else {
        res.json(rows[0])
      }
    }
  })







  // // WHAT GOES IN THE BRACKETS
  // sql = mysql.format(sql, [])

  // pool.query(sql, (err, rows) => {
  //   if (err) return handleSQLError(res, err)
  //   return res.json(rows);
  // })
}

const createUser = (req, res) => {
  let first = req.body.first_name;
  let last = req.body.last_name;

  let params = [first, last];
  // i could also do this, but sometimes it gets long
  // let params = [req.body.first_name, req.body.last_name]

  let sql = "insert into users (first_name, last_name) values (?, ?)";

  db.query(sql, params, (err, rows) => {
    if(err){
      console.log("createUser query failed", err)
      res.sendStatus(500);
    } else {
      // res.json(rows)
      sql = "select max(id) as id from users where first_name = ?"
    }
  })


  // // INSERT INTO USERS FIRST AND LAST NAME 
  // let sql = "QUERY GOES HERE"
  // // WHAT GOES IN THE BRACKETS
  // sql = mysql.format(sql, [])

  // db.query(sql, (err, results) => {
  //   if (err) return handleSQLError(res, err)
  //   return res.json({ newId: results.insertId });
  // })
}

const updateUserById = (req, res) => {
  // UPDATE USERS AND SET FIRST AND LAST NAME WHERE ID = <REQ PARAMS ID>
  let sql = ""
  // WHAT GOES IN THE BRACKETS
  sql = mysql.format(sql, [])

  pool.query(sql, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.status(204).json();
  })
}

const deleteUserByFirstName = (req, res) => {
  // DELETE FROM USERS WHERE FIRST NAME = <REQ PARAMS FIRST_NAME>
  let sql = ""
  // WHAT GOES IN THE BRACKETS
  sql = mysql.format(sql, [])

  pool.query(sql, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.json({ message: `Deleted ${results.affectedRows} user(s)` });
  })
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserByFirstName
}