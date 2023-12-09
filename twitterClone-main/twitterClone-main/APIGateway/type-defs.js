const { gql } = require('apollo-server');

const typeDefs = gql`
    type Post {
        id: ID!
        content: String!
        owner: String!
        postedDate: String!
        likedBy: [String!]!
    }
    
    type User {
        id: ID!
        name:String!
        username: String!
        bio:String
        followers:[String!]!
        following:[String!]!
        password: String!
        posts: [Post!]!
    }

    input CreateUserInput {
        username: String!
        password: String!
    }

    input CreatePostInput {
        content: String!
    }

    input UserCredentialInput {
        username: String!
        password: String!
    }

    type ProfileForUser {
        name: String!
        username: String!
        followers: Int!
        following: Int!
        bio: String!
        isMyProfile: Boolean!
        isFollowingThisProfile: Boolean
        postCount: Int!
        posts: [Post!]!
    }

    type PostForFeed {
        username: String!
        content: String!
        likeCount: Int!
        postedDate: String!
    }

    type Mutation {
        createUser(input: CreateUserInput!): String!
        loginUser(input: UserCredentialInput): String!
        registerUser(input: UserCredentialInput): String!
        updateMyProfile(newName: String!, newBio: String!): Boolean!
        followAUser(celebrityUsername: String!): Boolean!
        unfollowAUser(celebrityUsername: String!): Boolean!
        makeAPost(input: CreatePostInput!): Boolean!
        deletePost(id: String!): Boolean!
        updatePost(id: String!, newContent: String!): Boolean!
    }

    type Query {
        users: [User!]
        hello: String!
        profileForUser(input: String): ProfileForUser!
        exploreForUsers(celebrityUsername: String!): [ProfileForUser!]!
        feedForUser: [PostForFeed!]!
    }
`

module.exports = {typeDefs}