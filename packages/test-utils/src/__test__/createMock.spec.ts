import { createMock, cleanAllMock } from '../utilities';
import axios from 'axios';

describe('createMock', () => {
  afterEach(() => {
    cleanAllMock();
  });

  it('should mock a GET request', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'get',
      endpoint: '/api',
      statusCode: 200,
      responseBody: { success: true },
    });

    const res = await axios.get('http://test.com/api');
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a POST request with body', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'post',
      endpoint: '/api',
      statusCode: 201,
      responseBody: { success: true },
      reqBody: { key: 'value' },
    });

    const res = await axios.post('http://test.com/api', { key: 'value' });
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a PUT request with body', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'put',
      endpoint: '/api',
      statusCode: 200,
      responseBody: { success: true },
      reqBody: { key: 'updatedValue' },
    });

    const res = await axios.put('http://test.com/api', { key: 'updatedValue' });
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a PATCH request with body', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'patch',
      endpoint: '/api',
      statusCode: 200,
      responseBody: { success: true },
      reqBody: { key: 'updatedValue' },
    });

    const res = await axios.patch('http://test.com/api', { key: 'updatedValue' });
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a DELETE request with body', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'delete',
      endpoint: '/api',
      statusCode: 200,
      responseBody: { success: true },
    });

    const res = await axios.delete('http://test.com/api');
    expect(res.data).toEqual({ success: true });
  });

  it('should create a POST mock with the provided request body as Buffer', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'post',
      endpoint: '/test-buffer',
      statusCode: 200,
      responseBody: { success: true },
      reqBody: Buffer.from('Hello, World!'),
    });

    const res = await axios.post('http://test.com/test-buffer', Buffer.from('Hello, World!'));
    expect(res.data).toEqual({ success: true });
  });

  it('should mock with query parameters', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'get',
      endpoint: '/api',
      statusCode: 200,
      responseBody: { success: true },
      queryParams: { key: 'value' },
    });

    const res = await axios.get('http://test.com/api', { params: { key: 'value' } });
    expect(res.data).toEqual({ success: true });
  });

  it('should handle options with headers', async () => {
    createMock({
      baseUrl: 'http://test.com',
      method: 'get',
      endpoint: '/api',
      statusCode: 200,
      responseBody: { success: true },
      options: {
        reqheaders: {
          authorization: 'Bearer token',
        },
      },
    });

    const res = await axios.get('http://test.com/api', {
      headers: { authorization: 'Bearer token' },
    });
    expect(res.data).toEqual({ success: true });
  });
});
