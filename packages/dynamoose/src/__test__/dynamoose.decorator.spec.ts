import type { Mock } from 'vitest';
import { Inject } from '@nestjs/common';
import { getModelToken } from '../dynamoose/common/index.js';
import { InjectModel } from '../dynamoose/decorators/index.js';

vi.mock('@nestjs/common', () => ({
  Inject: vi.fn(),
}));
vi.mock('../dynamoose/common/index.js', () => ({
  getModelToken: vi.fn(),
}));

describe('Decorator', () => {
  describe('InjectModel', () => {
    const model = 'MyModel';

    beforeAll(() => {
      (getModelToken as Mock).mockReturnValue(model);
    });

    it('should call Inject with correct token', () => {
      const token = `${model}`;
      InjectModel(model);
      expect(getModelToken).toHaveBeenCalledWith(model);
      expect(Inject).toHaveBeenCalledWith(token);
    });
  });
});
