const md5 = require('md5');
const { isString, assign, omit } = require('lodash');

function key(axiosConfig) {
  //Content-Length is calculated automatically by Axios before sending a request
  //We don't want to include it here because it could be changed by axios

  let url = axiosConfig.url;
  let method = axiosConfig.method;
  let data = axiosConfig.data;
  let headers = axiosConfig.headers;

  if (isString(data)) {
    data = JSON.parse(data);
  }

  if (headers.common) {
    headers = assign(
      {},
      headers.common,
      headers[axiosConfig.method],
      omit(headers, ['common', 'delete', 'get', 'head', 'post', 'put', 'patch'])
    );
  }
  headers = omit(headers, ['Content-Length', 'content-length']);

  return md5(JSON.stringify({ url, method, data, headers }));
}

module.exports = key;
