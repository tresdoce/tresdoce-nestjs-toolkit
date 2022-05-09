import testContainers from '../testcontainers/testContainers';

jest.setTimeout(60000);
describe('testcontainers', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('postgres:13');
    console.log(container);
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: false });
  });

  it('should be any', () => {
    console.log('hello');
    console.log('GET INSTANCE: ', testContainers.getInstance());
    expect(1).toBe(1);
  });
});
