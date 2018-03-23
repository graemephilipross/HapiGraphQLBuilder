export type Resolver = (root: any, args: any, context: any, info: any) => any;

export type AuthCondition = (context: any, targetScopes: string[]) => Boolean;

export interface IModuleResolver {
  [key: string]: Resolver;
}

export interface IResolver {
  [key: string]: IModuleResolver;
}

export interface ISchema {
  Modules: IModule[];
  getResolvers(): IResolver[];
  getTypeDefs(): string[];
}

export type AuthScopes = {
  [key: string]: string[];
};

export interface IAuthentication {
  [key: string]: AuthScopes;
}

export interface IModule {
  schema: string;
  moduleResolver?: IModuleResolver;
  resolvers?: IResolver;
  authentication?: IAuthentication;
}

export interface IConfig {
  path: string;
  auth: Boolean;
  authCondition?: AuthCondition;
}
