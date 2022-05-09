import { testContainers, ITestContainerOptions } from '../testcontainers';

const testContainerOptions: ITestContainerOptions = {
  ports: {
    container: 5432,
    host: 5432,
  },
  envs: {
    POSTGRES_USER: 'root',
    POSTGRES_PASSWORD: '123456',
    POSTGRES_DB: 'test_db',
  },
  containerName: `tresdoce-test-container-postgres`,
  reuse: true,
};

jest.setTimeout(60000);
describe('testcontainers', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('postgres:13', testContainerOptions);
    console.log(container);
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  it('should be any', () => {
    console.log('hello');
    console.log('GET INSTANCE: ', testContainers.getInstance());
    expect(1).toBe(1);
  });
});
