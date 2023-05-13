import { Roles, ROLES_KEY } from '../index';

describe('Roles decorator', () => {
  it('should be defined', async () => {
    expect(Roles('admin')).toBeDefined();
    expect(Roles('admin', 'user')).toBeDefined();
  });

  it('should be return key', async () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
