require('dotenv').config(); 

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

const _ = require("lodash");

const encrypt = require("mongoose-encryption");

app.set('view engine', 'ejs');


const mongoose = require('mongoose');
// import List from "./model/List.js";
mongoose.connect("mongodb+srv://mongo:mongo@cluster0.xrbupsy.mongodb.net/demo?retryWrites=true&w=majority");
mongoose.set("strictQuery", true);
const { Schema , SchemaTypes, model } = mongoose;


// const schema = new Schema({
//     todolist : String
// })
// const List = model("List",schema);


const base = new Schema({
    title : String,
    lst : [String] 
})
const Base = model("Base",base);

// const user = new Schema({
//     title : String,
//     work : [{type: Schema.ObjectId, ref: 'Base'}] 
// })
// const User = model("User",user);

const userSchema = new Schema({
    email : String,
    name : String,
    password : String
})


secret = process.env.SECRET;
userSchema.plugin(encrypt,{secret:secret,encryptedFields:['password']});

const User = model("User",userSchema);

const date = require(__dirname+"/date.js");

// const s = new List({
//     todolist : "",
// });

const db = new Base({
    title : "",
    lst : []
});

// const u = new User({
//     title : "",
//     work : db
// });

app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})

app.post("/register",function(req,res)
{
    const newUser = new User({
        email : req.body.email,
        name : req.body.name,
        password :req.body.password
    })

    newUser.save(function(err)
    {
        if(err){
            console.log(err);
        }
        else
        {
            res.render("user",{listTitle : req.body.name , new_items : db});
        }
    });
})

app.post("/login",function(req,res){
    const username = req.body.email;
    const password = req.body.password;
    
    User.findOne({email : username},function(err,found)
    {
        
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(found)
            {
                console.log("Login page 123");
                if(found.password === password)
                {
                    res.render("user",{listTitle : req.body.name , new_items : db});
                }
                else
                {
                    res.render("login");
                }
            }
        }
    })
})

// app.get("/",function(req,res){

//     // const day = date.getDate();
//     Base.find({}, function(err, items) {
//         if(items.length === 0)
//         {
//             res.render("home",{listTitle : "Home",new_items : []});
//         }
//         else
//         {
//             res.render("home",{listTitle : "Home",new_items : items});
//         }
//       });
// });

// app.get("/:CustomTitle",function(req,res){
//     console.log(req.params.CustomTitle);
//     const customtitle = req.params.CustomTitle;
//     Base.findOne({title : customtitle},function(err,found){
//         if(!err)
//         {
//             // res.render("list",{listTitle : customtitle,new_items : found.lst});
//             // console.log(found.lst);
//         }
//     })
// })

// app.post("/",function(req,res){
//     let item = req.body.newItem;
//     const t = req.body.list;
//     if(t === "Home")
//     {
//         const i1 = new Base({
//             title : item,
//             lst : []
//         })
//         console.log(item);
//         i1.save();
//         res.redirect("/");
//     }
//     else
//     {
//         Base.findOneAndUpdate({title : t},{$push : {lst : item}},function(err,found){
//             console.log(found+" 11111111111 "+t);
//         })
//         res.redirect("/"+t);
        
//     }
    

// })


// app.post("/delete",function(req,res){
//     const del = req.body.checkbox;
//     const title = req.body.listTitle;
//     console.log(del+" 2222222222 "+title);
//     if(title === "Home")
//     {
//         List.findByIdAndRemove(del,function(err)
//         {
//             console.log(err);
//         })
//         res.redirect("/");
//     }
//     else
//     {
//         Base.findOneAndUpdate({title : title},{$pull : {lst  : del}},function(err,found){
//             console.log(err);
//         })
//         res.redirect("/"+title);
//     }
    
// })

app.listen(3000,function(){
    console.log("server is running at the port 3000");
})