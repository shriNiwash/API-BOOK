const mongoose = require('mongoose');
require('dotenv').config();

//Now Making the connection with database
// const conn ="mongodb+srv://shriNiwash:Mriphone12345@cluster0.waox8.mongodb.net/MERN_SHRI?retryWrites=true&w=majority";
const conn = process.env.CONNECTION;
console.log(conn);
mongoose.connect(conn,{useNewUrlParser: true,useUnifiedTopology:true}).
then(()=>console.log("The database Conenction is successfull")).catch((err)=>console.log(err));

