const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const uuid = require('uuid');
const { GraphQLError } = require('graphql');
const Book = require('./models/book');
const Author = require('./models/author');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to mongodb'))
  .catch((error) => console.log('error connecting to mongodbb', error.message));

const typeDefs = `
   type Author {
    name: String!
    born: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
  }

  type Query{
    bookCount: Int!
    authorCount: Int!
    allBooks(author:String, genre:String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ):Book

    addAuthor(
      name: String!
      born: Int
    ):Author!

    editAuthor(
        name:String!, 
        setBornTo:Int!
    ):Author
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate('author');
      }
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (args.genre) {
          return Book.find({
            author: author._id,
            genres: args.genre,
          }).populate('author');
        }
        return Book.find({ author: author._id }).populate('author');
      }


      return Book.find({
        genres: { $elemMatch: { $eq: args.genre } },
      }).populate('author');
    },
    allAuthors: async () => Author.find({}),
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      try {
        const newBook = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author._id,
        });
        await newBook.save();
        return Book.populate(newBook, 'author');
      } catch (error) {
        console.log(error);

        throw new GraphQLError('Saving user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }
    },

    addAuthor: async (root, args) => {
      const author = new Author({ ...args });
      return author.save();
    },

    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError('Saving born failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }

      return author;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
