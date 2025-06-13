import { Inject } from '@nestjs/common';
import { getModelToken } from '../common/index';
export const InjectModel = (model) => Inject(getModelToken(model));
