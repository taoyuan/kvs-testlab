import {kvsTestAll} from '../all';
import {Store} from 'kvs';

describe('kvs-testlab/all', function () {
  kvsTestAll(() => Store.create('memory'));
});
