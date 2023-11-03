const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    image: {
        type:String,
        required:false,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
    }
})

const User = mongoose.model ("User", userSchema)
module.exports   = User