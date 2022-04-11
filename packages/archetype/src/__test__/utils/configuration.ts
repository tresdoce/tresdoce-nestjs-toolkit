import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import { mockedConfig } from './mocks';

export default registerAs('config', (): Typings.AppConfig => mockedConfig);
