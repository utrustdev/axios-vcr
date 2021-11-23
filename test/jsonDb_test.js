const jsonDB = require('../lib/jsonDb');
const assert = require('assert');
const fs = require('fs-promise');
const rimraf = require('rimraf');

function clearFixtures() {
  rimraf.sync('./test/jdb/*');
}

describe('JsonDB', function () {
  afterEach(clearFixtures);

  describe('loadAt', function () {
    const path = './test/jdb/temp.json';

    beforeEach(function () {
      fs.writeJsonSync(path, {
        a: {
          b: {
            c: 'it works!',
          },
        },
      });
    });

    it('loads an object from a JSON stored in a file', async () => {
      return jsonDB.loadAt(path).then(function (payload) {
        assert.deepEqual(payload, {
          a: {
            b: {
              c: 'it works!',
            },
          },
        });
      });
    });

    it('accepts nested paths', async () => {
      return jsonDB.loadAt(path, 'a.b.c').then(function (payload) {
        assert.equal(payload, 'it works!');
      });
    });

    it('fails when the file does not exist', async () => {
      jsonDB.loadAt('./test/jdb/unexisting.json').catch(function (error) {
        assert.equal(error.code, 'ENOENT');
      });
    });

    it('fails when the json path does not exist', async () => {
      jsonDB.loadAt('./test/jdb/temp.json', 'a.b.c.d').catch(function (error) {
        assert.equal(error, 'Invalid JSON Path');
      });
    });
  });

  describe('writeAt', function () {
    const path = './test/jdb/temp_write.json';

    beforeEach(function () {
      fs.writeJsonSync(path, {
        a: {
          b: {},
        },
      });
    });

    it('writes at a given path', async () => {
      const time = new Date().getTime();
      const payload = { c: 'Axios VCR', time: time };

      return jsonDB.writeAt(path, 'a.b', payload).then(function () {
        return jsonDB.loadAt(path, 'a.b').then(function (json) {
          assert.deepEqual(payload, json);
        });
      });
    });

    it('creates missing keys', async () => {
      const payload = 'nested stuff';
      return jsonDB.writeAt(path, 'a.b.c.d.e', payload).then(function () {
        return jsonDB.loadAt(path, 'a.b.c.d.e').then(function (json) {
          assert.deepEqual(payload, json);
        });
      });
    });

    it('creates missing parts of the path', async () => {
      const path = './test/jdb/nested/temp_write.json';
      const payload = 'something';

      return jsonDB.writeAt(path, 'a', payload).then(function () {
        return jsonDB.loadAt(path, 'a').then(function (json) {
          assert.deepEqual(payload, json);
        });
      });
    });
  });
});
