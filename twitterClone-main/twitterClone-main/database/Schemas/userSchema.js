const mongoose = require('mongoose');
const { POST } = require('../../Shared/constants');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    posts: {
        type: [
            mongoose.Schema.Types.ObjectId
        ],
        default: [],
        required: true,
        ref: POST
    },
    bio: {
        type: String,
        required: false
    },
    followers: {
        type: [
            mongoose.Schema.Types.ObjectId
        ],
        default: [],
        required: true
    },
    following: {
        type: [
            mongoose.Schema.Types.ObjectId
        ],
        default: [],
        required: true
    }
})

userSchema.methods.verifyPassword = async function (givenPassword) {
    return this.password === givenPassword;
}

module.exports = {userSchema}