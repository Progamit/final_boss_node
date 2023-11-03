const mongoose = require("mongoose")
const Schema = mongoose.Schema

const postSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    userImage:{
        type:String,
        required:true
    },
    userId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required:true
    },
    title:{
        type: String,
        required: true
    },
    image: {
        type:String,
        required:true,
    },
    comments: {
        type: [],
        required: false
    },
    likes: {
        type:[],
        required:false
    }
})

const Posts = mongoose.model ("posts", postSchema)
module.exports   = Posts