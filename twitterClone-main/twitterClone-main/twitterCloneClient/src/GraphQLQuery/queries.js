import {gql} from '@apollo/client';

export const LOGIN_USER = gql`
    mutation LoginUser($input: UserCredentialInput) {
        loginUser(input: $input)
    }
`

export const REGISTER_USER = gql`
    mutation RegisterUser($input: UserCredentialInput) {
        registerUser(input: $input)
    }
`
export const HELLO_AUTH = gql`
    query Query {
        hello
    }
`

export const PROFILE_FOR_USER = gql`
    query Query($input: String) {
        profileForUser(input: $input) {
            bio
            followers
            following
            isFollowingThisProfile
            isMyProfile
            name
            postCount
            username
            posts {
                id
                content
                postedDate
            }
        }
    }
`
export const UPDATE_MY_PROFILE = gql`
    mutation Mutation($newName: String!, $newBio: String!) {
        updateMyProfile(newName: $newName, newBio: $newBio)
    }
`
export const UPDATE_MY_POST = gql`
    mutation UpdatePost($updatePostId: String!, $newContent: String!) {
        updatePost(id: $updatePostId, newContent: $newContent)
    }
`

export const FOLLOW_A_USER = gql`
    mutation FollowAUser($celebrityUsername: String!) {
        followAUser(celebrityUsername: $celebrityUsername)
    }
`

export const UNFOLLOW_A_USER = gql`
    mutation Mutation($celebrityUsername: String!) {
        unfollowAUser(celebrityUsername: $celebrityUsername)
    }
`

export const MAKE_A_POST = gql`
    mutation Mutation($input: CreatePostInput!) {
        makeAPost(input: $input)
    }
`

export const EXPLORE_FOR_USERS = gql`
    query Query($celebrityUsername: String!) {
        exploreForUsers(celebrityUsername: $celebrityUsername) {
            followers
            isFollowingThisProfile
            name
            username
        }
    }
`
export const DELETE_POST = gql`
    mutation DeletePost($deletePostId: String!) {
        deletePost(id: $deletePostId)
    }
`

export const FEED_FOR_USER = gql`
    query Query {
        feedForUser {
            content
            likeCount
            username
            postedDate
        }
    }
`