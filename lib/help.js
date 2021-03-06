// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: generator-loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var g = require('./globalize');
var _ = require('lodash');
var table = require('text-table');
var helpers = require('./helpers.js');
var debug = require('debug')('loopback:generator:help');
var util = require('util');

/**
 * Customize the help message based on how the generator is invoked (slc|yo)
 * @param {Object} generator The generator instance
 * @param {String} cmd The cmd name
 * @returns {String} The customized help string
 */
exports.customHelp = function(generator, usageFilePath, cmd) {
  var command = cmd || helpers.getCommandName();

  // Build usage
  var helpStr = [
    g.f('Usage:'),
    '  ' + usageBuild(generator),
    '',
  ];

  // Build options
  if (Object.keys(generator._options).length) {
    helpStr = helpStr.concat([
      g.f('Options:'),
      optionsBuild(generator),
      '',
    ]);
  }

  // Build arguments
  if (generator._arguments.length) {
    helpStr = helpStr.concat([
      g.f('Arguments:'),
      argumentsBuild(generator),
      '',
    ]);
  }

  // Append USAGE file if any
  var usageText = g.f(usageFilePath);
  if (usageText !== usageFilePath) {
    helpStr.push(usageText);
  }

  helpStr = helpStr.join('\n');

  if (command === 'loopback-cli') {
    return helpStr
      .replace(/ (yo|slc) loopback:/g, ' lb ')
      .replace(/ (yo|slc) loopback/g, ' lb');
  }

  return helpStr.replace(/ yo | slc /g, ' ' + command + ' ');
};

function formatArg(argItem) {
  var arg = '<' + argItem.name + '>';

  if (!(argItem.config && argItem.config.required)) {
    arg = '[' + arg + ']';
  }

  return arg;
}

/**
 * Output usage information for this given generator, depending on its arguments,
 * options or hooks.
 */

function usageBuild(generator) {
  var options = Object.keys(generator._options).length ? g.f('[options]') : '';
  var name = ' ' + generator.options.namespace;
  var args = '';
  if (generator._arguments.length) {
    args = ' ' + generator._arguments.map(formatArg).join(' ');
  }

  name = name.replace(/^yeoman:/, '');
  var out = 'yo' + name + ' ' + options + args;

  if (generator.description) {
    out += '\n\n' + generator.description;
  }

  return out;
}

/**
 * Build options
 */
function optionsBuild(generator) {
  var options = _.reject(generator._options, function(el) {
    return el.hide;
  });

  var rows = options.map(function(opt) {
    if (opt) {
      opt.desc = opt.desc || opt.description;
    }
    var defaults = opt.default;

    return [
      '',
      opt.alias ? '-' + opt.alias + ', ' : '',
      '--' + opt.name,
      opt.desc ? '# ' + opt.desc : '',
      defaults == null || defaults === '' ? '' : g.f('Default: ') + defaults,
    ];
  });

  return table(rows);
}

/**
 * Get help text for arguments
 * @returns {String} Text of options in formatted table
 */
function argumentsBuild(generator) {
  var rows = generator._arguments.map(function(arg) {
    arg.desc = arg.desc || arg.description;

    return [
      '',
      arg.name ? arg.name : '',
      arg.desc ? '# ' + arg.desc : '',
      arg.type ? g.f('Type: ') + arg.type.name : '',
      g.f('Required: ') + (arg.required),
    ];
  });

  return table(rows);
}
