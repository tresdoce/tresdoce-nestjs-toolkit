import { MessagePattern } from '@nestjs/microservices';
export const Subscription = (topic, options) => {
    /* istanbul ignore next */
    return (...args) => {
        const messagePattern = MessagePattern({ topic, options: options || null });
        messagePattern(...args);
    };
};
