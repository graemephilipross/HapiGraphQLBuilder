// tslint:disable:no-empty

export default {
  child: {
    default: {
      schema: ``,
      moduleResolver: {
        children: () => {},
        parentsChildren: () => {},
      },
    },
  },
  parent: {
    default: {
      schema: ``,
      authentication: {
        Parent: {
          children: ['parent'],
        },
      },
      moduleResolver: {
        parent: () => {},
      },
      resolvers: {
        Parent: {
          children: () => {},
        },
      },
    },
  },
  root: {
    default: {
      schema: ``,
      authentication: {
        Query: {
          child: ['childRoot'],
          parent: ['parentRoot'],
        },
      },
      resolvers: {
        Query: {
          child: () => {},
          parent: () => {},
        },
      },
    },
  },
};
