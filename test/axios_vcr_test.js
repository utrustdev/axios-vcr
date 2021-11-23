const fs = require('fs');
const rimraf = require('rimraf');
const assert = require('assert');
const VCR = require('../index');
const _ = require('lodash');

function clearFixtures() {
  rimraf.sync('./test/fixtures');
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

function getFixture(cassettePath, config) {
  const loadAt = require('../lib/jsonDb').loadAt;
  const digest = require('../lib/digest');
  const key = digest(config);

  return loadAt(cassettePath, key);
}

describe('Axios VCR', function () {
  this.timeout(10000);
  const posts = 'http://jsonplaceholder.typicode.com/posts/1';
  const axios = require('axios');

  describe('recording', function () {
    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    it('generates stubs for requests', async () => {
      const path = './test/fixtures/posts.json';
      VCR.mountCassette(path);

      return axios
        .get(posts)
        .then(function (response) {
          return getFixture(path, response.config).then(function (fixture) {
            assert.deepEqual(fixture.originalResponseData.data, response.data);
          });
        })
        .finally(() => {
          VCR.ejectCassette(path);
        });
    });

    it('works with nested folders', async () => {
      const cassettePath = './test/fixtures/nested/posts.json';
      VCR.mountCassette(cassettePath);

      return axios
        .get(posts)
        .then(function (response) {
          return getFixture(cassettePath, response.config).then(function (
            fixture
          ) {
            assert.deepEqual(fixture.originalResponseData.data, response.data);
          });
        })
        .finally(() => {
          VCR.ejectCassette(cassettePath);
        });
    });

    it('stores headers and status', async () => {
      const cassettePath = './test/fixtures/posts.json';
      VCR.mountCassette(cassettePath);

      return axios
        .get(posts)
        .then(function (response) {
          return getFixture(cassettePath, response.config).then(function (
            fixture
          ) {
            assert.deepEqual(
              fixture.originalResponseData.headers,
              response.headers
            );
            assert.equal(fixture.originalResponseData.status, response.status);
            assert.equal(
              fixture.originalResponseData.statusText,
              response.statusText
            );
          });
        })
        .finally(() => {
          VCR.ejectCassette(cassettePath);
        });
    });
  });

  describe('replaying', function () {
    /*
      This is a tricky test.
      I'm not aware of any way to check that a network request has been made.
      So instead we hit an unexisting URL that is backed by a cassette. We can now
      check that the response is the same as the cassette file.
    */
    it('skips remote calls', async () => {
      const path = './test/static_fixtures/posts.json';
      assert(fileExists(path));

      const url = 'http://something.com/unexisting';
      VCR.mountCassette(path);

      return axios.get(url).then(function (res) {
        return getFixture(path, res.config)
          .then(function (fixture) {
            assert.deepEqual(
              fixture.originalResponseData,
              _.omit(res, 'fixture')
            );
          })
          .finally(() => {
            VCR.ejectCassette(path);
          });
      });
    });

    it('makes remote call when a cassette is not available', async () => {
      const path = './test/static_fixtures/no_posts.json';

      try {
        fs.unlinkSync(path);
      } catch (e) {}

      assert(!fileExists(path));
      VCR.mountCassette(path);

      return axios
        .get(posts)
        .then(function (response) {
          assert.equal(200, response.status);
          fs.unlinkSync(path);
        })
        .finally(() => {
          VCR.ejectCassette(path);
        });
    });
  });

  describe('Multiple Requests', function () {
    this.timeout(15000);

    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    const usersUrl = 'http://jsonplaceholder.typicode.com/users';
    const todosUrl = 'http://jsonplaceholder.typicode.com/todos';

    it('stores multiple requests in the same cassette', async () => {
      const path = './test/fixtures/multiple.json';

      VCR.mountCassette(path);

      const usersPromise = axios.get(usersUrl);
      const todosPromise = axios.get(todosUrl);

      return Promise.all([usersPromise, todosPromise])
        .then(function (responses) {
          const usersResponse = responses[0];
          const todosResponse = responses[1];

          const usersResponsePromise = getFixture(path, usersResponse.config);
          const todosResponsePromise = getFixture(path, todosResponse.config);

          return Promise.all([usersResponsePromise, todosResponsePromise]).then(
            function (fixtures) {
              assert.deepEqual(
                fixtures[0].originalResponseData.data,
                usersResponse.data
              );
              assert.deepEqual(
                fixtures[1].originalResponseData.data,
                todosResponse.data
              );
            }
          );
        })
        .finally(() => {
          VCR.ejectCassette(path);
        });
    });
  });
});
