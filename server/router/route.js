const Router=require('express')
const router=Router.Router()

/* import all controllers */
const {verifyUser,register,login,getUser,updateUser,generateOTP,verifyOTP,createResetSession,resetPassword}=require('../controller/appController')
const {Auth,localVariables}=require('../middleware/auth')
const {registerMail}=require('../controller/mailer')
/* POST methods */
//register user
router.route('/register').post(register) 
//send the email
router.route('/registerMail').post(registerMail)
// authenticate user
router.route('/authenticate').post(verifyUser,(req,res)=>res.end())
// login in app
router.route('/login').post(verifyUser,login)

/* GET methods */
// user with username
router.route('/user/:username').get(getUser)
// generate random OTP
router.route('/generateOTP').get(verifyUser,localVariables,generateOTP)
// verify generated OTP
router.route('/verifyOTP').get(verifyUser,verifyOTP)
// reset all the variables
router.route('/createResetSession').get(createResetSession)

/* PUT methods */
// is use to update the user profile
router.route('/updateuser').put(Auth,updateUser)
// is use to setting up the new password
router.route('/resetPassword').put(verifyUser,resetPassword)
module.exports=router