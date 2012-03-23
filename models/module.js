'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ModuleSchema = new Schema({
  name: String,
  version: String
})

module.exports = mongoose.model('Module', ModuleSchema)

