import { readHttpsCertificate } from '../index';
import * as path from 'path';
describe('nestjs-https-certificate', () => {
  it('should be return https certificate config', () => {
    const crtPath = path.resolve(__dirname, './utils/localhost.crt');
    const keyPath = path.resolve(__dirname, './utils/localhost.key');

    const config = readHttpsCertificate(crtPath, keyPath);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.cert).not.toEqual('');
    expect(config.key).not.toEqual('');
  });

  it('should be return https certificate config empty', () => {
    const crtPath = path.resolve(__dirname, './utils/my-localhost.crt');
    const keyPath = path.resolve(__dirname, './utils/my-localhost.key');

    const config = readHttpsCertificate(crtPath, keyPath);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.cert).toEqual('');
    expect(config.key).toEqual('');
  });
});
