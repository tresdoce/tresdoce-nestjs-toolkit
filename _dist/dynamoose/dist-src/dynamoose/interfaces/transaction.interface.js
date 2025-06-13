/* istanbul ignore file */
import * as dynamoose from 'dynamoose';
export class TransactionSupport {
    transaction(transactions, settings, callback) {
        /* istanbul ignore next */
        return dynamoose.transaction(transactions, settings, callback);
    }
}
