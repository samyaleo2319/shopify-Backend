const express=require('express');
const app=express();
const {User}=require('./model/User');
const mongoose = require('mongoose');
const cors=require('cors');
const morgan=require('morgan');



// connecting to database
mongoose.connect('mongodb://127.0.0.1:27017/shopifyEcom')
.then(()=>{
    console.log('connected to database');
}).catch((err)=>{
    console.log('data base is not connected',err);
})
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

//middeleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))


//task-1 register route
app.post('/register',async(req,res)=>{
    try {
        const{name,email,password}=req.body;
        //check is field missing
        if(!name || !email || !password ){
            return res.status(400).json({message:'some fields are missing'})
        } 
        //check if user already exits
        const isUserAlreadyExists=await User.findOne({email});
        if (isUserAlreadyExists){
            return res.status(400).json({message:'user already exists'})
        }else{
            //hashing the passing password
            const salt=await bcrypt.genSaltSync(10);
            const hashedpassword=await bcrypt.hashSync(password,salt);
            //jwt token
            const token=jwt.sign({email},'supersecret',{expiresIn:'365d'});

            //creating new user 
            await User.create({
                name,
                email,
                password:hashedpassword,
                token,
                role:'user'

            })
            return res.status(201).json({message:'User created successfully'})
            
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error'})
    }

})
//task 2 create a login page
app.post('/login',async(req,res)=>{
       try {
        const{email,password}=req.body;
        //checking if any field 
        if(!email||!password){
         return res.status(400).json({message:'some fields are missing'})
        }
        //user existes or not
        const user=await User.findOne({email});
        if (!user){
         return res.status(400).json({message:'user does not exits'})
 
        }
        //compare entered password with hashed password
        const isPasswordMatched=await bcrypt.compareSync(password,user.password);
        if (isPasswordMatched) {
            return res.status(400).json({message:'password is incorrect '});
            
        }
        //successfully loged in
        return res.status(200).json(
            {message:'user logged in successfully',
                id:user._id,
                name:user.name,
                email:user.email,
                token:user.token,
                role:user.role
            })
       } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error'})
       }
})



const PORT=8080;
app.listen(PORT,()=>{
    console.log(`server is connected to port ${PORT}`);
})