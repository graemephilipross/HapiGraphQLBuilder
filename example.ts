import * as graphqlBuilder from './index';
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
