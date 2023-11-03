const mongoose = require("mongoose")
const Schema = mongoose.Schema

const messagesSchema = new Schema ({
    roomId: {
        type: String,
        required: true
    },
    usernameOne: {
        type: String,
        required: true
    },
    usernameOneId: {
        type: String,
        required: true
    },
    usernameTwo: {
        type:String,
        required: true
    },
    usernameTwoId: {
        type:String,
        required: true
    },
    messages: {
        type: [],
        required: false
    }
})

const Messages = mongoose.model ("messages", messagesSchema)
module.exports   = Messages