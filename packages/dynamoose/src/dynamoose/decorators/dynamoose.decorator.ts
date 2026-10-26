import { Inject } from '@nestjs/common';
import { getModelToken } from '../common/index.js';

export const InjectModel = (model: string) => Inject(getModelToken(model));
