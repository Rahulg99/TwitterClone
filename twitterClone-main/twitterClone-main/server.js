const express = require('express');
const cors = require('cors');
const { generateJWTWebTokenPayload } = require('./Shared/utility');
const { client } = require('./database/mongoose');
const { ApolloServer } = require('apollo-server');
const { typeDefs } = require('./APIGateway/type-defs');
const { resolvers } = require('./APIGateway/resolvers');
const { JWT_HEADER_KEY } = require('./Shared/constants');
require('dotenv').config()

const apolloServer = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: (({ req }) => {
        const jwtToken = req.headers.authorization;
        return {
            ...req,
            [JWT_HEADER_KEY]: jwtToken
        }
    })
});

apolloServer.listen(process.env.PORT).then(({url}) => {
    console.log('graphql is running on url', url)
})
