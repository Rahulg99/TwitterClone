const mongoose = require("mongoose");
const { userSchema } = require("./UserSchema");
const { postSchema } = require("./postSchema");
const { USER, POST } = require("../../Shared/constants");

const User = mongoose.model(USER, userSchema)
const Post = mongoose.model(POST, postSchema)

module.exports = {
    User,
    Post
}