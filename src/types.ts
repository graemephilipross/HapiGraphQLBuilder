export type Resolver = (root: any, args: any, context: any, info: any) => any;

export type AuthCondition = (permittedScopes: string[], targetScopes: string[]) => Boolean;

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
  [key: string]: AuthScopes;
}

export interface IModule {
  schema: string;
  moduleResolver?: IModuleResolver;
  resolvers?: IResolver;
  authentication?: IAuthentication;
}
