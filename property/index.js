'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var workspace = require('loopback-workspace');
var PropertyDefinition = workspace.models.ModelPropertyDefinition;

var actions = require('../lib/actions');
var helpers = require('../lib/helpers');

module.exports = yeoman.generators.Base.extend({
  // NOTE(bajtos)
  // This generator does not track file changes via yeoman,
  // as loopback-workspace is editing (modifying) files when
  // saving project changes.

  loadProject: actions.loadProject,

  loadModels: actions.loadModels,

  askForModel: function() {
    if (this.options.modelName) {
      this.modelName = this.options.modelName;
      return;
    }

    var done = this.async();
    var prompts = [
      {
        name: 'model',
        message: 'Select the model:',
        type: 'list',
        choices: this.modelNames
      }
    ];

    this.prompt(prompts, function(answers) {
      this.modelName = answers.model;
      done();
    }.bind(this));
  },

  findModelDefinition: function() {
    this.modelDefinition = this.projectModels.filter(function(m) {
      return m.name === this.modelName;
    }.bind(this))[0];

    if (!this.modelDefinition) {
      var msg = 'Model not found: ' + this.modelName;
      this.log(chalk.red(msg));
      this.async()(new Error(msg));
    }
  },

  askForParameters: function() {
    var done = this.async();
    this.name = this.options.propertyName;

    var typeChoices = PropertyDefinition.availableTypes.concat({
      name: '(other)',
      value: null
    });

    var prompts = [
      {
        name: 'name',
        message: 'Enter the property name:',
        when: function() {
          return !this.name && this.name !== 0;
        }.bind(this)
      },
      {
        name: 'type',
        message: 'Property type:',
        type: 'list',
        choices: typeChoices,
      },
      {
        name: 'customType',
        message: 'Enter the type:',
        required: true,
        when: function(answers) {
          return answers.type === null;
        }
      },
      {
        name: 'required',
        message: 'Required?',
        type: 'confirm',
        default: false
      }
    ];
    this.prompt(prompts, function(answers) {
      this.name = answers.name || this.name;
      this.type = answers.customType || answers.type;
      this.required = answers.required;
      done();
    }.bind(this));
  },

  property: function() {
    var done = this.async();
    var def = {
      name: this.name,
      type: this.type
    };
    if (this.required) {
      def.required = true;
    }

    this.modelDefinition.properties.create(def, function(err) {
      helpers.reportValidationError(err, this.log);
      return done(err);
    }.bind(this));
  },

  saveProject: actions.saveProject
});