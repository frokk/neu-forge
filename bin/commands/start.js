const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createSpinner } = require('nanospinner');
const config = require('../../src/lib/config.js');
const constants = require('../../src/lib/constants.js');
const websocket = require('../../src/lib/websocket.js');
const filewatcher = require('../../src/lib/filewatcher.js');

function getBinaryName(arch) {
	let platform = process.platform;

	// Use x64 binary for M1 chip (arm64) Translation is handled by macOS
	if (platform == 'darwin' && arch == 'arm64') {
		arch = 'x64';
	}

	if(!(platform in constants.files.binaries))
		return null;
	if(!(arch in constants.files.binaries[process.platform]))
		return null;

	return constants.files.binaries[process.platform][arch];
}

module.exports = (options = {}) => {
	let spinner = createSpinner(`Finding Binaries`).start();
	try {
		let configObj = config.get();
		let args = " --load-dir-res --path=. --export-auth-info --neu-dev-extension";

		if(!options.disableAutoReload && !options.frontendLibDev) {
			args += " --neu-dev-auto-reload";
			filewatcher.start();
		}

		websocket.start({
			frontendLibDev: options.frontendLibDev
		});

		// Add additional process ARGs that comes after --
		let parseStopIndex = process.argv.indexOf('--');
		if (parseStopIndex != -1) {
			args += ' ' + process.argv.slice(parseStopIndex + 1).join(' ');
		}

		if (options.frontendLibDev && configObj.cli.frontendLibrary.devUrl) {
			args += ` --url=${configObj.cli.frontendLibrary.devUrl}`
		}

		let arch = options.arch || process.arch;
		let binaryName = getBinaryName(arch);

		if (!binaryName) {
			spinner.error({ text: `Cannot Find The Executable For CPU Architecture: '${arch}' or Platform '${process.platform}'` })
			return;
		}

		let binaryPath = `bin${path.sep}${binaryName}`;
		spinner.success();

		if (options.argsOpt)
			args += " " + options.argsOpt;

		// Change Permissions To Executable On Linux Or Mac
		if (process.platform == 'linux' || process.platform == 'darwin')
			fs.chmodSync(binaryPath, 0o755);

		spinner = createSpinner(`Launching Executable "${binaryName}"`).start();

		const neuProcess = spawn(binaryPath, args.split(` `), { stdio: 'inherit' })

		// When Process spawns successfully!
		neuProcess.on('spawn', function() {
			spinner.success();
			console.log('');
		});

		neuProcess.on('error', function(err) {
			filewatcher.stop();
			websocket.stop();

			spinner.error();
			console.error('\n', err);
		});

		neuProcess.on('exit', function (code) {
			let statusCodeMsg = code ? `error code ${code}` : `success code 0`;
			let runnerMsg = `${binaryName} was stopped with ${statusCodeMsg}`;

			console.log(runnerMsg);

			filewatcher.stop();
			websocket.stop();
			process.exit(code);
		});
	} catch(err) {
		filewatcher.stop();
		websocket.stop();

		spinner.error();
		console.error('\n', err);
	}
}
