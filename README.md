## Node framework for building a modular Apollo-Server GraphQL schema

### See `examples` for full example.

parent.ts

```typescript
import { Resolver, IModule } from 'modular-graphql-builder';
import Child from './child';

const schema = `
  type Parent {
    id: ID
    first_name: String
    children: [Child]
  }
`;

const parent: Resolver = (root, args, context, info) => {
  return [{
    id: 1,
    first_name: 'Barry',
  }];
};

const resolvers = {
  Parent: {
    children: Child.moduleResolver.parentsChildren,
  },
};

const authentication = {
  Parent: {
    children: ['parent'],
  },
};

const moduleResolver = {
  parent,
};

const o: IModule = {
  schema,
  resolvers,
  authentication,
  moduleResolver,
};

export default o;
```

root.ts

```typescript
import { IModule } from 'modular-graphql-builder';
import Child from './child';
import Parent from './parent';

const schema = `
  type Query {
    parent(id: ID): [Parent]
    child(id: ID): [Child]
  }
`;

const resolvers = {
  Query: {
    parent: Parent.moduleResolver.parent,
    child: Child.moduleResolver.children,
  },
};

const authentication = {
  Query: {
    parent: ['parentRoot'],
    child: ['childRoot'],
  },
};

const o: IModule = {
  schema,
  resolvers,
  authentication,
};

export default o;
```

Using the framework with hapi:

```typescript
import * as graphqlBuilder from 'modular-graphql-builder';
import { Server } from 'hapi';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';

const config: graphqlBuilder.IConfig = {
  path: `${__dirname}\\examples`,
  auth: true,
  authCondition: graphqlBuilder.defaultHapiAuth,
};

const schema = graphqlBuilder.creatExecutableSchema(config);

const server = new Server({
  port: 8080,
  host: 'localhost',
});

const register = () => {
  return server.register([{
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: (request) => ({
        pretty: true,
        schema,
        context: request,
      }),
    },
  }, {
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
      },
    },
  }]);
};

const init = async () => {
  await register();
  await server.start();
  // tslint:disable-next-line no-console
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  // tslint:disable-next-line no-console
  console.log(err);
  process.exit(1);
});

init();
```

