const mongoose=require('mongoose')
const ENV=require('../config')


const connectDB=async ()=>{
    
    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(`mongodb+srv://${ENV.USERNAME}:${ENV.PASSWORD}@${ENV.CLUSTER}.mongodb.net/${ENV.DBNAME}?retryWrites=true&w=majority`);
    console.log("Database Connected")
    return db;
    
}
module.exports=connectDB;
