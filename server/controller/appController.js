
const bcrypt =require('bcrypt')
const UserModel =require('../model/User.model.js')
const jwt =require('jsonwebtoken')
const ENV=require('../config')
const otpGenerator=require('otp-generator')
/* middleware for verify user */
async function verifyUser(req,res,next){
    try{
        const {username}=req.method=="GET"?req.query:req.body 
        // check the user existance
        let exist=await UserModel.findOne({username:username})
        if(!exist){
            return res.status(404).send({error:"can't find user!"})
        }
        next()
    }catch(error){
        return res.status(404).send({error:"Authentication Error"})
    }
}
function register(req,res){
        const { username, password, profile, email } = req.body;        
        // res.status(201).send({msg:"done"})
        let errors = [];
   
        /* If condition to check whether all credentials are filled */
        
        UserModel.findOne({ username: username }).then(user => {
            if (user) {
              errors.push({ msg: 'username already exists' });
              res.send('register username exists');
            }
             
           /* Creating the user */
           else {
                UserModel.findOne({ email: email }).then(useremail => {
                    if (useremail) {
                        errors.push({ msg: 'Email already exists' });
                        res.send('register user email exists');
                    }
                    else{
                        const newUser = new UserModel({
                            username,
                            email,
                            password,
                            profile
                        });
                           
                          /* Bcrypt hashing the password for user privacy */
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then(user => {
                                    res.send("Register Successful");
                                    })
                                    .catch(err => console.log(err));
                                });
                          });
                    }
                })
              
            }
          });
}



function login(req,res){
    // res.json('login route')
    const {username,password}=req.body
    UserModel.findOne({username:username}).then(user=>{
        if(!user){
            res.status(404).send({msg:"Username not exists"})
        }
        else{
            bcrypt.compare(password,user.password)
                .then(passwordCheck=>{
                    if(!passwordCheck){
                        return res.status(400).send({error:"don't have password"})
                    }
                    // create jwt token
                    const token=jwt.sign({
                        userId:user._id,
                        username:user.username
                    },ENV.JWT_SECRET,{expiresIn:'24h'})
                    return res.status(200).send({
                        msg:"Login Successful...!",
                        username:user.username,
                        token
                    })


                }).catch(error=>{
                    return res.status(400).send({error:"password does not match"})
                })
        }
    })
}
function getUser(req,res){
    // res.json('getUser route')
    // console.log("hello")
    const {username}=req.params 
    // console.log(username)
    
        if(!username){
            return res.status(501).send({error:"Invalid Username"})


        }
        UserModel.findOne({username:username}).then(user=>{
            // if(err){
            //     return res.status(500).send({err})
            // }
            if(!user){
                return res.status(501).send({error:"couldn't find the user"})

            }
            /* remove password from the user,
                as mongoose provides all unnecessary data with the object,
                we need to transform it into json object and then return 
            */
            const {password,...rest}=Object.assign({},user.toJSON())
            return res.status(201).send(rest)
        })
}
function updateUser(req,res){
    // res.json('updateUser route')
    try {
        const {userId}=req.user 
        if(userId){
            const body=req.body 
            // update the data
            UserModel.updateOne({_id:userId},body).then((data)=>{
                if(!data){
                    return res.status(401).send({error:"cannot update the data"})
                }
                return res.status(201).send({msg:"record updated"})
            })
        }
        else{
            return res.status(401).send({error:"user not found"})
        }
    } catch (error) {
        return res.status(401).send({error})
    }
}
async function generateOTP(req,res){
    // res.json('generateOTP route')
    req.app.locals.OTP=await otpGenerator.generate(6,{
        lowerCaseAlphabets:false,
        upperCaseAlphabets:false,
        specialChars:false
    })
    res.status(201).send({code:req.app.locals.OTP})
}
async function verifyOTP(req,res){
    // res.json('verifyOTP route')
    const {code}=req.query
    if(parseInt(req.app.locals.OTP)===parseInt(code)){
        req.app.locals.OTP=null
        // start the session for reset password
        req.app.locals.resetSession=true
        return res.status(201).send({msg:"verify sucessfully"})
    }
    return res.status(400).send({error:"invalid otp"})
}
async function createResetSession(req,res){
    // res.json('createResetSession route')
    if(req.app.locals.resetSession){
        
        return res.status(201).send({flag:req.app.locals.resetSession})
    }
    return res.status(440).send({error:"session expired"})
}
async function resetPassword(req,res){
    // res.json('resetPassword route')
    try {
        if(!req.app.locals.resetSession){
            return res.status(440).send({error:"session expired"})
        }
        const {username,password}=req.body
        try {
            UserModel.findOne({username:username})
                .then(user=>{
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(password,salt,(err,hash)=>{
                            if(err){
                                return res.status(500).send({error:"enable to hashed password"})
                            }
                            UserModel.updateOne({username:username},{password:hash})
                                .then(data=>{
                                    if(!data){
                                        return res.status(500).send({error:"cannot update"})
                                    }
                                    req.app.locals.resetSession=false
                                    return res.status(201).send({msg:"password reset successfully"})
                                })
                        })  
                            
                    })
                })
                .catch(error=>{
                    return res.status(404).send({
                        error:"username not found"
                    })
                })
        } catch (error) {
            return res.status(500).send({error})
        }
    } catch (error) {
        return res.status(500).send({error})
    }
}

module.exports= {verifyUser,register,login,getUser,updateUser,generateOTP,verifyOTP,createResetSession,resetPassword}