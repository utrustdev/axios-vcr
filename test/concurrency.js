const fs = require('fs');
const rimraf = require('rimraf');
const assert = require('assert');
const VCR = require('../index');
const { isEmpty } = require('lodash');

function clearFixtures() {
  rimraf.sync('./test/fixtures');
}

describe('Axios VCR - Concurrency', function () {
  const axios = require('axios');

  describe('Multiple Request from different sources', function () {
    this.timeout(15000);

    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    it('stores multiple requests to the same cassette', async () => {
      const path = './test/fixtures/concurrency.json';

      const api1 = 'https://api.jikan.moe/v3';
      const api2 = 'https://api.spacexdata.com/v4/launches/latest';
      const api3 = 'https://api.nobelprize.org/2.1/nobelPrizes';
      const api4 = 'https://api.teleport.org/api/cities/geonameid:5391959';

      VCR.mountCassette(path);

      const api1Promise = axios.get(api1);
      const api2Promise = axios.get(api2);
      const api3Promise = axios.get(api3);
      const api4Promise = axios.get(api4);

      return Promise.all([api1Promise, api2Promise, api3Promise, api4Promise])
        .then(function (responses) {
          assert.equal(Array.isArray(responses), true);
          assert.equal(isEmpty(responses[0].data), false);
          assert.equal(isEmpty(responses[1].data), false);
          assert.equal(isEmpty(responses[2].data), false);
          assert.equal(isEmpty(responses[3].data), false);
        })
        .finally(() => {
          VCR.ejectCassette(path);
        });
    });
  });
});
