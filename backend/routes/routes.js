const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Chat = require('../models/chat');
const mongoose=require('mongoose');

const router = Router();

router.post('/register', async(req, res) => {
    let contact = req.body.contact;
    let password = req.body.password;
    let name = req.body.name;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const record = await User.findOne({contact: contact});
    
    if(record){
        return res.status(400).send({
            message: "Contact is already registered!"
        })
    }else{ 
        const user = new User({
            name: name,
            contact: contact,
            password: hashedPassword
        });
    
        const result = await user.save();
        //JWT Token
        const {_id} = await result.toJSON();
        const token = jwt.sign({_id:_id}, "secret");

        res.cookie("jwt", token,{
            httpOnly:true, 
            maxAge: 24*60*60*1000
        });

        res.send({
            message:"Success!!"
        });
    }
});
router.post('/home/user/chat', async(req, res) => {
    let sender=req.body.sender;
    let msg=req.body.text;
    let date=req.body.timestamp;

    console.log("id sent is: "+sender);
    const chat=new Chat({
        participants:[sender],
        messages:[
        {
            sender: sender,
            text: msg,
            timestamp: date
        }]
    });
    const result = await chat.save();

});


router.post("/login", async (req, res) => {
    const user = await User.findOne({contact: req.body.contact});
    if(!user){ 
        return res.status(404).send({
            message: "User not Found!"
        });
    }

    if(!(await bcrypt.compare(req.body.password, user.password))){ 
        return res.status(400).send({message: "Password is incorrect"});
    }

    const token = jwt.sign({_id:user._id}, "secret")
    res.cookie("jwt", token,{ 
        httpOnly:true, 
        maxAge:24*60*60*1000 // for 1 day
    })

    res.send({
        message:"Success!!"
    });
});

router.get("/user", async (req, res) => {
    try{
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "secret");
        if(!claims){
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const user = await User.findOne({_id:claims._id});
        const {password,...data} = await user.toJSON();
        // console.log("current user data : "+data._id);
        res.send(data);

    }catch(err){
        return res.status(401).send({
            message: 'unauthenticated'  
        })
    }
});


router.get('/home/users', async (req, res) => {
    console.log("Get req for all user names...");
    try{
        const users=await User.find({},'name');
        res.json(users);
    }catch(err){
        return res.status(500).send({
            error: 'An error occured while fetching user names..'  
        });
    }
});


router.post('/logout', (req, res) => {
    res.cookie("jwt","", {maxAge:0});
    res.send({
        message: "success"
    }); 
})

router.get('*',function(){
    res.redirect('/');
});


module.exports=router;