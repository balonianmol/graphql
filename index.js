const { ApolloServer, gql } = require("apollo-server");
require("./db/db");
const user = require("./model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const typeDefs = gql`
  type Query {
    getusers(ID: Int): user
    login(username: String, password: String): jwt
  }
  type user {
    id: Int
    userName: String
    password: String
    email: String
    firstname: String
    lastname: String
  }
  type jwt {
    status: String
    loginsucess: Boolean
    jwttoken: String
  }
  type Mutation {
    registeruser(
      username: String!
      password: String!
      confpassword: String!
      email: String!
      firstname: String!
      lastname: String!
    ): jwt
    deleteuser(ID: Int): String
  }
`;
const resolvers = {
  Query: {
    getusers: async (_, { ID }, context) => {
      if (!context.userData) return null;
      const userData = await user.findOne({ where: { id: ID } });
      return userData;
    },
    login: async (_, { username, password }) => {
      const userFound = await user.findOne({ where: { userName: username } });
      if (userFound) {
        let decryption = await bcrypt.compare(password, userFound.password);
        if (decryption === true) {
          let token = jwt.sign({ user_id: userFound.id }, process.env.key, {
            expiresIn: "1h",
          });
          return {
            loginsucess: true,
            jwttoken: token,
          };
        } else {
          return {
            loginsucess: false,
            jwttoken: "not allowed Incorrect password",
          };
        }
      } else {
        return {
          loginsucess: false,
          jwttoken: "not allowed Incorrect Username",
        };
      }
    },
  },
  Mutation: {
    registeruser: async (
      _,
      { username, password, confpassword, email, firstname, lastname }
    ) => {
      if (password !== confpassword) {
        return { status: "password and confirm passwords do not match" };
      }
      let saltRounds = await bcrypt.genSalt(10);
      let encrypt = await bcrypt.hashSync(password, saltRounds);
      const userCreate = await user.create({
        userName: username,
        password: encrypt,
        email: email,
        firstname: firstname,
        lastname: lastname,
      });
      let token = jwt.sign({ user_id: userCreate.id }, process.env.key, {
        expiresIn: "1h",
      });
      return {
        jwttoken: token,
      };
    },
    deleteuser: async (_, { ID }, context) => {
      if (!context.userData) return { message: "you must be logged in" };
      const userFound = await user.findOne({ where: { id: ID } });
      if (user) {
        await user.destroy({ where: { id: userFound.id } });
        return "user is deleted sucessfully";
      } else {
        return "something went wrong";
      }
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const bearerhead = req.headers["authorization"];
    if (typeof bearerhead !== "undefined") {
      let decode = jwt.verify(bearerhead, process.env.key);
      let userData = await user.findOne({ where: { id: decode.user_id } });
      if (!userData) throw new AuthenticationError("you must be logged in");
      return { userData };
    } else {
      return null;
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
