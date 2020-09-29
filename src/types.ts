import {Store} from 'kvs';

export type StoreProvider = () => Store;

export interface Suite {
  test(provider: StoreProvider): void;
}
