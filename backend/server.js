import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import {notFound, errorHandler} from './middleware/errorMiddleware.js'
import cookieParser from 'cookie-parser';
import  mysql from 'mysql2';
import multer from 'multer'; 
//Routes
import authRoutes from './routes/authRoutes.js'
import exhibitRoutes from './routes/exhibitRoutes.js'
import userRoutes from './routes/userRoutes.js'
var upload = multer()
dotenv.config()
const port = process.env.PORT || 5000
const app = express()


app.use(bodyParser.json()); // Middleware to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse form data

app.get('/', (req, res) => {
    res.send('api')
})

//cookie parser mw 
app.use(cookieParser());

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/exhibits', exhibitRoutes);
app.use('/api/user', userRoutes);

app.use(notFound)
app.use(errorHandler)


app.listen(port, () => console.log('running on port'  + port))