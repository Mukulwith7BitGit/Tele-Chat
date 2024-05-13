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



router.post("/login", async (req, res) => {

    try{
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
        });
    
        res.send({
            message:"Success!!"
        });

        // const socket=req.app.get('socketio');
        // socket.to(user._id).emit('user-logged-in',{user:user});
    }catch(error){
        console.error('Error during login: ',error);
        res.status(500).send({message: 'Internal Server Error'});
    }

});

router.get("/user", async (req, res) => {
    try{
        console.log('jjjjjjjjjjjjjjjjjjjjjjjjj1111111',req);
        console.log('jjjjjjjjjjjjjjjjjjjjj2222',JSON.stringify(req,null,2));
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "secret");
        if(!claims){
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const user = await User.findOne({_id:claims._id});
        const {password,...data} = await user.toJSON();
        console.log("current user data : "+data._id);
        res.send(data);

    }catch(err){
        return res.status(401).send({
            message: 'unauthenticated'  
        })
    }
});


router.get('/home/users/:value1', async (req, res) => {
    const currentUserId=req.params.value1;
    console.log("Get req for all user names..."+currentUserId);
    try{
        const users=await User.find({_id:{$ne: currentUserId}}).exec();
        res.json(users);
    }catch(err){
        return res.status(500).send({
            error: 'An error occured while fetching user names..'  
        });
    }
});

router.get('/home/user/chats/sent/:value1/:value2', async (req, res) => {
    const senderId=req.params.value1;
    const receiverId=req.params.value2;
    console.log("Get msg sent by user"+senderId);

    try{    
        // const chats1=await Chat.find({'message.sender': senderId}).exec();
        // const chats2=await Chat.find({'participants': receiverId}).exec();

        const combinedChats=await Chat.find({ $and: [
            {'message.senderId': senderId},
            {'receiverId':receiverId}]}).exec();

        // console.log("all chats"+chats);
        res.status(200).json(combinedChats);
    }catch(error){
        res.status(500).json({error:'Internal server error while fetching chats'});
    }
});



router.post('/home/user/msg/delete',async(req,res)=>{
    console.log("deleting msg");
    try{
        const messageId=req.body.messageId;
        console.log(messageId);
        const result=await Chat.findByIdAndDelete({_id:messageId});
        if (result) {
            res.status(200).json({ message: 'Message deleted successfully!' });
          } else {
            res.status(404).json({ message: 'Message not found in chat table' });
          }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
    
router.post('/home/user/msg/edit',async(req,res)=>{
    console.log("editing msg");
    try{
        const messageId=req.body.messageId;
        const newMsg=req.body.userInput;
        console.log("editing msg with id="+messageId+" with new msg: "+newMsg);
        const updatedChat=await Chat.findByIdAndUpdate(
            // {_id:'messageId'},
            messageId,
            {
                $set:{'message.text':newMsg}
            },
            {
                new:true
            }
        );
        console.log("updated msg: ",updatedChat);
        if (!updatedChat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        res.status(200).json({ message: 'Message edited successfully!' });

    }catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    res.cookie("jwt","", {maxAge:0});
    res.send({
        message: "success"
    }); 
})

router.get('*',function(req,res){
    res.redirect('/');
});

router.post('/home/user/chat', async(req, res) => {
    let receiver=req.body.receiver;
    let sender=req.body.sender;
    let msg=req.body.text;
    let date=req.body.timestamp;
    const {message}=req.body;

    console.log("id sent is: "+sender);
    const chat=new Chat({
        receiverId:receiver,
        message:
        {
            senderId: sender,
            text: msg,
            timestamp: date
        }
    });
    const result = await chat.save();
    // io.emit('message',message);
    res.send({
        message:"Success!!"
    });
});


module.exports=router;