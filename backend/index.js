const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const routes=require('./routes/routes');



app.use(cors({
    credentials:true,
    origin: ['http://localhost:4200']
}));

app.use(cookieParser());

app.use(express.json());
app.use("/api",routes);
// mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
// // 
// mongoose.connect("mongodb://localhost:27017/telechat",{

mongoose.connect("mongodb://172.17.0.2:27017/telechat",{
    useNewUrlParser:true
}).then(()=>{
    console.log("connected to database");
    app.listen(5000, () => { 
        console.log("App is listening on port 5000");
    })
})