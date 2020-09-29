import {Store} from 'kvs';

export type StoreProvider = () => Promise<Store>;

export interface Suite {
  test(provider: StoreProvider): void;
}
