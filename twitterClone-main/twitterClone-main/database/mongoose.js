const mongoose = require('mongoose');
const { MONGO_DB_CONNECTION_URI, STATUS_CODES } = require('./../Shared/constants');
const { User, Post } = require('./Schemas/schemas');

class MongodbClient {
    constructor() {
        if(!MongodbClient.instance){
            this.#connect();
            MongodbClient.instance = this;
        }
        return MongodbClient.instance;
    }

    async #connect() {
        try {
            console.log(MONGO_DB_CONNECTION_URI)
            const db = await mongoose.connect(MONGO_DB_CONNECTION_URI);
            console.log('Instantiated DB connection');
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async registerNewUser(username, password) {
        try {
            const user = new User({
                username: username,
                password: password,
                name: username,
                bio: `I am ${username}`
            });
            const savedUser=await user.save();
            return savedUser;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async createPost(username, content) {
        try {
            const user = await User.findOne({username: username}, {_id: 1, username: 1});
            const post = new Post({
                owner: user._id,
                content: content,
                postedDate: Date.now()
            });
            const savedPost = await post.save();
            await User.findOneAndUpdate({
                username: user.username
            },{
                $push: {
                    posts: savedPost._id
                }
            })
            return savedPost;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async findUserByUsername(username) {
        try {
            const possibleUser = await User.findOne({username: username});
            return possibleUser ? possibleUser : null;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async verifyPasswordForUser(user, password) {
        try {
            return await user.verifyPassword(password);
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async getUserForProfile(username) {
        try {
            const aggregatedUser = await User.aggregate([{
                $match: {
                    username: username
                }
            },{
                $project: {
                    _id: 0,
                    postCount: {$size: '$posts'},
                    followers: {$size: '$followers'},
                    following: {$size: '$following'},
                    username: 1,
                    name: 1,
                    bio: 1,
                    posts: '$posts'
                }
            },{
                $lookup: {
                    from:'posts',
                    localField: 'posts',
                    foreignField: '_id',
                    as: 'posts',
                    pipeline: [{
                        $project: {
                            _id:0,
                            id: '$_id',
                            content: 1,
                            postedDate: 1
                        }
                    },{
                        $sort:{
                            postedDate: -1
                        }
                    }
                ]
                }
            }]);
            return aggregatedUser;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async getUserForExplore(usernameExp, MyUsername) {
        try {
            const regex = new RegExp(`/${usernameExp}/`);
            const meUser = await User.findOne({username: MyUsername},{_id: 1, username: 1});
            const myID = meUser._id;
            const aggregatedUser = await User.aggregate([{
                $match: {
                    username :{
                        $regex: usernameExp,
                        $options: 'i',
                    },
                    _id: {
                        $ne: myID
                    }
                }
            },{
                $project:{
                    _id: 0,
                    followers: {$size: '$followers'},
                    username: 1,
                    name: 1,
                    isFollowingThisProfile: {
                        $in: [myID, '$followers']
                    }               
                }
            }]);
            return aggregatedUser;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async isAFollower(fromUsername, toUsername) {
        try {
            const fromUser = await User.findOne({username: fromUsername}, {username: 1, _id: 1});
            const toUser = await User.findOne({username: toUsername}, {username: 1, _id: 1});
            
            const alreadyFollowing = await User.find({
                username: fromUser.username,
                following: {
                    $in: [toUser._id]
                }
            })
            const alreadyFollower = await User.find({
                username: toUser.username,
                followers: {
                    $in: [fromUser._id]
                }
            })
            console.log(alreadyFollowing.length, alreadyFollower.length, 'already following')
            if(alreadyFollowing.length !== 0 || alreadyFollower.length !== 0)
                return true;
            else
                return false;
        } catch (error) {
            console.log(error);
        }
    }

    async updateMyUserNameBio(username, newName, newBio) {
        try {
            const response = await User.findOneAndUpdate({
                username: username
            },{
                name: newName,
                bio: newBio
            })
            return response;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async processFollowingRequest(fromUsername, toUsername){
        try {
            const verdict = await this.isAFollower(fromUsername, toUsername);
            const fromUser = await User.findOne({username: fromUsername}, {username: 1, _id: 1});
            const toUser = await User.findOne({username: toUsername}, {username: 1, _id: 1});
            console.log(verdict)
            if(verdict)
                return true;
            await User.findOneAndUpdate({
                username: fromUsername
            },{
                $push:{
                    following: toUser._id
                }
            });
            await User.findOneAndUpdate({
                username: toUsername
            },{
                $push: {
                    followers: fromUser._id
                }
            })
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async processUnfollowRequest(fromUsername, toUsername){
        try {
            const verdict = await this.isAFollower(fromUsername, toUsername);
            const fromUser = await User.findOne({username: fromUsername}, {username: 1, _id: 1});
            const toUser = await User.findOne({username: toUsername}, {username: 1, _id: 1});
            console.log(verdict)
            if(!verdict)
                return true;
            await User.findOneAndUpdate({
                username: fromUsername
            },{
                $pull:{
                    following: toUser._id
                }
            });
            await User.findOneAndUpdate({
                username: toUsername
            },{
                $pull: {
                    followers: fromUser._id
                }
            })
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async getFeedForUser(username) {
        try {
            const meUser = await User.findOne({username: username}, {_id: 1, following: 1});
            console.log(meUser._id);
            const feed = await Post.aggregate([{
                $match: {
                    owner: {
                        $ne: meUser._id,
                        $in: meUser.following
                    },
                }
            },{
                $lookup: {
                    from: 'accounts',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner_info'
                }
            },{
                $unwind: '$owner_info'
            },{
                $project: {
                    content: 1,
                    _id: 0,
                    likeCount: {$size: '$likedBy'},
                    username: '$owner_info.username',
                    postedDate: 1
                }
            },{
                $sort: {postedDate: -1}
            }]);
            return feed;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async getPostById(id) {
        try {
            const post = await Post.findById(id, {
                _id: 1,
                owner: 1
            })
            return post;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deletePostByIdForUser(id, userID) {
        try {
            await User.findByIdAndUpdate(userID, {
                $pull: {
                    posts: id
                }
            })
            const post = await Post.findOneAndDelete({_id: id})
            
        } catch (error) {
            throw new Error(error.message);
        }
    }
    async updatePostByIdForUser(id, userID, newContent) {
        try {
            const post = await Post.findOneAndUpdate({_id: id},{
                content: newContent,
                postedDate: Date.now()
            });
            
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
        } catch (error) {
            console.log(error);
        }
    }
}

const client = new MongodbClient();

module.exports = { client }