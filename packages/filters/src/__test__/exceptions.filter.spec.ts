import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';

import { ExceptionsFilter } from '../lib/filters/exceptions.filter';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));
const mockGetRequest = jest.fn().mockImplementation(() => ({
  url: '/mock-test',
  method: 'GET',
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));

const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest,
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

describe('ExceptionsFilter', () => {
  let service: ExceptionsFilter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExceptionsFilter],
    }).compile();
    service = module.get<ExceptionsFilter>(ExceptionsFilter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Http exception', () => {
    service.catch(new HttpException('Http exception', HttpStatus.BAD_REQUEST), mockArgumentsHost);
    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toBeCalledWith({
      data: null,
      errors: [
        {
          code: 'BAD_REQUEST',
          message: 'Http exception',
          status: 400,
          path: expect.any(String),
        },
      ],
      meta: {
        method: 'GET',
        status: 400,
        url: '/mock-test',
      },
    });
  });
});
