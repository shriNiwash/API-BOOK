const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
require('./model/db');
const {BookModel,userModel} = require('./model/schema');
const hbs = require('hbs');
const path = require('path');
const async = require('hbs/lib/async');
var alert = require('alert');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const logger = require('./Router/logger');
const multer = require('multer');


//body parser
app.use(bodyparser.json());
app.use(express.urlencoded({extended:false}));

//path declaration
const staticPath = path.join('__dirname',"../public/");
console.log(staticPath);
app.use(express.static(staticPath));

//initializing session
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());


//views engine
app.set('view engine','hbs');
app.set('views','./views');

//Insertion of Data(CREATE OPERATION)
app.get('/insert',isAuthenticate,(req,res)=>{
    res.render('Insert');
    logger.info("The insertion page is visited");
});

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/login',(req,res)=>{
    res.render('login');
    logger.info("The user is on login page");
})

//file upload with multer module
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

var upload = multer({storage:storage});

//book inventory insertion
app.post('/insert',upload.single('blogimage'),async(req,res)=>{
    var name = req.body.name;
    var sold = req.body.sold;
    var image = req.file.fieldname;
    console.log(image);
    try{
        const insertDatas = new BookModel({
            name : `${name}`,
            sold : `${sold}`,
            image: `${req.file.filename}`,
        });
        const data = await insertDatas.save()
        console.log(data);
        res.redirect('/list');
    }
    catch(err){
        alert("Already existed");
    }
    

});

//Read Operation
app.get('/list',isAuthenticate,async(req,res)=>{
    try{
        const datas = await BookModel.find();
        res.render('datalist',{list:datas});
    }
    catch(err){
        res.send("error", +err);
    }
});

app.get("/list/edit/:id",isAuthenticate,async(req,res)=>{
    const id = req.params.id;
    BookModel.findById(id, function (err, docs) {
        if (err){
            logger.info(err);
        }
        else{
            console.log(docs);
            console.log(req.params.id);
            res.render('update',{
                dataList:docs,
                ide:req.params.id,
            });   
        }
    });
  
});

//update operation
app.post("/list/edit/:id",upload.single('blogimage'),async(req,res)=>{
    const resul =await BookModel.findById(req.params.id);
    const imag = resul.image;
    try{
    const result = await BookModel.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        sold:req.body.sold,
        image:(req.file == null) ? imag : req.file.filename
    });
    console.log(result);
    console.log(req.body);
    logger.info("List group is requested for update");
    res.redirect('/list');
    }
    catch(err){
    console.log(err);
    }
})

//delete operation
app.get("/list/delete/:id",isAuthenticate,(req,res)=>{
    const ids = req.params.id;
    res.render('delete',{da:ids});
})


//local streightegy
passport.use(new LocalStrategy(
    function(username, password, done) {
      userModel.findOne({ username: username }, function (err, user) {
        if (err) { return done(err) }
        if (!user) { return done(null, false,{message:"Incorrect Username."}); }
        var passwords = user.password;
        if (passwords!=password) { return done(null, false,{message:"Incorrect Password."}); }
        if(!user || passwords!=password) {return done(null,false,{message:"The userid and passsword is incorrect"})}
        logger.info(user);
        return done(null, user);
      });
    }
));


//serializeUser and deserialize
passport.serializeUser((user,done)=>{
    if(user){
        return done(null,user.id);
    }
    return done(null,false);
});


passport.deserializeUser((id,done)=>{
    userModel.findById(id,(err,user)=>{
        if(err) return done(null,false);
        return done(null,user);
    })
});

//logout feature
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
    logger.info("The user is logged out");
});

//authentication check
function isAuthenticate(req,res,done){
    logger.info(req.user);
    if(req.user){
        return done();
    }
    else{
        res.redirect('/login');
        logger.info("Invalid user");
    }
}

//delete opeation
app.post("/list/delete/:id",async(req,res)=>{
    try{
        const resut = await BookModel.findByIdAndDelete(req.params.id);
        logger.info(resut);
        logger.info("deleted");
        res.redirect('/list');
    }
    catch(error){
        logger.info(error);
    }

});

//registration of user
app.get('/register',(req,res)=>{
    res.render('registration');
})

app.post('/register',(req,res,done)=>{
    userModel.findOne({username:req.body.username},(err,user)=>{
        if(err) done(null,false);
        else if(user) res.redirect('/login');
        else{
                const data =new userModel({
                    username:req.body.username,
                    password:req.body.password
                });
                data.save().then((datas)=>console.log(datas)).catch((err)=>console.log(err));
                res.redirect('/login');
        }
    })
});

//reset section

app.get("/reset",(req,res)=>{
    res.render('forgotpage');
})

//mailgun configuration
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || '738c73412029eee29d1f62fc0fa13d90-100b5c8d-e2e35a60'});


app.post('/reset',(req,res)=>{
  userModel.findOne({username:req.body.email},(err,data)=>{
      if(!data){
         alert("User Not Found");
         res.redirect('/login');
      }
      else if(err){
          console.log(err);       
      }
      else{
          mg.messages.create('sandboxe079bbcfd9044590aa4a9939ab462305.mailgun.org', {
            from: "<smps03620@gmail.com>",
            to: `${req.body.email}`,
            subject: "Hello there",
            text:`Please Click Over the Link To Reset your Password ${req.url}/${data.id}`,
          })
          .then(msg => console.log(msg))
          .catch(err => console.log(err));
          console.log(`${req.url}/${data.id}`);
          res.send("<h1>The Password Reset Link Is sent to your Mail Please Check It out</h1>");
      }
  })
})


app.get("/reset/:id",(req,res)=>{
    res.render('reset',{ids:req.params.id});
})

app.post("/reset/:id",async(req,res)=>{
    try{
    const resulted = await userModel.findByIdAndUpdate(req.params.id,{password:req.body.password});
    console.log(resulted);
    alert("Successfully reseted Password")
    res.redirect('/login');
    }
    catch(err){
        console.log(err);
    }


})


//authenticate
app.post('/login', 
  passport.authenticate('local',{ failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/insert');
  });

const crudRouter = require('./Router/crud_router');
const { redirect } = require('express/lib/response');
app.use(crudRouter);
const { createBrotliCompress } = require('zlib');

//The application is running on the port 3000
app.listen(PORT,()=>logger.info(`The Server is ruuning on the port ${PORT}`));