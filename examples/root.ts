
import { IModule } from '../src/types';
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
