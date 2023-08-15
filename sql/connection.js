require('dotenv').config();

const mysql = require('mysql');

//function based


// make an async call to test the connection

/**
 * use the basic syntax of the mysql module query 
 * 
 * execute the query and handle the results
 * conection.query(sql, callback)
 * sql = query code you want to run - select * from wherever
 * callback does what you want to do with the results
*/

// let sql = 'select now();'
// let callback = (err, rows) => {
  //   if (err) {
    //     // not truthy so a connection wasn't made
    //     console.log("Could not connect to the database", err)
    //   } else {
      //     // it is truthy, so the query execute, so the query executed and we show the results of the query
      //     console.log("Connection made", rows);
      //   }
     
     
      // define the connection
     


let connection = mysql.createConnection(
        {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PWD,
          database: process.env.DB_NAME
        }
      );

      
      
      
      
//       //make the connection
connection.connect();


// mysql doesn't include a method that handles promises, just callbacks
// the data base doesnt care. It's just revieving queries and returning results it processes says, and returns results
// if we want to use promises, we either find a module that handles mysql promises (and learn to use it)
// or we can build our own middleware function that does if for us

// basic wrapper promise if you just want to CONVERT A CALLBACK TO FUNCTION
// we'll use this when we build our authorization
connection.queryPromise = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    })
  })
}; // end

// go farther, and if you want to process the results of your promis and return the results
// you want to make a blocking function that always returns an err or rows

connection.querySync = async (sql, params) => {
  let promise = new Promise((resolve, reject) => {
    console.log("Executing query", sql);
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.log("rejecting");
        return reject(err);
      } else {
        console.log("resolving");
        return resolve(results);
      }
    })
  })
  let results = await promise.then((results) => {
    console.log("results ", results);
    return results;
  }).catch((err) => {
    throw err;
  })
  return results;
}; // end


connection.query("select now()", (err, rows) => {
  if(err) {
    console.log("Connection not successful", err)
  } else {
    console.log("Connected, ", rows)
  }
})


module.exports = connection; 


//class based connection -this is the older way of doing things, but it still works-
// class Connection {
//   constructor() {
//     if (!this.db) {
//       console.log('creating connection...')
//       this.db = mysql.createdb({
//         connectionLimit: 100,
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PWD,
//         database: process.env.DB_NAME
//       })

//       return this.db
//     }

//     return this.db
//   }
// }

// const instance = new Connection()

// module.exports = instance;