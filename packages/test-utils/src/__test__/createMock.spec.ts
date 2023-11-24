import { createMock, cleanAllMock } from '../utilities';
import axios from 'axios';

describe('createMock', () => {
  afterEach(() => {
    cleanAllMock();
  });

  it('should mock a GET request', async () => {
    createMock({
      url: 'http://test.com/api',
      method: 'get',
      statusCode: 200,
      responseBody: { success: true },
    });

    const res = await axios.get('http://test.com/api');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a POST request with body', async () => {
    createMock({
      url: 'http://test.com/api',
      method: 'post',
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
      url: 'http://test.com/api',
      method: 'put',
      statusCode: 200,
      responseBody: { success: true },
      reqBody: { key: 'updatedValue' },
    });

    const res = await axios.put('http://test.com/api', { key: 'updatedValue' });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a PATCH request with body', async () => {
    createMock({
      url: 'http://test.com/api',
      method: 'patch',
      statusCode: 200,
      responseBody: { success: true },
      reqBody: { key: 'updatedValue' },
    });

    const res = await axios.patch('http://test.com/api', { key: 'updatedValue' });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
  });

  it('should mock a DELETE request', async () => {
    createMock({
      url: 'http://test.com/api',
      method: 'delete',
      statusCode: 200,
      responseBody: { success: true },
    });

    const res = await axios.delete('http://test.com/api');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
  });

  it('should create a POST mock with the provided request body as Buffer', async () => {
    createMock({
      url: 'http://test.com/test-buffer',
      method: 'post',
      statusCode: 200,
      responseBody: Buffer.from('Buffer Response'),
    });

    const res = await axios.post('http://test.com/test-buffer', Buffer.from('Hello, World!'));
    expect(res.status).toBe(200);
    expect(res.data).toEqual('Buffer Response');
  });

  it('should mock a request with function as responseBody', async () => {
    createMock({
      url: 'http://test.com/api/dynamicData',
      method: 'get',
      statusCode: 200,
      responseBody: () => ({ dynamic: 'data' }),
    });

    const res = await axios.get('http://test.com/api/dynamicData');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ dynamic: 'data' });
  });

  it('should mock with query parameters', async () => {
    createMock({
      url: 'http://test.com/api',
      method: 'get',
      statusCode: 200,
      responseBody: { success: true },
      queryParams: { key: 'value' },
    });

    const res = await axios.get('http://test.com/api', { params: { key: 'value' } });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
  });

  it('should handle options with headers', async () => {
    createMock({
      url: 'http://test.com/api',
      method: 'get',
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
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
  });
});
