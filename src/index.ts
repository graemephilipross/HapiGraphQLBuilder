// tslint:disable:no-empty

import * as  requireDir from 'require-dir'
import { makeExecutableSchema } from'graphql-tools';
import { GraphQLSchema } from 'graphql';

export type Resolver = (root: any, args: any, context: any, info: any) => any;

export interface IModuleResolver {
  [key: string]: Resolver;
}

export interface IResolver {
  [key: string]: IModuleResolver;
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
  getResolvers(): IResolver[];
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

  public getResolvers(): IResolver[] {
    return this._modules.map(_module => {
      return Object.entries(_module.resolvers || []).reduce((acc, [resolverName, resolver]) => {
        acc = { [resolverName]: resolver, ...acc }
        return acc;
      }, <IResolver>{});
    }, <Array<IResolver>>[]);
  }
}

export class SchemaWithAuth implements ISchema {

  constructor(private schema: ISchema) {}

  public getTypeDefs(): string[] {
    // decorate with auth
    return this.schema.getTypeDefs();
  }

  public getResolvers(): IResolver[] {
    // decorate with auth
    return this.schema.getResolvers();
  }
}

export const GraphQLSchemaFactory = (schema: ISchema): GraphQLSchema => {
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
};

export const MakeExecutableSchema = (config: IConfig): GraphQLSchema => {
  let schema = new Schema(config.path);
  if (config.auth) {
    return GraphQLSchemaFactory(new SchemaWithAuth(schema));
  }
  return GraphQLSchemaFactory(schema);
}
