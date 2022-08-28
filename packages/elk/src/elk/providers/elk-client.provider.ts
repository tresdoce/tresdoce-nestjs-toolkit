import { Provider } from '@nestjs/common';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { CONFIG_MODULE_OPTIONS, ELK_CLIENT } from '../constants/elk.constant';
import { v4 as uuid } from 'uuid';

export const createElkClient = (): Provider => ({
  provide: ELK_CLIENT,
  useFactory: async (options: ClientOptions) => {
    return new Client({
      ...options,
      generateRequestId: () => uuid(),
    });
  },
  inject: [CONFIG_MODULE_OPTIONS],
});
