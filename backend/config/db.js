import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Create connection pools
const authentiticatonDBConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "authentication",
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
  local_infile: true 
});

const iventoryDBConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "museum_inventory",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  local_infile: true,
  infileStreamFactory: path => fs.createReadStream(path)
});

// Use the connection pools
authentiticatonDBConnection.getConnection((err, connection) => {
  if (err) {
    console.error("Authentication DB Connection Failed", err);
  } else {
    console.log("Authentication DB Connected");
    // Use the connection for your queries

    // Don't forget to release the connection when done
    connection.release();
  }
});

iventoryDBConnection.getConnection((err, connection) => {
  if (err) {
    console.error("Inventory DB Connection Failed", err);
  } else {
    console.log("Inventory DB Connected");
    // Use the connection for your queries

    // Don't forget to release the connection when done
    connection.release();
  }
});

export {
  iventoryDBConnection,
  authentiticatonDBConnection
};
