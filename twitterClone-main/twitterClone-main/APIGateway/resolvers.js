const usersList = [
    {
        id:1,
        username: 'joy',
        password: 'sen'
    }
]

const { ApolloError } = require('apollo-server');
const { client } = require('./../database/mongoose');
const { STATUS_CODES, JWT_HEADER_KEY } = require('../Shared/constants');
const { generateJWTWebTokenPayload, verifyJWTToken } = require('../Shared/utility');

const resolvers = {
    Mutation: {
        createUser: (_, args) => {
            console.log(args);
            return 'jwttoken'
        },
        loginUser: async (_, args) => {
            const username = args.input.username;
            const password = args.input.password;
            console.log(username, password);
            try {
                const user = await client.findUserByUsername(username);
                if(!user) {
                    throw new ApolloError('Username not found', STATUS_CODES.UNAUTHORIZED);
                } else {
                    const verdict = await client.verifyPasswordForUser(user, password);
                    console.log('verdict', verdict);
                    if(verdict)
                        return generateJWTWebTokenPayload({username, password});
                    else
                        throw new ApolloError('username or password incorrect', STATUS_CODES.UNAUTHORIZED);
                }
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
            
        },
        registerUser: async (_, args) => {
            const username = args.input.username;
            const password = args.input.password;
            try {
                const user = await client.findUserByUsername(username);
                if(user)
                    throw new ApolloError('Username already taken', STATUS_CODES.UNAUTHORIZED);
                else {
                    const user = await client.registerNewUser(username, password);
                    const payload = generateJWTWebTokenPayload({username, password});
                    console.log('payload', payload)
                    return payload
                }
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        updateMyProfile: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const username = verifiedToken.username;
                await client.updateMyUserNameBio(username, args.newName, args.newBio);
                console.log('updated user', username)
                return true;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        followAUser: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                console.log(MyUsername, 'has requested to follow a user')
                if(args.celebrityUsername === MyUsername)
                    throw new ApolloError('Can not Follow yourself', STATUS_CODES.FORBIDDEN)
                await client.processFollowingRequest(MyUsername, args.celebrityUsername);
                console.log('following a user');
                return true;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        unfollowAUser: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                console.log(MyUsername, 'has requested to unfollow a user')
                if(args.celebrityUsername === MyUsername)
                    throw new ApolloError('Can not unfollow yourself', STATUS_CODES.FORBIDDEN)
                await client.processUnfollowRequest(MyUsername, args.celebrityUsername);
                console.log('unfollowing a user');
                return true;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        makeAPost: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                const user = await client.findUserByUsername(MyUsername);
                if(!user) {
                    throw new ApolloError('Username not found', STATUS_CODES.UNAUTHORIZED);
                }
                const response = await client.createPost(MyUsername, args.input.content);
                console.log(response);
                return true;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        deletePost: async(_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                const user = await client.findUserByUsername(MyUsername);
                console.log(args.id, 'post ID');
                const post = await client.getPostById(args.id);
                if(!post)
                    throw new ApolloError('POST_NOT_FOUND', STATUS_CODES.ERROR_NOT_FOUND);
                if(!post.owner.equals(user._id))
                    throw new ApolloError('UNAUTHORIZED', STATUS_CODES.UNAUTHORIZED);
                await client.deletePostByIdForUser(args.id, user._id)
                return true;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        updatePost: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                const user = await client.findUserByUsername(MyUsername);
                console.log(args.id, 'post ID');
                const post = await client.getPostById(args.id);
                if(!post)
                    throw new ApolloError('POST_NOT_FOUND', STATUS_CODES.ERROR_NOT_FOUND);
                if(!post.owner.equals(user._id))
                    throw new ApolloError('UNAUTHORIZED', STATUS_CODES.UNAUTHORIZED);
                console.log(args)
                await client.updatePostByIdForUser(args.id, user._id, args.newContent);
                return true;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        }
    },
    Query: {
        users: (_, args) => {
            console.log(args);
            return usersList
        },
        hello: (_, args, context) => {
            try {
                verifyJWTToken(context[JWT_HEADER_KEY])
            } catch (error) {
                throw new ApolloError('Token as Expired, login again', STATUS_CODES.UNAUTHORIZED_TOKEN);
            }
            return 'Verified User';
        },
        profileForUser: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const username = args.input ? args.input : verifiedToken.username;
                console.log(username, 'PAY ATTENTION TO THIS')
                const aggregatedUser = await client.getUserForProfile(username);
                if(aggregatedUser.length === 0)
                    throw new ApolloError('User not found', STATUS_CODES.ERROR_NOT_FOUND);
                const user = aggregatedUser[0];
                const isMyProfile = args.input ? (args.input === verifiedToken.username ? true : false) : true;
                if(isMyProfile){
                    const myProfile = {...user, isMyProfile}
                    console.log(myProfile)
                    return myProfile;
                } else {
                    const isFollowingThisProfile = await client.isAFollower(verifiedToken.username, args.input);
                    const otherProfile={...user, isMyProfile, isFollowingThisProfile};
                    console.log(otherProfile)
                    return otherProfile
                }
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        exploreForUsers: async (_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                console.log(args)
                const aggregatedUser = await client.getUserForExplore(args.celebrityUsername, MyUsername);
                console.log(aggregatedUser);
                return aggregatedUser;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        },
        feedForUser: async(_, args, context) => {
            try {
                const verifiedToken=verifyJWTToken(context[JWT_HEADER_KEY]);
                const MyUsername = verifiedToken.username;
                const myFeed = await client.getFeedForUser(MyUsername);
                return myFeed;
            } catch (error) {
                throw new ApolloError(error.message, error.extensions ? error.extensions.code : STATUS_CODES.SERVER_ERROR);
            }
        }
    }
}

module.exports = {resolvers}