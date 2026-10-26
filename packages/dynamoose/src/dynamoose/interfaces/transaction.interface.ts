/* istanbul ignore file */
import dynamoose from 'dynamoose';
import { TransactionSettings } from 'dynamoose/dist/Transaction.js';
import {
  CallbackType,
  ConditionTransactionInput,
  CreateTransactionInput,
  DeleteTransactionInput,
  GetTransactionInput,
  UpdateTransactionInput,
} from './model.interface.js';

export type Transaction =
  | GetTransactionInput
  | CreateTransactionInput
  | DeleteTransactionInput
  | UpdateTransactionInput
  | ConditionTransactionInput;

export type Transactions = (Transaction | Promise<Transaction>)[];

export abstract class TransactionSupport {
  transaction(
    transactions: Transactions,
    settings?: TransactionSettings,
    callback?: CallbackType<any, any>,
  ): any {
    /* istanbul ignore next */
    return dynamoose.transaction(transactions, settings as any, callback as any);
  }
}
