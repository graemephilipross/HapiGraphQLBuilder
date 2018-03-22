// tslint:disable:no-empty

import * as  requireDir from 'require-dir';
import { makeExecutableSchema } from'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { Resolver, IModule, IResolver, IModuleResolver, IAuthentication, AuthCondition } from './types';

export class ModulesFactory {

  public static create(path: string = ''): IModule[] {
    if (!path) {
      throw new Error('A path to a directory of module definitions must be provided');
    }
    return ModulesFactory.genModuleDefintions(path);
  }

  private static genModuleDefintions(path: string): IModule[] {
    const mods: any[] = requireDir(path);
    return Object.values(mods).reduce((acc, resource) => {
      acc = [...acc, resource.default || {}];
      return acc;
    }, <Array<IModule>>[]).filter(Boolean);
  }
}

export interface ISchema {
  Modules: IModule[];
  getResolvers(): IResolver[];
  getTypeDefs(): string[];
}

export class Schema implements ISchema {
  private _modules: IModule[];

  get Modules() {
    return this._modules;
  }

  constructor(private path: string) {
    this._modules = ModulesFactory.create(path);
  }

  public getTypeDefs(): string[] {
    return this._modules.map(mod => mod.schema);
  }

  public getResolvers(): IResolver[] {
    return this._modules.map(_module => {
      return Object.entries(_module.resolvers || []).reduce((acc, [resolverName, resolver]) => {
        acc = { [resolverName]: resolver, ...acc };
        return acc;
      }, <IResolver>{});
    }, <Array<IResolver>>[]);
  }
}

export class SchemaWithAuth implements ISchema {
  private _modules: IModule[];

  get Modules() {
    return this._modules;
  }

  constructor(private schema: ISchema, private authCondition: AuthCondition) {
    this._modules = schema.Modules;
  }

  public getTypeDefs(): string[] {
    return this.schema.getTypeDefs();
  }

  public getResolvers(): IResolver[] {
    // decorate with auth
    return this._modules.map(_module => {
      return Object.entries(_module.resolvers || []).reduce((acc, [moduleName, resolvers]) => {
        const resolversWithAuth = this.decorateWithAuth(_module.authentication, resolvers, moduleName);
        acc = Object.assign({}, { [moduleName]: resolversWithAuth }, acc);
        return acc;
      }, <IResolver>{});
    }, <Array<IResolver>>[]);
  }

  private decorateWithAuth = (authentication: IAuthentication, resolvers: IModuleResolver, moduleName: string = null) =>
    Object.entries(resolvers || []).reduce((acc, [resolverName, resolver]) => {
      let resolverWithAuth = resolver;
      if (authentication) {
        const auth = moduleName
        ? authentication[moduleName] && authentication[moduleName][resolverName]
        : authentication[resolverName];
        resolverWithAuth = new Proxy<Resolver>(resolver, applyAuth(<string[]>auth, this.authCondition));
      }
      acc = Object.assign({}, { [resolverName]: resolverWithAuth }, acc);
      return acc;
    }, {})
}

export const graphQLSchemaFactory = (schema: ISchema): GraphQLSchema => {
  const typeDefs = schema.getTypeDefs();
  const resolvers = schema.getResolvers().reduce((acc, resolver) => {
    acc = Object.assign({}, resolver, acc);
    return acc;
  }, {});
  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
};

export interface IConfig {
  path: string;
  auth: Boolean;
  authCondition?: AuthCondition;
}

export const initExecutableSchema = (config: IConfig): GraphQLSchema => {
  let schema: ISchema = new Schema(config.path);
  if (config.auth) {
    const authCondition = config.authCondition || defaultAuthCondition;
    schema = new SchemaWithAuth(schema, defaultAuthCondition);
  }
  return graphQLSchemaFactory(schema);
};

function applyAuth(authentication: string[], authCondition: AuthCondition) {
  return {
    apply (target, ctx, args) {
      const [, , context] = args;
      // no auth on resolver
      if (!target.authentication || target.authentication.length === 0) {
        return target(...args);
      }
      if (context.auth.credentials && context.auth.credentials.scope) {
        if (authCondition(context.auth.credentials.scope, target.authentication)) {
          return target(...args);
        }
      }
      return new Error('Invalid auth scope to access resolver');
    },
  };
}

const defaultAuthCondition: AuthCondition = (ps, ts) => ps.some(v => ts.includes(v));
