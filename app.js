const express = require('express');
const dotEnv = require('dotenv');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Event = require('./model/event');
const User = require('./model/user');

const app = express();
dotEnv.config({ path: './config.env' });
app.use(express.json({ limit: '10kb' }));

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`

      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User {
        _id: ID!
        email: String!
        password: String!
      }

      type RootQuery{
        events: [Event!]!
        users: [User!]!
      }

      input UserInput {
        email: String!
        password: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery   
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await Event.find();
          return events;
        } catch (e) {
          console.log(e);
        }
      },
      createEvent: async (args) => {
        const event = {
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: '6094620de7447242f8dfc6e9',
        };
        try {
          const eventDoc = await Event.create(event);
          const userDoc = await User.findOne({
            _id: '6094620de7447242f8dfc6e9',
          });
          const updateUserEvents = userDoc.events.map((el) => el);
          updateUserEvents.push(eventDoc._id);
          await User.findByIdAndUpdate(
            '6094620de7447242f8dfc6e9',
            { events: updateUserEvents },
            {
              new: true,
              runValidators: true,
            }
          );
          return eventDoc;
        } catch (e) {
          console.log(e);
        }
      },
      createUser: async (args) => {
        let hashed;
        try {
          hashed = await bcrypt.hash(args.userInput.password, 12);
          const user = {
            email: args.userInput.email,
            password: hashed,
          };
          const userDoc = await User.create(user);
          userDoc.password = '********';
          return userDoc;
        } catch (e) {
          console.log(e);
        }
      },
    },
    graphiql: true,
  })
);

const url = process.env.DATABASE;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('database connected');
  });

app.listen(3000, () => {
  console.log(`app is running on port 3000`);
});

// createUser(userInput: UserInput): User
