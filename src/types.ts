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
