import express from 'express'
import dotenv from 'dotenv'
//import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import exhibitRoutes from './routes/exhibitRoutes.js'
import {notFound, errorHandler} from './middleware/errorMiddleware.js'
import cookieParser from 'cookie-parser';
import  mysql from 'mysql2';


dotenv.config()
const port = process.env.PORT || 5000
const app = express()

// body parser mw 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => {
    res.send('api')
})


//cookie parser mw 
app.use(cookieParser());


app.use('/api/users', userRoutes);
app.use('/api/exhibits', exhibitRoutes);

app.use(notFound)
app.use(errorHandler)


app.listen(port, () => console.log('running on port'  + port))