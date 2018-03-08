// tslint:disable:no-empty

import * as  requireDir from 'require-dir';
import { makeExecutableSchema } from'graphql-tools';
import { GraphQLSchema } from 'graphql';

export type Resolver = (root: any, args: any, context: any, info: any) => any;

export interface IModuleResolver {
  [key: string]: Resolver;
}

export interface IResolver {
  [key: string]: { [key: string]: Resolver; };
}

export type AuthScopes = {
  [key: string]: string[];
};

export interface IAuthentication {
  [key: string]: { [key: string]: AuthScopes; };
}

export interface IModule {
  schema: string;
  moduleResolver?: IModuleResolver;
  resolvers?: IResolver;
  authentication?: IAuthentication;
}

interface IConfig {
  path: string;
}

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
      acc = [...acc, resource];
      return acc;
    }, <Array<IModule>>[]);
  }
}

export interface ISchema {
  getModuleResolvers(): IModuleResolver;
  getResolvers(): IResolver;
  getTypeDefs(): string[];
}

export class Schema implements ISchema {
  private _modules: IModule[];

  constructor(private path: string) {
    this._modules = ModulesFactory.create(path);
  }

  public getTypeDefs(): string[] {
    return this._modules.map(mod => mod.schema);
  }

  public getModuleResolvers(): IModuleResolver {
    return this._modules.reduce((moduleArr, _module) => {
      return Object.entries(_module.moduleResolver || []).reduce((acc, [resolverName, resolver]) => {
        acc = Object.assign({}, { [resolverName]: resolver }, acc);
        return acc;
      }, {});
    }, []);
  }

  public getResolvers(): IResolver {
    return this._modules.reduce((moduleArr, _module) => {
      return Object.entries(_module.resolvers || []).reduce((acc, [resolverName, resolver]) => {
        // custom scalar case
        if ('_scalarConfig' in resolver) {
          acc = Object.assign({}, { [resolverName]: resolver }, acc);
          return acc;
        }
        acc = Object.assign({}, { [resolverName]: resolver }, acc);
        return acc;
      }, {});
    }, []);
  }
}

export const schemaFactory = (path: string): GraphQLSchema => {
  const schema = new Schema(path);
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
