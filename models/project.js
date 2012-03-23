'use strict'

var mongoose = require('mongoose')
var timestamps = require('mongoose-tools').plugins.timestamps

var Schema = mongoose.Schema

var ProjectSchema = new Schema({
  project: [{type: Schema.ObjectId, ref: 'Project'}],
  name: String,
  version: String,
  description: String,
  dependencies: [{type: Schema.ObjectId, ref: 'Module'}],
  engines: String,
  homepage: String,
  keywords: [String],
  system: {type: Schema.ObjectId, ref: 'System'}
})

ProjectSchema.plugin(timestamps)
ProjectSchema.statics.submit = function(data, callback) {
  Project.findOne({name: data.name, version: data.version}, function(err, found) {
    if (err) return callback(err)
    var project
    if (found) {
      var unset = {}
      for (var prop in found.toJSON()) {
        if (undefined === data[prop] && prop !== '_id') {
          unset[prop] = 1
        }
      }
      Project.update({_id: found._id}, {$set: data, $unset: unset}, function(err) {
        if (err) return callback(err)
        data._id = found._id
        return callback(err, data)
      })
    } else {
      project = new Project(data)
      project.save(function(err, data) {
        callback(err, data)
      })
    }
  })
}
var Project = module.exports = mongoose.model('Project', ProjectSchema)

