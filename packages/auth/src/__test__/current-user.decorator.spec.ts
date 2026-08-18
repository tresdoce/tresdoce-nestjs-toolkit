import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../auth/interfaces/auth.interface';

function getParamDecoratorFactory(decorator: Function) {
  class Test {
    public test(@decorator() _value: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

const mockExecutionContext = (user: IAuthenticatedUser | undefined) =>
  ({
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn().mockReturnValue({ user }),
    })),
  }) as unknown as ExecutionContext;

describe('CurrentUser', () => {
  const factory = getParamDecoratorFactory(CurrentUser);
  const user: IAuthenticatedUser = { id: 'user-1', email: 'user@test.com', roles: ['admin'] };

  it('should return the full authenticated user when no key is passed', () => {
    expect(factory(undefined, mockExecutionContext(user))).toEqual(user);
  });

  it('should return a single field of the authenticated user when a key is passed', () => {
    expect(factory('id', mockExecutionContext(user))).toBe('user-1');
  });

  it('should return undefined when there is no authenticated user', () => {
    expect(factory(undefined, mockExecutionContext(undefined))).toBeUndefined();
  });
});
