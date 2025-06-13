import { Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { v4 as uuid } from 'uuid';
import { ELK_MODULE_OPTIONS, ELK_CLIENT, ELK_MSG_ERROR_CONNECTED, ELK_MSG_SUCCESSFULLY_CONNECTED, } from '../constants/elk.constant';
export const createElkClient = () => ({
    provide: ELK_CLIENT,
    useFactory: async (options) => {
        const client = new Client({
            ...options,
            generateRequestId: () => uuid(),
        });
        /* istanbul ignore next */
        client
            .info()
            .then((_response) => Logger.log(`${ELK_MSG_SUCCESSFULLY_CONNECTED} ${_response.name}`, 'ElkModule'))
            .catch((_error) => {
            Logger.error(`${ELK_MSG_ERROR_CONNECTED} ${_error.message}`, 'ElkModule');
        });
        return client;
    },
    inject: [ELK_MODULE_OPTIONS],
});
