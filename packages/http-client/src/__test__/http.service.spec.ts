import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { HttpClientService } from '../http/services/httpClient.service';
import { HttpClientModule } from '../http/httpClient.module';
import { config } from './utils';

const API_NESTJS_STARTER = 'https://json-server.up.railway.app/api';
//const API_NESTJS_STARTER = 'http://localhost:6767/api';

describe('HttpService', () => {
  let app: INestApplication;
  let service: HttpClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HttpClientModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            configService.get('config.httpOptions'),
          inject: [ConfigService],
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
    service = module.get<HttpClientService>(HttpClientService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(HttpClientService);
    expect(service.axiosRef).not.toBeNull();
  });

  it('should be return status 200 - request', async () => {
    const { status, data } = await service.request({
      headers: {
        'uber-trace-id': 'ef083b253ad4792827d19be437195454:3c5bd7e941c53cfc:0:01',
        'x-amzn-trace-id':
          'Root=1-ef083b25-3ad4792827d19be437195454;Parent=3c5bd7e941c53cfc;Sampled=1',
        my_header: 'test-header',
      },
      url: `${API_NESTJS_STARTER}/users?limit=5`,
      method: 'GET',
    });
    expect(status).toBe(200);
    expect(data.length).toBeGreaterThan(0);
    expect(data.length).toEqual(5);
  });

  it('should be return status 200 - get', async () => {
    const { status, data } = await service.get(`${API_NESTJS_STARTER}/posts`);
    expect(status).toBe(200);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should be return status 201 - post', async () => {
    const { status, data } = await service.post(`${API_NESTJS_STARTER}/users`, {
      data: {
        email: 'test@email.com',
      },
    });
    expect(status).toBe(201);
    expect(data).toEqual({
      success: true,
      data: {
        id: 25,
        email: 'test@email.com',
      },
    });
  });

  it('should be return status 200 - get by id', async () => {
    const { status, data } = await service.get(`${API_NESTJS_STARTER}/users/1`);
    expect(status).toBe(200);
    expect(data).toBeDefined();
    expect(data).not.toBeEmpty();
  });

  it('should be return status 200 - put', async () => {
    const { status, data } = await service.put(`${API_NESTJS_STARTER}/users/1`, {
      data: {
        email: 'newtest@email.com',
      },
    });
    expect(status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        id: 1,
        email: 'newtest@email.com',
      },
    });
  });

  it('should be return status 200 - delete', async () => {
    const { status, data } = await service.delete(`${API_NESTJS_STARTER}/users/2`);
    expect(status).toBe(200);
    expect(data).toEqual({
      success: true,
    });
  });

  it('should be return status 200 - patch', async () => {
    const { status, data } = await service.patch(`${API_NESTJS_STARTER}/users/1`, {
      data: {
        email: 'newtest@email.com',
      },
    });
    expect(status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        id: 1,
        email: 'newemailtest@email.com',
      },
    });
  });

  it('should be return status 200 - head', async () => {
    const { status, headers } = await service.head(`${API_NESTJS_STARTER}/posts`);
    expect(status).toBe(200);
    expect(headers).toHaveProperty('content-type');
  });

  it('should be return error', async () => {
    try {
      const { data } = await service.get(`${API_NESTJS_STARTER}/postss`);
      expect(data).toBe(200);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.message).toBe('Request failed with status code 404');
    }
  });
});
