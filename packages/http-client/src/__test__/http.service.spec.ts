import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { HttpClientService } from '../http/services/httpClient.service';
import { HttpClientModule } from '../http/httpClient.module';
import { config } from './utils';

const API_NESTJS_STARTER = 'https://jsonplaceholder.typicode.com';

const mockRequestBody = {
  userId: 1,
  id: 1,
  title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
  body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
};

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
      url: `${API_NESTJS_STARTER}/posts`,
      method: 'GET',
    });
    expect(status).toBe(200);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should be return status 200 - get', async () => {
    const { status, data } = await service.get(`${API_NESTJS_STARTER}/posts`);
    expect(status).toBe(200);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should be return status 201 - post', async () => {
    const { status, data } = await service.post(`${API_NESTJS_STARTER}/posts`, {
      data: mockRequestBody,
    });
    expect(status).toBe(201);
    expect(data).toEqual({
      ...mockRequestBody,
      id: 101,
    });
  });

  it('should be return status 200 - get by id', async () => {
    const { status, data } = await service.get(`${API_NESTJS_STARTER}/posts/1`);
    expect(status).toBe(200);
    expect(data).toEqual(mockRequestBody);
  });

  it('should be return status 200 - put', async () => {
    const { status, data } = await service.put(`${API_NESTJS_STARTER}/posts/1`, {
      data: {
        ...mockRequestBody,
        title: 'mockito',
      },
    });
    expect(status).toBe(200);
    expect(data).toEqual({ ...mockRequestBody, id: 1, title: 'mockito' });
  });

  it('should be return status 200 - delete', async () => {
    const { status, data } = await service.delete(`${API_NESTJS_STARTER}/posts/2`);
    expect(status).toBe(200);
    expect(data).toEqual({});
  });

  it('should be return status 200 - patch', async () => {
    const { status, data } = await service.patch(`${API_NESTJS_STARTER}/posts/1`, {
      data: {
        ...mockRequestBody,
        title: 'mockito',
      },
    });
    expect(status).toBe(200);
    expect(data).toEqual({ ...mockRequestBody, id: 1, title: 'mockito' });
  });

  it('should be return status 200 - head', async () => {
    const { status, headers } = await service.head(`${API_NESTJS_STARTER}/posts`);
    expect(status).toBe(200);
    expect(headers).toHaveProperty('etag');
  });

  it('should be return error', async () => {
    try {
      await service.get(`${API_NESTJS_STARTER}/postss`);
    } catch (error) {
      expect(error.statusCode).toBe(404);
    }
  });
});
