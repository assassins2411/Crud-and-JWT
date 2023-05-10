
const express=require('express')
const cors=require('cors')
const morgan=require('morgan')
const mongoose=require('mongoose')
const connectDB=require('./database/connection')
const router=require('./router/route')


// connectDB()

/* express variable */
const app=express()




/* middlewares */
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.disable('x-powered-by')


const port=8080

/* HTTP get request */
app.get('/',(req,res)=>{
    res.status(201).json('Home GET Request')
})
/* api routes */
app.use('/api',router)

/* start server */
// mongoose.connection.once('open',()=>{
//     console.log('Connected to MongoDB')
//     app.listen(port,()=>{
//         console.log(`Server connected to http://localhost:${port}`)
//     })
// })
connectDB().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log('Cannot connect to the server')
    }
}).catch(error => {
    console.log("Invalid database connection...!");
})

