import { Logger, Provider } from '@nestjs/common';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { v4 as uuid } from 'uuid';
import { InfoResponse } from '@elastic/elasticsearch/lib/api/types';

import {
  ELK_MODULE_OPTIONS,
  ELK_CLIENT,
  ELK_MSG_ERROR_CONNECTED,
  ELK_MSG_SUCCESSFULLY_CONNECTED,
} from '../constants/elk.constant';

export const createElkClient = (): Provider => ({
  provide: ELK_CLIENT,
  useFactory: async (options: ClientOptions): Promise<Client> => {
    const client: Client = new Client({
      ...options,
      generateRequestId: () => uuid(),
    });

    /* istanbul ignore next */
    client
      .info()
      .then((_response: InfoResponse) =>
        Logger.log(`${ELK_MSG_SUCCESSFULLY_CONNECTED} ${_response.name}`, 'ElkModule'),
      )
      .catch((_error): void => {
        Logger.error(`${ELK_MSG_ERROR_CONNECTED} ${_error.message}`, 'ElkModule');
      });

    return client;
  },
  inject: [ELK_MODULE_OPTIONS],
});
