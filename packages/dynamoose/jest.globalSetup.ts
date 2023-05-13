import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';
import * as path from 'path';

const services = ['dynamodb'];
const composeFilePath = path.resolve(__dirname, '..', '..');

module.exports = initDockerCompose(services, composeFilePath);
