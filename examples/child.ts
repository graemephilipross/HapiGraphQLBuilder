
import { Resolver, IModule } from '../src/types';

const schema = `
  type Child {
    id: ID
    first_name: String
  }
`;

const children: Resolver = (root, args, context, info) => {
  return [{
    id: 1,
    first_name: 'Graeme',
  }];
};

const parentsChildren: Resolver = (root, args, context, info) => {
  return [{
    id: 2,
    first_name: 'Dan',
  }];
};

const moduleResolver = {
  children,
  parentsChildren,
};

const o: IModule = {
  schema,
  moduleResolver,
};

export default o;
