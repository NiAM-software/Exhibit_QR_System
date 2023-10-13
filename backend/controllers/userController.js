import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import { promisify } from 'util';
import  { authentiticatonDBConnection as db}from '../config/db.js'
import bcrypt from 'bcryptjs';
const { compare, genSalt, hash } = bcrypt;
const genSaltAsync = promisify(genSalt);
const hashAsync = promisify(hash);


// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results, fields] = await db.promise().query(query, [email]);
  
    if (results && results.length > 0) {
      const { _id, user_name, email, password_hash } = results[0];
      const user = { _id, user_name, email };
      //console.log(results[0]);
      //Password match check
      const passwordMatch = await bcrypt.compare(password, password_hash);
      
      if (passwordMatch) { // valid user
        
        generateToken(res, _id);
        return res.status(200).json({
          _id: user._id,
          name: user.user_name,
          email: user.email,
        });
      } else {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else {
      return res.status(401).json({ message: "User account doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
   try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results, fields] = await db.promise().query(query, [email]);
  
    if (results && results.length > 0) {
       res.status(400);
       throw new Error('User already exists');
    } 
    
    const encryptedPassword = await encryptPassword(password);

    const [result, field] = await db.promise().query(
      'INSERT INTO users (user_name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, encryptedPassword]
    );
   
     //const [rows, fields, error] = await db.query('SELECT * FROM users');
    const [newUser, newFields] = await db.promise().query(query, [email])
    if(newUser && newUser.length>0){
      const {_id, user_name, email} = newUser[0]
      generateToken(res, _id);
      res.status(201).json({
        id : _id,
        name : user_name,
        email : email,
      });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send({message: err.message});
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};


// @desc    forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  res.send('forgot pw')
});


// @desc    forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const {id, token} = req.params
  const { email } = req.body;

  res.send('reset pw')
});


const encryptPassword = async (password) => {
  const salt = await genSaltAsync(10);
  return hashAsync(password, salt);
};



export {
  authUser,
  registerUser,
  logoutUser,
  forgotPassword, 
  resetPassword
};