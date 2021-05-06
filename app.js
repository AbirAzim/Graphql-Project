const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type RootQuery{
        events: [String!]
      }

      type RootMutation {
        createEvent(name: String): String
      }

      schema {
        query: RootQuery   
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => ['hello', 'world', 'testing'],
      createEvent: (args) => {
        const { name } = args;
        return name;
      },
    },
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log(`app is running on port 3000`);
});
