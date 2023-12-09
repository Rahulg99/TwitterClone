const mongoose = require('mongoose');
const { USER } = require('../../Shared/constants');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER,
        required: true
    },
    postedDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    likedBy: {
        type: [
            mongoose.Schema.Types.ObjectId
        ],
        default: [],
        require: true
    }
})

module.exports = {postSchema}