const express = require('express');
const bodyparser = require('body-parser');
require('../model/db');
const {BookModel,userModel} = require('../model/schema');
const async = require('hbs/lib/async');
const { default: mongoose } = require('mongoose');
const swaggerUI  = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerjsDocs = YAML.load('./api.yaml');
const router = express.Router();
const cors = require('cors');
const redis = require('redis');
// const REDIS_PORT = process.env.PORT || 6379;

//implementing redis
const client = redis.createClient({
    url: 'redis://default:Mrshri1212@redis-13009.c10.us-east-1-4.ec2.cloud.redislabs.com:13009',
});


(async ()=> {
    await client.connect();
})();

router.use(bodyparser.json());
router.use(express.urlencoded({extended:false}));

router.use(cors({
    origin:"http://127.0.0.1:5500",
    methods:['POST','GET','DELETE','PUT','PATCH'],

}))

//redis middleware
const redis_form = async(req,res,next)=>{
    const username = req.params.id;
    const value = await client.get(username);
    if(value){
        console.log('fetching data from redis...');
        res.send(value);
    }
    else{
        next();
    }

}

//redis middleware for total-sales
const redis_tatal = async(req,res,next)=>{
    const value = await client.get('total-sales');
    if(value){
        console.log('Total-sales is fetching from redis');
        res.send(value);
    }
    else{
        next();
    }
}

//redis middleware for books list

const redis_books = async(req,res,next)=>{
    const value = await client.get('books');
    if(value){
        console.log('data coming from redis..');
        res.send(value);
    }else{
        next();
    }
}

//swagger docs url
router.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerjsDocs));

//Creating the Post Request API(CREATE OPERATION)
router.post('/books',async(req,res)=>{
    const InsertData = new BookModel({
        id : req.body.id,
        name : req.body.name,
        sold : req.body.sold,
   });
   try{
      const data = await InsertData.save();
      res.json(data);
      console.log(data);
      res.status(200);

   }
   catch(err){
       res.json({message:"The field is existed"});
   }
});

router.post('/user',(req,res)=>{
    insertUser = new userModel({
        username:req.body.username,
        password:req.body.password
    });
    insertUser.save().then((data)=>{
        console.log(data);
        res.json(data);
    }).catch((err)=>console.log(err))
});

router.post("/books",(req,res)=>{
    const InsertData = new BookModel({
        id : req.body.id,
        name : req.body.name,
        sold : req.body.sold,
        image: req.body.image
   });
   InsertData.save().then((data)=>{
       console.log(data);
       res.json(data);
   }).catch((err)=>{
       console.log(err);
       res.send('error occured');
   })


})
//Creating GET request API(READ OPERATION)
router.get('/books/list',redis_books,async(req,res)=>{
    try{
        const ListData = await BookModel.find();
        res.json(ListData);
        client.setEx('books',3600,JSON.stringify(ListData));
    }
    catch(err){
        res.send('error', +err);
    }

});

//API Fetching By ID (READ OPERATION)
router.get('/books/list/:id',redis_form,async(req,res)=>{
    try{
        const data = await BookModel.findById(req.params.id);
        res.json(data);
        const username = req.params.id;
        client.setEx(username,3600,JSON.stringify(data));
    }
    catch(err){
        throw err;
    }
})

//total books sold
router.get('/books/total-sales',redis_tatal,(req,res)=>{
    BookModel.aggregate([
        {$group:{_id:"",Total:{$sum:'$sold'}}},
        {$project:{_id:"",Total:1,_id:0}}
    ],(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.json(result);
            client.setEx('total-sales',3600,JSON.stringify(result));
        }
    })
    
})

//Update Opertaion
router.patch('/books/list/:id',(req,res)=>{
    BookModel.findByIdAndUpdate(req.params.id,req.body).then((data)=>{
        console.log(data);
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.send('error occured');
    })
})

//Delete Operation
router.delete('/books/list/:id',(req,res)=>{
    BookModel.findByIdAndDelete(req.params.id).then((data)=>{
        console.log('data deleted',data);
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.send('error occured');
    })
});

router.get('/lookup',(req,res)=>{
    BookModel.aggregate([{
        $lookup:{
            from:"usermodels",
            localField:"name",
            foreignField:"username",
            as:"anything"
        }
    }],(err,result)=>{
        if(err){
            res.send('error occured');
        }
        else{
            res.json(result);
            console.log(result);
        }
    }
    )
})

module.exports = router;