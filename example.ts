import { initExecutableSchema, IConfig } from './src/index';

const config: IConfig = {
  path: `${__dirname}\\examples`,
  auth: true,
};

const schema = initExecutableSchema(config);
console.log(schema);
