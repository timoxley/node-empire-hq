'use strict'

var assert = require('assert')
var _ = require('underscore')

var restify = require('restify')
var settings = require(process.cwd() + '/config').settings

var mongoose = require('mongoose')
var dropCollections = require('mongoose-tools').helpers(mongoose).dropCollections

var Project = require(process.cwd() + '/models/project')
var System = require(process.cwd() + '/models/system')
var Module = require(process.cwd() + '/models/module')

var dummySubmission = require('./fixtures/package_info.json')
var EmpireServer = require(process.cwd() + '/index')

describe('server', function() {
  var client, server
  describe('remote operations', function() {
    var oldCwd, server
    before(function(done) {
      oldCwd = process.cwd()
      process.chdir('./tests/fixtures/fixture_module')
      server = EmpireServer.boot(done)
    })
    after(function(done) {
      process.chdir(oldCwd)
      server.on('close', done)
      server.close()
    })
    describe('basic requests', function() {
      before(function() {
        client = restify.createJsonClient({
          url: settings.url,
          version: '~0.0.1'
        })
      })
      var response
      before(function(done) {
        client.get('/ping', function(err, req, res) {
          response = res
          done()
        })
      })
      it('server has the name "EmpireServer"', function() {
        assert.equal(response.headers.server, 'EmpireServer')
      })
      it('server has a version', function() {
        assert.ok(response.headers['x-api-version'])
      })
    })
    describe('handling submissions', function() {
      beforeEach(function(done) {
        dropCollections(done)
      })
      it('saves project info', function(done) {
        client.post('/submit', dummySubmission, function(err, payload) {
          assert.ifError(err)
          var project = dummySubmission.project
          Project.find(function(err, projects) {
            assert.ifError(err)
            assert.equal(projects.length, 1)
            var foundProject = projects[0]
            assert.equal(foundProject.name, project.name)
            assert.equal(foundProject.version, project.version)
            done()
          })
        })
      })
      it('saves system info', function(done) {
        client.post('/submit', dummySubmission, function(err, req, res, payload) {
          assert.ifError(err)
          var system = dummySubmission.system
          System.find(function(err, systems) {
            assert.ifError(err)
            assert.equal(systems.length, 1)
            var foundSystem = systems[0]
            assert.equal(foundSystem.arch, system.arch)
            done()
          })
        })
      })
      it('saves module info', function(done) {
        client.post('/submit', dummySubmission, function(err, req, res, payload) {
          assert.ifError(err)
          var dependencies = dummySubmission.project.dependencies
          Module.find(function(err, foundModules) {
            assert.ifError(err)
            assert.equal(foundModules.length, 2)
            assert.ok(_.any(foundModules, function(dep) {
              return dependencies.async.name == dep.name &&
                     dependencies.async.version == dep.version
            }))
            assert.ok(_.any(foundModules, function(dep) { 
              return dependencies.underscore.name == dep.name &&
                     dependencies.underscore.version == dep.version
            }))
            done()
          })
        })
      })
    })
  })
})
