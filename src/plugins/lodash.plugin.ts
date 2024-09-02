import * as lodash from 'lodash';
import { IGroup } from '@app/interfaces';

export class GroupBy {
  static property<TItems>(
    items: TItems[],
    keyToGroupBy: string,
  ): IGroup<TItems> {
    return lodash.groupBy(items, keyToGroupBy);
  }
}
