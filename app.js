require("dotenv").config();


const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));


app.set('view engine', 'ejs');
const _ = require("lodash");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.use(session({
    secret : "Our little Secret",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


const mongoose = require('mongoose');


mongoose.connect("mongodb+srv://mongo:mongo@cluster0.xrbupsy.mongodb.net/demo?retryWrites=true&w=majority");
mongoose.set("strictQuery", true);



const { Schema , SchemaTypes, model } = mongoose;


const list = new Schema({
    username : String,
    heading : String,
    title : String
})
const List = model("List",list);


const base = new Schema({
    title : String,
    lst : [String],
    username : String
})
const Base = model("Base",base);

const userSchema = new Schema({
    username : String,
    password : String,
    googleId : String,
    base : [{type: Schema.ObjectId, ref: 'Base'}] 
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id); 
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/todolist",
    userProfileURL : "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


const date = require(__dirname+"/date.js");

const db = new Base({
    title : "",
    lst : []
});

app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})

app.post("/login",function(req,res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
    })
    req.login(user,function(err){
        
        if(err){
            console.log(err);
        }
        else{
            
            passport.authenticate("local")(req,res,function(){
                console.log(user);
                Base.find({username : req.body.username},function(err,items){
                    if(items.length===0)
                    {
                        res.render("user",{listTitle : "Home",username : req.body.username , new_items : []});
                    }
                    else
                    {
                        res.render("user",{listTitle : "Home",username : req.body.username , new_items : items});
                    }
                })
                
            })
        }
    })
})

app.post("/register",function(req,res)
{
    console.log("Sucess1");
    User.register({username : req.body.username},req.body.password,function(err,user){
        if(err)
        {
            console.log(err);
            console.log("error");
            res.redirect("/register");
        }
        else{
            console.log("Success");
            passport.authenticate("local")(req,res,function(){
                console.log("Hello");
                res.redirect("/"+req.body.username);
            })
        }
    })
    
})

app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/");
    });
  });

app.get("/:username",function(req,res){
    const username = req.params.username;
    if(req.isAuthenticated()){
        Base.find({username : username}, function(err, items) {
        if(items.length === 0)
        {
            res.render("user",{listTitle : "Home",username : username ,new_items : []});
        }
        else
        {
            res.render("user",{listTitle : "Home",username : username ,new_items : items});
        }
    });
    }
    else{
        res.redirect("/login");
    }
})

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));

app.get('/auth/google/todolist',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(req.user.id);
    res.redirect('/'+req.user.id);
  });


app.get("/:username/:sublist",function(req,res){
    const username = req.params.username;
    const sublist = req.params.sublist;
    if(req.isAuthenticated()){
        List.find({username : username,heading : sublist}, function(err, items) {
        if(items.length === 0)
        {
            res.render("sublist",{listTitle : sublist,username : username ,new_items : []});
        }
        else
        {
            res.render("sublist",{listTitle : sublist,username : username ,new_items : items});
        }
    });
    }
    else{
        res.redirect("/login");
    }
})



app.post("/",function(req,res){
    const item = req.body.newItem;
    const t = req.body.list;
    if(t === "Home")
    {
        const i1 = new Base({
            title : item,
            lst : [],
            username : req.body.username
        })
        console.log(i1);
        i1.save();
        res.redirect("/"+req.body.username);
    }
    else
    {
        const i1 = new List({
            username : req.body.username,
            heading : t,
            title : item
            
        })
        console.log(i1);
        i1.save();
        res.redirect("/"+req.body.username+"/"+t);
        
    }
    

})


app.post("/delete",function(req,res){
    const del = req.body.checkbox;
    const title = req.body.listTitle;
    const username = req.body.username;
    if(title === "Home")
    {
        Base.findByIdAndRemove(del,function(err)
        {
            console.log(err);
        })
        res.redirect("/"+username);
    }
    else
    {
        List.findByIdAndRemove(del,function(err)
        {
            console.log(err);
        })
        res.redirect("/"+username+"/"+title);
    }
    
})

app.listen(3000,function(){
    console.log("server is running at the port 3000");
})