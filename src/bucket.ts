import {expect} from '@tib/testlab';
import {Bucket, Store} from 'kvs';
import {StoreProvider} from './types';
import {random} from './support';

export function kvsTestBuckets(provider: StoreProvider) {
  const types: any = {
    string: {
      genValue: function () {
        return random.string();
      },
      options: {},
    },
    hash: {
      genValue: function () {
        return {name: random.string()};
      },
      options: {type: 'hash'},
    },
  };

  Object.keys(types).map(name =>
    testKVS(name, types[name].genValue, types[name].options),
  );

  function testKVS(
    name: string,
    genValue: () => string,
    options: Record<string, any>,
  ) {
    context('bucket ' + name, function () {
      let store: Store;
      let bucket: Bucket;
      let key: string;
      let value: any;

      beforeEach(async () => {
        store = provider();
        bucket = await store.createBucket(random.string(), options);
        key = random.string(20);
        value = genValue();
      });

      afterEach(async () => {
        await bucket.clear();
        await store.close();
      });

      describe('has()', function () {
        it('should has worked', async function () {
          expect(await bucket.has(key)).equal(0);
          await bucket.set(key, value);
          expect(await bucket.has(key)).equal(1);
        });
      });

      describe('get() and set()', function () {
        it('should set and get data in bucket', async () => {
          await bucket.set(key, value);
          const result = await bucket.get(key);
          expect(result).deepEqual(value);
        });
      });

      describe('del()', function () {
        beforeEach(() => bucket.set(key, value));

        it('should delete data from bucket', async () => {
          let result = await bucket.get(key);
          expect(result).deepEqual(value);
          await bucket.del(key);
          await bucket.get(key);
          result = await bucket.get(key);
          expect(result).not.ok();
        });

        it('should delete data without a callback', async () => {
          let result = await bucket.get(key);
          expect(result).deepEqual(value);
          await bucket.del(key);
          result = await bucket.get(key);
          expect(result).not.ok();
        });
      });

      it('getset()', async () => {
        await bucket.set(key, value);
        const newValue = genValue();
        let result = await bucket.getset(key, newValue);
        expect(value).deepEqual(result);
        result = await bucket.get(key);
        expect(newValue).deepEqual(result);
      });

      it('getdel()', async () => {
        await bucket.set(key, value);
        let result = await bucket.getdel(key);
        expect(value).deepEqual(result);
        result = await bucket.get(key);
        expect(result).not.ok();
      });

      it('keys()', async () => {
        const expected: string[] = [];
        for (let i = 0; i < 10; i++) {
          const k = random.string();
          await bucket.set(k, genValue());
          expected.push(k);
        }

        const keys = await bucket.keys();
        expect(expected).containDeep(keys);
      });

      it('clear()', async () => {
        await bucket.set('key1', value);
        await bucket.set('key2', value);

        let val1 = await bucket.get('key1');
        let val2 = await bucket.get('key2');
        expect(val1).ok();
        expect(val2).ok();

        await bucket.clear();

        val1 = await bucket.get('key1');
        val2 = await bucket.get('key2');

        expect(val1).not.ok();
        expect(val2).not.ok();
      });
    });
  }
}
