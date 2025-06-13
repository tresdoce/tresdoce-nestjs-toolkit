import { registerAs } from '@nestjs/config';
import _ from 'lodash';
import { appConfigBase } from '../fixtures/appConfigBase';
export const dynamicConfig = ({ ...args } = {}) => registerAs('config', () => _.mergeWith(_.cloneDeep(appConfigBase), args));
