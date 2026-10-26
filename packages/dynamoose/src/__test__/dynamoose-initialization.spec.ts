import dynamoose from 'dynamoose';
import { buildDynamoDBClientConfig, initialization } from '../dynamoose/dynamoose-core.module.js';
import { DYNAMOOSE_LOCAL_ENDPOINT } from '../dynamoose/constants/dynamoose.constant.js';

describe('initialization', () => {
  let setSpy: ReturnType<typeof vi.spyOn>;
  let localSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setSpy = vi.spyOn(dynamoose.aws.ddb, 'set');
    localSpy = vi.spyOn(dynamoose.aws.ddb, 'local');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    dynamoose.aws.ddb.revert();
  });

  const lastClientConfig = async () => {
    const client = setSpy.mock.calls.at(-1)[0] as InstanceType<typeof dynamoose.aws.ddb.DynamoDB>;
    return {
      region: await client.config.region(),
      credentials: await client.config.credentials(),
      endpoint: client.config.endpoint ? await client.config.endpoint() : undefined,
    };
  };

  it('should do nothing when options are undefined', async () => {
    await expect(initialization(undefined)).resolves.toBeUndefined();
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('should not replace the client when there is no connection option', async () => {
    await initialization({});
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('should map aws credentials to the SDK v3 client config', async () => {
    await initialization({
      aws: { accessKeyId: 'key', secretAccessKey: 'secret', region: 'sa-east-1' },
    });
    const config = await lastClientConfig();
    expect(config.region).toBe('sa-east-1');
    expect(config.credentials).toMatchObject({ accessKeyId: 'key', secretAccessKey: 'secret' });
    expect(config.endpoint).toBeUndefined();
  });

  it('should keep aws config when local is true', async () => {
    await initialization({
      local: true,
      aws: { accessKeyId: 'local', secretAccessKey: 'local', region: 'us-east-1' },
    });
    const config = await lastClientConfig();
    expect(config.region).toBe('us-east-1');
    expect(config.endpoint).toMatchObject({ hostname: 'localhost', port: 8000 });
    expect(localSpy).not.toHaveBeenCalled();
  });

  it('should use a custom local endpoint without aws config', async () => {
    await initialization({ local: 'http://docker:8001' });
    const client = setSpy.mock.calls.at(-1)[0] as any;
    expect(await client.config.endpoint()).toMatchObject({ hostname: 'docker', port: 8001 });
  });

  it('should set the ddb instance and apply local endpoint', async () => {
    const ddb = new dynamoose.aws.ddb.DynamoDB({ region: 'us-east-1' });
    await initialization({ ddb, local: true });
    expect(setSpy).toHaveBeenCalledWith(ddb);
    expect(localSpy).toHaveBeenCalledWith(DYNAMOOSE_LOCAL_ENDPOINT);
  });

  it('should set the ddb instance without local', async () => {
    const ddb = new dynamoose.aws.ddb.DynamoDB({ region: 'us-east-1' });
    await initialization({ ddb, local: false });
    expect(setSpy).toHaveBeenCalledWith(ddb);
    expect(localSpy).not.toHaveBeenCalled();
    expect(dynamoose.aws.ddb()).toBe(ddb);
  });
});

describe('buildDynamoDBClientConfig', () => {
  it('should return an empty config by default', () => {
    expect(buildDynamoDBClientConfig()).toEqual({});
  });

  it('should omit credentials when they are incomplete', () => {
    expect(buildDynamoDBClientConfig({ accessKeyId: 'key', region: 'us-east-1' })).toEqual({
      region: 'us-east-1',
    });
  });

  it('should build the full config', () => {
    expect(
      buildDynamoDBClientConfig(
        { accessKeyId: 'key', secretAccessKey: 'secret', region: 'us-east-1' },
        'http://localhost:8000',
      ),
    ).toEqual({
      region: 'us-east-1',
      credentials: { accessKeyId: 'key', secretAccessKey: 'secret' },
      endpoint: 'http://localhost:8000',
    });
  });
});
