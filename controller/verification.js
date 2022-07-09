const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const generateUniqueId = require('generate-unique-id');
const Verification = require('../models/email.verify.model')
const nodemailer = require('nodemailer')

exports.newVerification = (req,res)=>{
    if(!req.body){
        return res.json({
            success:false,
            message:"Something went wrong...!"
        })
    }
    const {userId} = req.body
    Verification.findOne({userId})
        .then((verify)=>{
            if(!verify){
                return res.json({
                    success:false,
                    message:"Something went wrong...!"
                })
            }
            User.findById(userId)
                .then((user)=>{
                    const verifyId = verify._id
                    const id = generateUniqueId({
                        length: 10,
                        useLetters: false
                    });

                    const transport = nodemailer.createTransport({
                        service:'gmail',
                        auth:{
                            user:process.env.EMAIL,
                            pass:process.env.PASSWORD
                        },
                        secureConnection: 'false',
                        tls: {
                            ciphers: 'SSLv3',
                            rejectUnauthorized: false
                        }
                    })

                    const mailOptions = {
                        from:process.env.EMAIL,
                        to:user.email,
                        subject:'Email Verification',
                        html:`<h1>Your New Code : ${id}`
                    }
                    
                    transport.sendMail(mailOptions,(err,info)=>{
                        if(err){
                            console.log(err)
                        }
                    })

                    bcrypt.hash(id,10).then((newCode)=>{
                        const newObj = {
                            userId,
                            code:newCode
                        }
                        Verification.findByIdAndUpdate(verifyId,newObj,{useFindAndModify:false})
                            .then((newOne)=>{
                                if(!newOne){
                                    return res.json({
                                        success:false,
                                        message:"Something went wrong...!"
                                    })
                                }
                                return res.json({
                                    success:true,
                                    message:"Successfully changed the verification code...!"
                                })
                            })
                            .catch((err)=>{
                                console.log(err);
                                res.send({
                                    success: false,
                                    message: "Unable to add user",
                                });
                            })
                        })
                .catch((err)=>{
                    console.log(err)
                    return res.json({
                        success:false,
                        message:"Something went wrong...!"
                    })
                })
            })
        })
        .catch((err)=>{
            console.log(err)
            return res.json({
                success:false,
                message:"Something went wrong...!"
            })
        })
}


exports.checkVerification = (req,res)=>{
    if(!req.body){
        return res.json({
            success:false,
            message:"Something went wrong...!"
        })
    }
    const {userId,code} = req.body
    Verification.findOne({userId})
        .then((verify)=>{
            if(!verify){
                return res.json({
                    success:false,
                    message:"Something went wrong...!"
                })
            }
            bcrypt.compare(code,verify.code,(err,result)=>{
                if(err){
                    console.log(err)
                    return res.json({
                        success:false,
                        message:"Something went wrong"
                    })
                }
                if(!result){
                    return res.json({
                        success:false,
                        message:"Invalid Code"
                    })
                }
                User.findById(userId)
                    .then((user)=>{
                        const {username,email,password} = req.body
                        const updatedObj = {
                            username,
                            email,
                            password,
                            isVerifiedEmail:'Yes'
                        }
                        User.findByIdAndUpdate(userId,updatedObj,{useFindAndModify:false})
                            .then((user)=>{
                                const userID = user._id
                                if(!user){
                                    return res.json({
                                        success:false,
                                        message:"Something went wrong...!"
                                    })
                                }
                                Verification.findOneAndDelete({userId})
                                    .then((delOne)=>{
                                        if(!delOne){
                                            return res.json({
                                                success:false,
                                                message:"Something went wrong...!"
                                            })
                                        }
                                        const token = jwt.sign({ id: userID }, process.env.TOKEN, {
                                            expiresIn: "48h",
                                        });
                
                                        return res.json({
                                            success:true,
                                            message: "User logged in successfully!",
                                            expiresIn: new Date(
                                                new Date().getTime() + 172800000
                                            ).getTime(),
                                            token,
                                        })
                                    })
                                    .catch((err)=>{
                                        return res.json({
                                            success:false,
                                            message:"Something went wrong...!"
                                        })
                                    })
                            })
                            .catch((err)=>{
                                console.log(err)
                                return res.json({
                                    success:false,
                                    message:"Something went wrong...!"
                                })
                            })
                    })
                    .catch((err)=>{
                        return res.json({
                            success:false,
                            message:"Something went wrong...!"
                        })
                    })
            })
        })
        .catch((err)=>{
            return res.json({
                success:false,
                message:"Something went wrong...!"
            })
        })
}