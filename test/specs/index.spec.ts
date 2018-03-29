import { expect } from 'chai';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { GraphQLSchema } from 'graphql';
import * as graphqlBuilder from '../../src/types';
import modsMock from '../mods.fake';

describe('Create Executable Scheme', () => {

  let builder;

  beforeEach(() => {
    builder = proxyquire('../../src/index', {
      'graphql-tools': {
        'makeExecutableSchema': obj => obj,
      },
      'require-dir': () => modsMock,
    });
  });

  it('should create an executable schema', () => {
    // tslint:disable:no-empty
    const config: graphqlBuilder.IConfig = {
      path: `${__dirname}\\..\\..\\examples`,
      auth: false,
    };
    const schema = builder.creatExecutableSchema(config);
    expect(schema).to.have.property('typeDefs').that.eql(['', '', '']);
  });
});
