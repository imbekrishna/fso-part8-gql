require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/user');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to mongodb'))
  .catch((error) => console.log('error connecting to mongodbb', error.message));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;

    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
