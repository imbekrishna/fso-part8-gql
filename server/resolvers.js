const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');

const pubsub = new PubSub();

const resolvers = {
  Author: {
    bookCount: async (root) => {
      return root.books.length;
    },
  },

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
    allAuthors: async () => Author.find({}).populate('books'),
    me: (root, args, context) => context.currentUser,
    recommended: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      return Book.find({
        genres: { $elemMatch: { $eq: currentUser.favoriteGenre } },
      }).populate('author');
    },
    allGenres: async (root, args) => {
      const [data] = await Book.aggregate([
        {
          $unwind: '$genres',
        },
        {
          $group: {
            _id: null,
            genres: { $addToSet: '$genres' },
          },
        },
        {
          $project: {
            _id: 0,
            genres: 1,
          },
        },
      ]);
      return data.genres.sort();
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

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
        author.books = author.books.concat(newBook._id);
        await author.save();

        const book = await Book.populate(newBook, 'author');

        pubsub.publish('BOOK_ADDED', { bookAdded: book });

        return book;
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

    addAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const author = new Author({ ...args });

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }

      return author.save();
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

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

    createUser: async (root, args) => {
      const user = new User({ ...args });

      return user.save().catch((error) => {
        throw new GraphQLError('Error saving user', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args``,
          },
          error,
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
};
module.exports = resolvers;
