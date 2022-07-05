#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const pkgJson = require('../package.json');
const createProject = require('./commands/create.js');
const startProject = require('./commands/start.js');

program
	.name(pkgJson.name)
	.description(pkgJson.description)
	.version(pkgJson.version);

program.command('create')
	.description('Create a new project')
	.action(function() {
		createProject()
	});

program.command('start')
	.description('Start your Neutralino App')
	.option('--disable-auto-reload', 'Disable Auto Reload')
	.option('--frontend-lib-dev', 'Enable This Flag When Using A Frontend Library (eg - React)')
	.option('--arch <arch>', 'Architecture CPU To Run the App (automatically detected)')
	.action(function(options) {
		startProject(options);
	});

program.parse();