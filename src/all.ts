import {StoreProvider} from './types';
import {kvsTestBuckets} from './bucket';

const suites = [kvsTestBuckets];

export function kvsTestAll(provider: StoreProvider) {
  for (const suite of suites) {
    suite(provider);
  }
}
