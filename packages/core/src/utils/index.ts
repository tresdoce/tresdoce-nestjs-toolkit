import { TSkipHealthChecks } from '../typings';

export const getSkipHealthChecks = (_value: string): TSkipHealthChecks[] => {
  return _value
    ? (_value.split(',').map((_item: string) => _item.toLowerCase().trim()) as TSkipHealthChecks[])
    : [];
};
