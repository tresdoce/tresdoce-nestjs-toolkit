import { castOjectValuesToString, recursiveCastToString } from '../lib/utils/logging.utils';
import * as _ from 'lodash';

describe('eslint-config', () => {
  it('should be return a casted object', () => {
    let initialObject = {
      a: 1,
      b: 2,
      c: {
        x: 9,
        y: 10,
      },
    };
    let castHeaders = {};
    _.map(initialObject, function (value, key) {
      castOjectValuesToString(key, value, castHeaders);
    });
    castOjectValuesToString({ a: 1, b: 2 }, 'a', castHeaders);
    recursiveCastToString(initialObject, castHeaders);
    expect(typeof castHeaders).toBe('object');
    expect(castHeaders).toBeDefined();
  });
});
