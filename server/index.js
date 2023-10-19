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
    id:ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id:ID!
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
      if (!args.author && !args.genere) {
        return Book.find({});
      }
      let authorBooks;
      if (args.author && args.genre) {
        authorBooks = books.filter((b) => b.author === args.author);
        authorBooks = authorBooks.filter((b) => b.genres.includes(args.genre));
      } else if (args.author) {
        authorBooks = books.filter((b) => b.author === args.author);
      } else if (args.genre) {
        authorBooks = books.filter((b) => b.genres.includes(args.genre));
      }
      return authorBooks;
    },
    allAuthors: async () => Author.find({}),
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.name });
      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      console.log(author);
      try {
        const newBook = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author._id,
        });
        return newBook.save();
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

    editAuthor: (root, args) => {
      const author = authors.find((a) => a.name === args.name);
      console.log(author, args);
      if (!author) {
        throw new GraphQLError('Author does not exists', {
          extensions: {
            code: 'AUTHOR_NOT_FOUND',
            invalidArgs: args.name,
          },
        });
      }
      const updatedAuthor = { ...author, born: args.setBornTo };
      authors = authors.map((a) => (a.name === args.name ? updatedAuthor : a));
      return updatedAuthor;
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
