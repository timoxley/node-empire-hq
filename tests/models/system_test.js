'use strict'

var assert = require('assert')

var mongoose = require('mongoose')
var config = require(process.cwd() + '/config')
var dropCollections = require('mongoose-tools').helpers(mongoose).dropCollections

var System = require(process.cwd() + '/models/system')

describe('system', function() {
  describe('submit', function() {
    describe('creation', function() {
      beforeEach(function(done) {
        dropCollections(done)
      })
      it('creates new system', function(done) {
        System.create({
          arch: 'x86',
          platform: 'darwin'
        }, function(err, system) {
          assert.ifError(err)
          System.find(function(err, foundSystems) {
            assert.ifError(err)
            assert.equal(foundSystems.length, 1)
            var foundSystem = foundSystems[0]
            assert.equal(system.arch, foundSystem.arch)
            assert.equal(system.platform, foundSystem.platform)
            done()
          })
        })
      })
      it('creates timestamps', function(done) {
       System.create({
          arch: 'x86',
          platform: 'darwin'
        }, function(err, system) {
          assert.ifError(err)
          assert.ok(system.createdAt)
          assert.ok(system.updatedAt)
          done()
        })
      })
    })
  })
})
