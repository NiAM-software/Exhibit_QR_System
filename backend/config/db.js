import  mysql from 'mysql2';
import dotenv from 'dotenv'
dotenv.config()

const authentiticatonDBConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "authentication"
});

const iventoryDBConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "museum_inventory"
});
  
authentiticatonDBConnection.connect((err) => {
  if (!err) {
    console.log("auth db Connected");
  } else {
    console.log("auth db Connection Failed");
  }
});

iventoryDBConnection.connect((err) => {
  if (!err) {
    console.log("inventory Connected");
  } else {
    console.log("inventory Connection Failed");
  }
});
  
export{
  authentiticatonDBConnection, 
  iventoryDBConnection
}
