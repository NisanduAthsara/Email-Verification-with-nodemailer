const mongoose = require("mongoose");

const verifySchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
		required: true
    },
    code:{
        type: String,
		required: true,
        unique:true
    }
})

module.exports = mongoose.model("Verification", verifySchema);