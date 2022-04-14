import * as _ from 'lodash';

export const recursiveCastToString = (object, newObject) => {
  _.map(object, function (value, key) {
    const childs = _.isString(value) ? 0 : Object.keys(value).length;
    if (childs) {
      newObject[key] = {};
      setTimeout(() => recursiveCastToString(value, newObject[key]), 10);
    } else {
      value = value.toString();
      newObject[key] = value;
    }
  });
};

export const castOjectValuesToString = (key, value, newObject) => {
  const childs = _.isString(value) ? 0 : Object.keys(value).length;
  if (childs) {
    newObject[key] = {};
    setTimeout(() => recursiveCastToString(value, newObject[key]), 10);
  } else {
    value = value.toString();
    newObject[key] = value;
  }
};
