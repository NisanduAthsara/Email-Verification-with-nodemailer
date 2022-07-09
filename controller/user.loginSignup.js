const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const generateUniqueId = require('generate-unique-id');
const Verification = require('../models/email.verify.model')
const {verifySignUpData} = require('../utils/user.funcs')
const nodemailer = require('nodemailer')

exports.signup = (req,res)=>{
    if(req.body){
        const {username,email,password} = req.body
        verifySignUpData(username,email,password)
            .then(()=>{
                User.findOne({email})
                    .then((count)=>{
                        if(count){
                            return res.send({
                                success: false,
                                message: "Email is already in use!",
                            });
                        }

                        bcrypt.hash(password,10).then((newPassword)=>{
                            const newUser = new User({
                                username,
                                email,
                                password:newPassword,
                            })

                            newUser.save(newUser)
                                .then((user)=>{
                                    const userID = user._id
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
                                        to:email,
                                        subject:'Email Verification',
                                        html:`<h1>Your Code : ${id}`
                                    }
                                    
                                    transport.sendMail(mailOptions,(err,info)=>{
                                        if(err){
                                            console.log(err)
                                        }
                                    })

                                    bcrypt.hash(id,10).then((newCode)=>{
                                        const newVerification = new Verification({
                                            userId:userID,
                                            code:newCode
                                        })
                                        newVerification.save(newVerification)
                                            .then(()=>{
                                                const token = jwt.sign({id:user._id},process.env.TOKEN,{expiresIn: "48h"})
                                                return res.send({
                                                    success:true,
                                                    message:'User Successfully Registered!',
                                                    token
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
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    res.send({
                                        success: false,
                                        message: "Unable to add user",
                                    });
                                })
                        })
                    })
            })
            .catch((err) => {
                res.send({
                    success: false,
                    message: err,
                });
            });
    }else{
        return res.json({
            success:false,
            message:"Something went wrong...!"
        })
    }
}


exports.login = (req,res)=>{
    if(req.body){
        const {email,password} = req.body
        User.findOne({email})
            .then((user)=>{
                if(user){
                    bcrypt.compare(password,user.password,(err,result)=>{
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
                                message:"Invalid Password"
                            })
                        }

                        const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
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
                }else{
                    return res.json({
                        success:false,
                        message:"Invalid Email"
                    })
                }

            })
            .catch((err)=>{
                console.log(err.message)
                return res.json({
                    success:false,
                    message:"Something went wrong...!"
                })
            })
    }else{
        return res.json({
            success:false,
            message:"Something went wrong...!"
        })
    }
}