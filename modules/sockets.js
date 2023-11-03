// const express = require('express');
// const app = express();
// const cors = require ('cors');

const { Server } = require('socket.io');
const jwt = require("jsonwebtoken");
const userDb = require("../schemas/userSchema");
const postsDb = require("../schemas/postSchema");
const messageDb = require("../schemas/messagesSchema")
const { v4: uuidv4} = require('uuid')

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
        },
    });
    io.on('connection', (socket)=> {
        socket.on ("autoLogin", async token=> {

            if (!token) return;
            jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
                if (err) {
                    return console.log("error")
                } else {
                    const user = await userDb.findOne({_id: data._id}, {password: 0})
                    socket.emit ('autoLoginInfo', user)
                }
            });
        })
        socket.on("newPost", info => {
            if (!info.image.startsWith('http://') && !info.image.startsWith('https://')) {
                return
            }
            const user = new postsDb({
                username: info.username,
                userId: info.userId,
                title: info.title,
                image: info.image,
                userImage: info.userImage,
                date: info.date,
            });

            user.save().then(async () => {
                const allPost = await postsDb.find();
                io.emit('addAllPost', allPost)

            }).catch(error => {
                console.error("Error saving post:", error);
            });
        });
        socket.on('newComment', async (info) => {
            const newComment = {
                comment: info.comment,
                username: info.username
            };
            const updatedPost = await postsDb.findOneAndUpdate(
                { _id: info.postId },
                { $push: { comments: newComment } },
                { new: true }
            );
            const onePost = await postsDb.findOne({ _id: info.postId });
            io.emit('addOnePost', updatedPost);

            const allPosts = await postsDb.find({});
            io.emit('addAllPost', allPosts)
        });
        socket.on('newLike', async (info) => {
            try {
                const currentPost = await postsDb.findOne({ _id: info.postId });
                if (currentPost.likes.includes(info.username)) {
                    await postsDb.findOneAndUpdate(
                        { _id: info.postId },
                        { $pull: { likes: info.username }},
                        { new: true }
                    );
                } else {
                    await postsDb.findOneAndUpdate(
                        { _id: info.postId },
                        { $addToSet: { likes: info.username } },
                        { new: true }
                    );
                }
                const updatedPost = await postsDb.findOne({ _id: info.postId });
                io.emit('addOnePost', updatedPost);

                const allPosts = await postsDb.find({});
                io.emit('addAllPost', allPosts);
            } catch (err) {
                console.error("Error processing like:", err);
            }
        });
        socket.on('usersUpdate', async (info) => {
            try {
                const allUsers = await userDb.find()
                io.emit("addAllUser", allUsers)
            } catch (err) {
                console.error("Error processing like:", err);
            }
        })
        socket.on('newMessage', async (info) => {
            try {
                const messageInfo = {
                    msgTo: info.username,
                    msgToId: info.userId,
                    msgFromId: info.myId,
                    msgFrom: info.myUsername,
                    message: info.message
                };
                const message = {
                    msgTo: info.username,
                    msgFrom: info.myUsername,
                    message: info.message
                };
                let existingChat = await messageDb.findOne({
                    $or: [
                        { usernameOneId: messageInfo.msgFromId, usernameTwoId: messageInfo.msgToId },
                        { usernameOneId: messageInfo.msgToId, usernameTwoId: messageInfo.msgFromId }
                    ]
                });
                let msgNew = null
                if (!existingChat) {
                    const newChatRoom = new messageDb({
                        roomId: uuidv4(),
                        usernameOneId: messageInfo.msgFromId,
                        usernameTwoId: messageInfo.msgToId,
                        usernameOne: messageInfo.msgFrom,
                        usernameTwo: messageInfo.msgTo,
                        messages: [message]
                    });
                    existingChat = await newChatRoom.save();
                } else {
                    msgNew = await messageDb.findOneAndUpdate(
                        { _id: existingChat._id },
                        { $push: { messages: message }},
                        {new: true}
                    );
                }
                const roomId = String(existingChat._id);
                socket.join(roomId)
                if (msgNew!== null) {
                    io.to(msgNew.roomId).emit('newMsg',msgNew);
                }
                socket.to(roomId).emit('newMessageInRoom', message);
            } catch (err) {
                console.error("Error processing message", err);
            }
        });
        socket.on('joinChat', async (roomId) => {
            socket.join(roomId)
        });
        socket.on('sendMessage', async (info) => {
            const msg = {
                message: info.message,
                msgFrom: info.msgFrom
            }
            const chat = await messageDb.findOneAndUpdate(
                {roomId:info.roomId},
                {$push: { messages: msg }},
                {new: true}
            )
            io.to(info.roomId).emit('newMsg', chat);
        });
    });
}