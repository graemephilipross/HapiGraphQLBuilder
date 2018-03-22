
import { Resolver, IModule } from '../src/types';
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
