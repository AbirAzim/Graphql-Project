const express = require('express');
const dotEnv = require('dotenv');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./model/event');

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

      type RootQuery{
        events: [Event!]!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
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
        };
        try {
          const eventDoc = await Event.create(event);
          return eventDoc;
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
