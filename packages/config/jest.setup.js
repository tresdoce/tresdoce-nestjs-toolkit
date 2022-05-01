//const {setupContainers} = require("@tresdoce-nestjs-toolkit/test-utils")
//const container = new setupContainers();

jest.setTimeout(30000);

/*beforeAll(async () => {
    console.log("BEFORE ALL")
    await container.start()
})

afterAll(async () => {
    console.log("AFTER ALL")
    await container.stop();
})*/

expect.extend({
  toContainObject(received, argument) {
    const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(argument)]));

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received,
          )} not to contain object ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received,
          )} to contain object ${this.utils.printExpected(argument)}`,
        pass: false,
      };
    }
  },
  toBeTypeOrNull(received, classTypeOrNull) {
    try {
      expect(received).toEqual(expect.any(classTypeOrNull));
      return {
        message: () => `Ok`,
        pass: true,
      };
    } catch (error) {
      return received === null
        ? {
            message: () => `Ok`,
            pass: true,
          }
        : {
            message: () => `expected ${received} to be ${classTypeOrNull} type or null`,
            pass: false,
          };
    }
  },
});
