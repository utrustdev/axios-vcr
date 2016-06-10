# axios-vcr
[![Build Status](https://travis-ci.org/nettofarah/axios-vcr.svg?branch=master)](https://travis-ci.org/nettofarah/axios-vcr)

axios-vcr is a set of [axios](https://github.com/mzabriskie/axios) middlewares that allow you to record and replay axios requests.

Use it for reliable, fast and more deterministic tests.

## Features
- Record http requests to JSON cassette files
- Replay requests from cassete files
- Multiple request/response fixtures per cassette
- 

## Installation
```bash
npm install --save-dev axios-vcr
```

## Usage
Using axios-vcr is very simple. All you need to do is to provide a cassette path and wrap your axios code in a `VCR.use` call.

```javascript
var axiosVCR = require('axios-vcr');

axiosVCR.useCassette('./test/fixtures/cats.json', () => {
  axios.get('https://reddit.com/r/cats.json').then(response => {
    // axios-vcr will store the remote response from /cats.json
    // in ./test/fixtures/cats.json
    // Subsequent requests will then load the response from ./test/fixtures/cats.json
  })
})
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/nettofarah/axios-vcr. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the Code of Conduct.

To run the specs check out the repo and follow these steps:

```bash
$ npm install
$ npm run test
```

## License

The module is available as open source under the terms of the MIT License.
