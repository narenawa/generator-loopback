/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var SANDBOX =  path.resolve(__dirname, 'sandbox');
var fs = require('fs');
var expect = require('chai').expect;
var common = require('./common');

describe('loopback:datasource generator', function() {
  beforeEach(common.resetWorkspace);
  beforeEach(function createSandbox(done) {
    helpers.testDirectory(SANDBOX, done);
  });

  beforeEach(function createProject(done) {
    common.createDummyProject(SANDBOX, 'test-app', done);
  });


  it('adds an entry to server/datasources.json', function(done) {
    var modelGen = givenDataSourceGenerator();
    helpers.mockPrompt(modelGen, {
      name: 'crm',
      customConnector: '', // temporary workaround for
                           // https://github.com/yeoman/generator/issues/600
      connector: 'mysql'
    });

    var builtinSources = Object.keys(readDataSourcesJsonSync('server'));
    modelGen.run(function() {
      var newSources = Object.keys(readDataSourcesJsonSync('server'));
      var expectedSources = builtinSources.concat(['crm']);
      expect(newSources).to.have.members(expectedSources);
      done();
    });
  });

  it('allow connector without settings', function(done) {
    var modelGen = givenDataSourceGenerator();
    helpers.mockPrompt(modelGen, {
      name: 'kafka1',
      customConnector: '', // temporary workaround for
                           // https://github.com/yeoman/generator/issues/600
      connector: 'kafka'
    });

    var builtinSources = Object.keys(readDataSourcesJsonSync('server'));
    modelGen.run(function() {
      var newSources = Object.keys(readDataSourcesJsonSync('server'));
      var expectedSources = builtinSources.concat(['kafka1']);
      expect(newSources).to.have.members(expectedSources);
      done();
    });
  });

  it('should support object/array settings', function(done) {
    var restOptions = {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      }
    };
    var modelGen = givenDataSourceGenerator();
    helpers.mockPrompt(modelGen, {
      name: 'rest1',
      customConnector: '', // temporary workaround for
                           // https://github.com/yeoman/generator/issues/600
      connector: 'rest',
      options: JSON.stringify(restOptions),
      operations: '[]'
    });

    var builtinSources = Object.keys(readDataSourcesJsonSync('server'));
    modelGen.run(function() {
      var json = readDataSourcesJsonSync('server');
      var newSources = Object.keys(json);
      var expectedSources = builtinSources.concat(['rest1']);
      expect(newSources).to.have.members(expectedSources);
      expect(json.rest1.options).to.eql(restOptions);
      expect(json.rest1.operations).to.eql([]);
      done();
    });
  });

  function givenDataSourceGenerator(dsArgs) {
    var path = '../../datasource';
    var name = 'loopback:datasource';
    var gen = common.createGenerator(name, path, [], dsArgs, {});
    return gen;
  }

  function readDataSourcesJsonSync(facet) {
    var filepath = path.resolve(SANDBOX, facet || 'server', 'datasources.json');
    var content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  }
});
