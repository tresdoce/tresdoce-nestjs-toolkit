import 'jest-extended';

export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      toContainObject(argument: any): R;
      toBeTypeOrNull(classTypeOrNull: any): R;
    }
  }
}
