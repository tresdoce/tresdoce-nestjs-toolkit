import { appConfigBase } from '../fixtures/appConfigBase';

export const config = () => jest.fn().mockImplementation(() => appConfigBase);

export const executionContext: any = () => ({
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
});
