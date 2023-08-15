const mysql = require('mysql')
const db = require('../sql/connection')
const { handleSQLError } = require('../sql/error')

// dont nessacarily need the error.js file with the new style of writing code
const getAllUsers = (req, res) => {
  // SELECT ALL USERS
  let sql = "select first_name, last_name, address, city, county, state, zip, phone1, phone2, email ";
  sql += "from users u join usersAddress ua on u.id = ua.user_id  join usersContact uc on u.id = uc.user_id";
  


  db.query(sql, (err, rows) => {
    if (err) {
      console.log("getAllUsers query failed", err)
      res.sendStatus(500) //it was server's fault
    } else {
      return res.json(rows);
    }
  })
}
//can also use db.query
  // db.query("SELECT * FROM users", (err, rows) => {
  //   if (err) return handleSQLError(res, err)
  //   return res.json(rows);
  // })


function getUserById(req, res) {
  // SELECT USERS WHERE ID = <REQ PARAMS ID>
  // users/ :id
  // put the requested path id into a variable
  // WHAT GOES IN THE BRACKETS
  
  let id = req.params.id // this will get whatever is sent from the front-end form in the id text field

  let params = [id]; // you can have more than one parameter and ? in your query, and they have to be in order of use in the query


  //check for a valid id
  if (!id) {
    res.sendStatus(400); // their fault. didn't send a valid id
    return;              // and stop. no reason to execute any more code
  }
  

  // //WE DONT DO THIS EVER!!!!
  // //this is a bad way to do a query!!! - with the id (or any other request param) concatinated to the string
  // // why?
  // // and what if i add and drop table user
  // // this is called a SQL injection attack
  // let sql = "select first_name, last_name, address, city, county, state, zip, phone1, phone2, email ";
  // sql += "from users u join usersAddress ua on u.id = ua.user_id  join usersContact uc on u.id = uc.user_id";
  // //sql += "where u.id = " + id; 
  
  
  //Instead we use pareterized sql statements 
  let sql = "select first_name, last_name, address, city, county, state, zip, phone1, phone2, email ";
  sql += "from users u join usersAddress ua on u.id = ua.user_id  join usersContact uc on u.id = uc.user_id";
  sql += "where u.id =  ? and first_name = ?";
  
  //the "?" is a dynamic value that is restricted to a query parameter
  // the query paremeter isn't combined with the main query until AFTER the query has been parsed
  //so there's no way the paremeter can introduce uninted syntax

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("getUserById query failed", err);
      res.sendStatus(500); //it was our fault
    } else {
      //we got result, but we got more than one row 
      if (rows.length > 1) {
        console.log("Returned more than 1 row for id", id)
        res.sendStatus(500); // server's fault (our fault) data integrity error 
      } else if (rows.length == 0) {
        // res.send(null); // dont send anything back 
        // OR
        res.status(404).send('User not found');
      } else {
        // success! we got one row
        res.json(rows[0]) // if i just re.json(rows), it returns an array with one object
        // if i want to 
      }
    }

  })
}


//wwhat goes in the brackets
//  sql = mysql.format(sql, []);
  
  



//   db.query(sql, (err, rows) => {
//     if (err)
//       return handleSQLError(res, err);
//     return res.json(rows);
//   });
// }
//here for reference we are going to do this, and use, the promis version
const callBackcreateUser = (req, res) => {
  // INSERT INTO USERS FIRST AND LAST NAME - this is when the id is created that we need for the user_id columns in the other two tables
  // so the first insert MUST complete before we can execute the other 2 queries
  // INSTERT INTO usersContact user_id, phone1, phone2, email
  // INSERT INTO usersAdress user_id, adrees, city, county, state, zip
  //INSERT INTO usersContact user_id, phone1, phone2, email
  //INSERT INTO userAdress user_id adress, city, county, state, zip

  // asynchronous: run something until it finishes whenever, and goes on to run other stuff while first thing may or may not be finished
  //JavaScript will do this until you tell it not to. sometimes you need code to run in a certain order, like fetch and promises
  // we call this blocking codde sometimes

  // here's the kicker: mysql doesn't have built-in methods to create blocking code out of the box

  // one way we handle this is to create nested callbacks that excecute each query one at a time
  // this can get complicated. we call this scenario callback hell
  
  //CALLBACK HELL VERSION

  // FIRST QUERY
  let first = req.body.first_name;
  let last = req.body.last_name;

  let params = [first, last];
  //the above is the longer way to write things but is easier to read, and each line of code is not as long.
  // i could also do this but sometimes it gets long


  let sql = "insert into users (first_name, last_name) values (?, ?)";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("createUser query failed", err);
      res.sendStatus(500);
    } else {
      // if we got here, the first query executed
      // postman check
      //  res.json(rows); //just the postman check



      //SECOND QUERY
      // I need the id of the user we just inserted. For example, I'm going to use MAX(id) to get the id-this way wouldnt work if there are more than one person using the database at the same time
      let getId = rows.insertId;
      let address = req.body.address;
      let city = req.body.city;
      let county = req.body.county;
      let state = req.body.state;
      let zip = req.body.zip;
      //do not have to define new variable, can just use params, and sql instead. This just helps keep things straight in the brain (in an aggrogate scale this method of creating a new variable will take up more memory)
      params = [getId, address, city, county, state, zip]

      sql = "insert into usersAddress (user_id, address, city, county, state, zip) ";
      sql += "values (?, ?, ?, ?, ?, ?)";

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.log("insert into usersAddress query failed", err)
        } else {
          // if we got here second query worked
          // postman check
          // res.json(rows);

          //THIRD QUERY
          let phone1 = req.body.phone1;
          let phone2 = req.body.phone2;
          let email = req.body.email;


          params = [getId, phone1, phone2, email]
          sql = "insert into usersContact (user_id, phone1, phone2, email) values (?, ?, ?, ?) ";

          db.query(sql, params, (err, rows) => {
            if (err) {
              console.log("insert into usersContact query failed", err)
            } else {
              //if we got here the third query worked
              //postman check
              res.json(rows); //final check
            }
          })

        }
      })

    }
  })
}

// this is the same thing, using promises^
const createUser = async (req, res) => {
// sync uses promises (async/await)
  //FIRST QUERY
let first = req.body.first_name;
let last = req.body.last_name;

let params = [first, last];

  let sql = "insert into users (first_name, last_name) values (?, ?)";
  
  let results;

  try {
    results = await db.querySync(sql, params);
    // postman check
    // res.json(results);
  } catch (err) {
    console.log("insert into users failed ", err);
    res.sendStatus(500);
    return; // if the query didn't work, stop
  }

  // SECOND QUERY
  // get the foreign key

  let getId = results.insertId;
      let address = req.body.address;
      let city = req.body.city;
      let county = req.body.county;
      let state = req.body.state;
      let zip = req.body.zip;

      params = [getId, address, city, county, state, zip]

  sql = "insert into usersAddress (user_id, address, city, county, state, zip) values (?, ?, ?, ?, ?, ?) ";
  
  try {
    results = await db.querySync(sql, params);
    // postman check
    // res.json(results);
  } catch (err) {
    console.log("insert into usersAddress failed ", err) 
    res.sendStatus(500); 
    return; //stop if there's an eror
  }

  //THIRD QUERY

  let phone1 = req.body.phone1;
          let phone2 = req.body.phone2;
          let email = req.body.email;

  params = [getId, phone1, phone2, email]
  
  sql = "insert into usersContact (user_id, phone1, phone2, email) values (?, ?, ?, ?) ";
  
  try {
    results = await db.querySync(sql, params);
    res.send("User created successfully");
    // postman check
    // res.json(results);
  } catch (err) {
    console.log("insert into usersContact failed ", err) 
    res.sendStatus(500); 
    return; //stop if there's an error
  }
} // end create user



const updateUserById = (req, res) => {
  // UPDATE USERS AND SET FIRST AND LAST NAME WHERE ID = <REQ PARAMS ID>
  // Same route as GET by id. POST is the verb that creates a new user. The verb we will use here is PUT. PUT is the the update verb we use here.
  // PUT /users/:id
  /**  ---test case---
   * 503 Adrian Mattern
   * object will look like...
   * 
   * {
   * "first_name": "Melinda", 
   * "last_name" : "Miller"
   * }
   */
  let id = req.params.id;
  let first = req.body.first_name;
  let last = req.body.last_name;

  let params = [ first, last, id ]; // order matters and must match our sql delcaration

  let sql = "update users set first_name = ?, last_name = ? where id = ?";

  if (!id) {
    res.sendStatus(400);
    return; //no matching id, so stop. No reason to look. 
}

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("update failed", err)
      res.sendStatus(500);
    } else {
      res.json(rows)
}
  })

}

const deleteUserByFirstName = (req, res) => {
  // DELETE FROM USERS WHERE FIRST NAME = <REQ PARAMS FIRST_NAME>
  let params = [req.params.first_name];
  let sql = "delete from users where first_name = ?"

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("delete failed ", err);
      res.sendStatus(500);
    } else {
      res.json({ message: `Deleted ${rows.affectedRows} users` })
      
    }
  })


}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserByFirstName
}