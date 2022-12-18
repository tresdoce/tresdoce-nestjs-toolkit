import { Roles, ROLES_KEY } from '../index';

describe('Public decorator', () => {
  it('should be defined', async () => {
    expect(Roles('admin')).toBeDefined();
    expect(Roles('admin', 'user')).toBeDefined();
  });

  it('should be return key', async () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
