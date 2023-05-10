// make API requests
import axios from 'axios'
import jwt_decode from 'jwt-decode'
axios.defaults.baseURL=process.env.REACT_APP_SERVER_DOMAIN
// to get username from token
export async function getUsername(){
    const token=localStorage.getItem('token')
    if(!token){
        return "cannot find token"
    }
    let decode=jwt_decode(token)
    return decode
}
// authenticate function
export async function authenticate(username){
    try {
        return await axios.post('/api/authenticate',{username})
    } catch (error) {
        return {error:"username doesn't exists"}
    }
}
export async function getUser({username}){
    try {
        const {data}= await axios.get(`/api/user/${username}`)
        return {data}
    } catch (error) {
        return {error:"username doesn't exists"}
    }
}

export async function registerUser(credentials){
    try {
        const {data:{msg},status}= await axios.post(`/api/register`,credentials)
        let {username,email}=credentials
        // console.log(status)
        // if(status===201){
        //     await axios.post('/api/registerMail',{username,userEmail:email,text:msg})
        // }
        return {msg}
    } catch (error) {
        return {error:"username doesn't exists"}
    }
}

export async function verifyPassword({username,password}){
    try {
        if(username){
            const {data}=await axios.post('/api/login',{username,password})
            return {data}
        }
    } catch (error) {
        return {error:"password doesn't match"}
    }
}
export async function updateUser(response){
    try {
        const token=await localStorage.getItem('token')
        const data=await axios.put('/api/updateuser',response,{headers:{"Authorization":`Bearer ${token}`}})
        return {data}
    } catch (error) {
        return {error:"couldn't update profile"}
    }
}
export async function generateOTP(username){
    try {
        const {data:{code},status}=await axios.get('/api/generateOTP',{params:{username}})

        // send mail with OTP
        if(status===201){
            let {data:{email}}=await getUser({username})
            let text=`your password recovery OTP is ${code}. verify and recover your password`
            await axios.post('/api/registerMail',{username,userEmail:email,text,subject:"password recovery OTP"})
            
        }
        return {code}
        
    } catch (error) {
        return {error}
    }
}
export async function verifyOTP({username,code}){
    try {
        const {data,status}=await axios.get('/api/verifyOTP',{params:{username,code}})
        return {data,status}
    } catch (error) {
        return {error}
    }
}
export async function resetPassword({username,password}){
    try {
        const {data,status}=await axios.put('/api/resetPassword',{username,password})

        return {data,status}
    } catch (error) {
        return {error}
    }
}