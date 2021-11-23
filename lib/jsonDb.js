const fs = require('fs-promise');
const { set, isUndefined, get } = require('lodash');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

let writing = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * Source: https://github.com/gabrielpoca/axios-vcr/commit/eab91b3d8ef91e4f7c7fc9ec352db592854bbf5f
 * Details: there's a race condition updating the jsondb file when two requests are made
 * simulatenously, where one request overrides the output of the other.
 */
function write(filePath, jsonPath, value) {
  return fs
    .readJson(filePath)
    .then(function (json) {
      set(json, jsonPath, value);
      return fs.writeJson(filePath, json);
    })
    .catch(function (error) {
      var json = {};
      set(json, jsonPath, value);
      return fs.writeJson(filePath, json);
    })
    .then(function () {
      writing = false;
    })
    .catch(function () {
      writing = false;
    });
}

function loadAt(filePath, jsonPath) {
  return fs.readJson(filePath).then(function (json) {
    if (isUndefined(jsonPath)) return json;

    let value = get(json, jsonPath);
    if (!isUndefined(value)) return value;
    else throw 'Invalid JSON Path';
  });
}

function writeAt(filePath, jsonPath, value) {
  if (!writing) {
    writing = true;
    mkdirp.sync(getDirName(filePath));
    return write(filePath, jsonPath, value);
  } else {
    return sleep(2000).then(() => writeAt(filePath, jsonPath, value));
  }
}

module.exports = {
  loadAt: loadAt,
  writeAt: writeAt,
};
