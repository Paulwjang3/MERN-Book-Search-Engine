const { User } = require("../models");

const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id })
            .select("-__v -password")
            .populate("savedBooks");
  
          return userData;
        }
        throw new AuthenticationError("Not logged in!");
      },
    },
    Mutation: {
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError("username/password is incorrect");
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError("username/password is incorrect");
        }
        const token = signToken(user);
  
        return { token, user };
      },
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
  
        return { token, user };
      },
      saveBook: async (parent, { input }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } },
            { new: true }
          ).populate("savedBooks");
  
          return updatedUser;
        }
        throw new AuthenticationError("You must be logged in!");
      },
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          ).populate("savedBooks");
  
          return updatedUser;
        }
        throw new AuthenticationError("You must be logged in!");
      },
    },
  };
  
  module.exports = resolvers;