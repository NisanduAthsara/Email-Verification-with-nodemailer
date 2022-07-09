const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

exports.checkUserToken = async (req,res)=>{
    const token = req.body.token
    if(!token){
        return res.json({
            success:false,
            message:"Unauthorized User...!"
        })
    }
    let decodeToken
    try{
        decodeToken = jwt.verify(token,process.env.TOKEN)
    }catch(err){
        return res.json({
            success:false,
            message:"Unauthorized User...!"
        })
    }

    if(!decodeToken.id){
        return res.json({
            success:false,
            message:"Unauthorized User...!"
        })
    } 


    try {
        const user = await User.findById(decodeToken.id)
        if(!user){
            return res.json({
                success:false,
                message:"Unauthorized User...!"
            })
        }

        if(user.isVerifiedEmail === 'No'){
            return res.json({
                success:false,
                message:"You must verified the email...!"
            })
        }

        return res.json({
            success:true,
            message:"Authorized User...!"
        })

    } catch (error) {
        return res.json({
            success:false,
            message:"Something went wrong...!"
        })
    }

}