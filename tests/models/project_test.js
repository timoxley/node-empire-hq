'use strict'

var assert = require('assert')

var mongoose = require('mongoose')
var config = require(process.cwd() + '/config')
var dropCollections = require('mongoose-tools').helpers(mongoose).dropCollections

var Project = require(process.cwd() + '/models/project')

describe('project', function() {
  describe('submit', function() {
    describe('creation', function() {
      beforeEach(function(done) {
        dropCollections(done)
      })
      it('creates new projects', function(done) {
        Project.submit({
          name: 'test project',
          version: '0.0.0'
        }, function(err, project) {
          assert.ifError(err)
          Project.findOne(function(err, foundProject) {
            assert.ifError(err)
            assert.equal(project.name, foundProject.name)
            assert.equal(project.version, foundProject.version)
            done()
          })
        })
      })
      it('creates timestamps', function(done) {
       Project.create({
          name: 'test project',
          version: '0.0.0'
        }, function(err, project) {
          assert.ifError(err)
          assert.ok(project.createdAt)
          assert.ok(project.updatedAt)
          done()
        })
      })
    })
    describe('updates', function() {
      var PROJECT_NAME = 'test project'
      var PROJECT_VERSION = '0.1.0'
      var PROJECT_DESCRIPTION = 'some description'
      before(function(done) {
        dropCollections(done)
      })
      before(function(done) {
        Project.submit({
          name: PROJECT_NAME,
          version: PROJECT_VERSION,
          description: PROJECT_DESCRIPTION
        }, done)
      })
      it('updates (not create) if name and version are the same', function(done) {
        var UPDATED_DESCRIPTION = PROJECT_DESCRIPTION + ' with some update'
        Project.submit({
          name: PROJECT_NAME,
          version: PROJECT_VERSION,
          description: UPDATED_DESCRIPTION
        }, function(err, project) {
          assert.ifError(err)
          Project.find({name: PROJECT_NAME}, function(err, foundProjects) {
            assert.ifError(err)
            assert.equal(foundProjects.length, 1)
            var project = foundProjects[0]
            assert.equal(project.name, PROJECT_NAME)
            assert.equal(project.version, PROJECT_VERSION)
            assert.equal(project.description, UPDATED_DESCRIPTION)
            done()
          })
        })
      })
      it('removes properties in update', function(done) {
        Project.submit({
          name: PROJECT_NAME,
          version: PROJECT_VERSION,
        }, function(err, project) {
          assert.ifError(err)
          Project.find({name: PROJECT_NAME}, function(err, foundProjects) {
            assert.ifError(err)
            assert.equal(foundProjects.length, 1)
            var project = foundProjects[0]
            assert.equal(project.name, PROJECT_NAME)
            assert.equal(project.version, PROJECT_VERSION)
            assert.equal(project.description, undefined)
            done()
          })
        })
      })
    })
  })
})
