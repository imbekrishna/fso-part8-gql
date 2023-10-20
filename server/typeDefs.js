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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query{
    bookCount: Int!
    authorCount: Int!
    allBooks(author:String, genre:String): [Book!]!
    allAuthors: [Author!]!
    me: User
    recommended: [Book!]
    allGenres: [String!]!
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

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`;

module.exports = typeDefs;
