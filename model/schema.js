const mongoose = require('mongoose');

//Creating the schema

const bookSchema = mongoose.Schema({
    id : {
        type: Number
    },
    name : {
        type: String,
        unique: [true,'The book is already in the list'],
        require:[true,'The filed is required'],
        uppercase:true
    },
    sold : {
        type: Number

    },
    image:{
        type:String,
    }
});

const userschema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true

    }
});


//Creating the model of the database

const BookModel = mongoose.model('BookModel',bookSchema);
const userModel = mongoose.model('userModel',userschema);

module.exports = {BookModel,userModel};