import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';
import * as path from 'path';

const services = ['sqs-localstack'];
const composeFilePath = path.resolve(__dirname, '..', '..');

module.exports = initDockerCompose(services, composeFilePath);
