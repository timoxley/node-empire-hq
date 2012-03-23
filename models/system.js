'use strict'

var mongoose = require('mongoose')
var timestamps = require('mongoose-tools').plugins.timestamps

var Schema = mongoose.Schema

var SystemSchema = new Schema({
  project: { type: Schema.ObjectId, ref: 'Project' },
  arch: String,
  platform: String,
  versions: String,
  memoryUsage: String,
  uptime: String,
  ip: String
})

SystemSchema.plugin(timestamps)

var System = module.exports = mongoose.model('System', SystemSchema)
