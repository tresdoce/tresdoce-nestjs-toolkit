import { Logger, Provider } from '@nestjs/common';
import { Client, type ClientOptions } from '@elastic/elasticsearch';
import { randomUUID as uuid } from 'node:crypto';

import {
  ELK_CLIENT,
  ELK_MODULE_CLIENT_OPTIONS,
  ELK_MSG_ERROR_CONNECTED,
  ELK_MSG_SUCCESSFULLY_CONNECTED,
} from '../constants/elk.constant.js';

export const createElkClient = (): Provider => ({
  provide: ELK_CLIENT,
  useFactory: async (options: ClientOptions): Promise<Client> => {
    const client: Client = new Client({
      ...options,
      generateRequestId: () => uuid(),
    });

    client
      .info()
      .then((_response) =>
        Logger.log(`${ELK_MSG_SUCCESSFULLY_CONNECTED} ${_response.name}`, 'ElkModule'),
      )
      .catch((_error: Error): void => {
        Logger.error(`${ELK_MSG_ERROR_CONNECTED} ${_error.message}`, 'ElkModule');
      });

    return client;
  },
  inject: [ELK_MODULE_CLIENT_OPTIONS],
});
