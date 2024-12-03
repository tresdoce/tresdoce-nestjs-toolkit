import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import _ from 'lodash';

import { appConfigBase } from '../fixtures/appConfigBase';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const dynamicConfig = ({ ...args }: DeepPartial<Typings.AppConfig> = {}) =>
  registerAs('config', (): Typings.AppConfig => (_.mergeWith(_.cloneDeep(appConfigBase), args)));
