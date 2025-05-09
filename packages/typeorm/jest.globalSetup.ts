import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';
import * as path from 'path';

const services: string[] = ['postgres', 'mongo', 'mysql'];
const composeFilePath = path.resolve(__dirname, '..', '..');

module.exports = initDockerCompose(services, composeFilePath);
