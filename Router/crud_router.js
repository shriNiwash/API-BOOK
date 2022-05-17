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

router.use(bodyparser.json());
router.use(express.urlencoded({extended:false}));

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
router.get('/books/list',async(req,res)=>{
    try{
        const ListData = await BookModel.find();
        res.json(ListData);
    }
    catch(err){
        res.send('error', +err);
    }

});

//API Fetching By ID (READ OPERATION)
router.get('/books/list/:id',(req,res)=>{
    BookModel.findById(req.params.id).then((data)=>{
        console.log(data);
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.send('error occured');
    })
})

//total books sold
router.get('/books/total-sales',(req,res)=>{
    BookModel.aggregate([
        {$group:{_id:"",Total:{$sum:'$sold'}}},
        {$project:{_id:"",Total:1,_id:0}}
    ],(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.json(result);
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