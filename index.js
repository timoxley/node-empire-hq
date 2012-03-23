'use strict'

var restify = require('restify')
var settings = require('./config').settings
var _ = require('underscore')
var async = require('async')

var mongoose = require('mongoose')
var Project = require('./models/project')
var System = require('./models/system')
var Module = require('./models/module')

var server = restify.createServer({
  name: 'EmpireServer',
  version: '0.0.1',
})

server.use(restify.acceptParser(server.acceptable))
server.use(restify.bodyParser())
server.use(restify.queryParser())

server.get('ping', function(req, res) {
  res.send()
})

server.post('submit', function(req, res, next) {
  var payload = req.params
  payload.system = payload.system || {}
  payload.system.ip = req.connection.remoteAddress
  processPayload(payload, function(err) {
    if (err) return res.send(err)
    res.send()
  })
})

var processPayload = function(payload, callback) {
  var systemData = payload.system || null
  var projectData = payload.project || null
  var moduleDatas = []
  if (projectData) {
    moduleDatas = projectData.dependencies || []
    delete projectData.dependencies
  }
  async.waterfall([function(next) {
    // first upsert project
    if (projectData) {
      Project.submit(projectData, next)
    } else {
      next(null, null)
    }
  }, function(project, next) {
    async.parallel([function(done) {
      // save system and also
      if (project) {
        systemData.project = project._id
      }
      if (systemData) {
        System.create(systemData, done)
      } else {
        done()
      }
    }, function(done) {
      // save each module
      var modules = []
      for (var module in moduleDatas) {
        modules.push(moduleDatas[module])
      }
      async.forEach(modules, function(moduleData, next) {
        Module.create(moduleData, next)
      }, done)
    }], next)
  }], callback)
}

// Only listen automatically if booted from commandline
if (!module.parent) {
  server.boot()
}

server.boot = function(callback) {
  if (!mongoose.connection.readyState) {
    mongoose.connection.on('open', function() {
      server.listen(settings.port, callback)
    })
  } else {
    server.listen(settings.port, callback)
  }
  return server
}

module.exports = server
