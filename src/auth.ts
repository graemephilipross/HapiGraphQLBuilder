import { AuthCondition } from './types';

export const nullAuth: AuthCondition = (c, t) => true;

export const defaultHapiAuth: AuthCondition = (context, targetScopes) => {
  if (context.auth.credentials && context.auth.credentials.scope) {
    return context.auth.credentials.scope.some(v => targetScopes.includes(v));
  }
  return false;
};

export function applyAuth(auth: string[], authCondition: AuthCondition) {
  return {
    apply (target, ctx, args) {
      const [, , context] = args;
      // no auth on resolver
      if (!auth || auth.length === 0) {
        return target(...args);
      }
      if (authCondition(context, auth)) {
        return target(...args);
      }
      return new Error('Invalid auth scope to access resolver');
    },
  };
}
