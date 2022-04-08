import { setHttpsOptions } from '../index';
import * as path from 'path';
describe('https-certificate', () => {
  it('should be return https certificate config', () => {
    const crtPath = path.resolve(__dirname, './utils/localhost.crt');
    const keyPath = path.resolve(__dirname, './utils/localhost.key');

    const config = setHttpsOptions(crtPath, keyPath);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.cert).not.toEqual('');
    expect(config.key).not.toEqual('');
  });

  it('should be return https certificate config empty', () => {
    const crtPath = path.resolve(__dirname, './utils/my-localhost.crt');
    const keyPath = path.resolve(__dirname, './utils/my-localhost.key');

    const config = setHttpsOptions(crtPath, keyPath);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.cert).toEqual('');
    expect(config.key).toEqual('');
  });
});
