#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const pkgJson = require('../package.json');
const createProject = require('./commands/create.js');

program
	.name(pkgJson.name)
	.description(pkgJson.description)
	.version(pkgJson.version);

program.command('create')
	.description('Create a new project')
	.action(function() {
		createProject()
	});

program.parse();