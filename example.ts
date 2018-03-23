import * as graphqlBuilder from './index';

const config: graphqlBuilder.IConfig = {
  path: `${__dirname}\\examples`,
  auth: true,
  authCondition: graphqlBuilder.defaultHapiAuth,
};

const schema = graphqlBuilder.creatExecutableSchema(config);
