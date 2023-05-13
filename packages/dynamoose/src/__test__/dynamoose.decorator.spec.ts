import { Inject } from '@nestjs/common';
import { getModelToken } from '../dynamoose/common/index';
import { InjectModel } from '../dynamoose/decorators/index';

jest.mock('@nestjs/common', () => ({
  Inject: jest.fn(),
}));
jest.mock('../dynamoose/common/index', () => ({
  getModelToken: jest.fn(),
}));

describe('Decorator', () => {
  describe('InjectModel', () => {
    const model = 'MyModel';

    beforeAll(() => {
      (getModelToken as jest.Mock).mockReturnValue(model);
    });

    it('should call Inject with correct token', () => {
      const token = `${model}`;
      InjectModel(model);
      expect(getModelToken).toHaveBeenCalledWith(model);
      expect(Inject).toHaveBeenCalledWith(token);
    });
  });
});
