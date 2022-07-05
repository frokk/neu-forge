const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const unzipper = require('unzipper');
const { createSpinner } = require('nanospinner');

const utils = require('../../src/lib/utils.js');
const constants = require('../../src/lib/constants.js');
const config = require('../../src/lib/config.js');
const configObj = config.get();

const tempDir = fs.mkdtempSync('.tmp-');

function downloadBinaries() {
	return new Promise(async function(resolve, reject) {
		try {
			const version = `v${configObj.cli.binaryVersion}`;
			const url = constants.remote.binaries.url.replace(/{tag}/g, version);

			await utils.download(url, path.resolve(tempDir, 'binaries.zip'));
			fs.createReadStream(path.resolve(tempDir, 'binaries.zip'))
				.pipe(unzipper.Extract({ path: tempDir }))
				.promise()
					.then(() => resolve())
					.catch((err) => reject(err));
		} catch(err) {
			reject(err);
		}
	});
}

function downloadClient() {
	return new Promise(async function(resolve, reject) {
		try {
			const version = `v${configObj.cli.clientVersion}`;
			const url = constants.remote.client.url.replace(/{tag}/g, version);

			await utils.download(url, path.resolve(tempDir, constants.files.clientLibrary));
			resolve();
		} catch(err) {
			reject(err);
		}
	});
}

function removeTemp() {
	let spinner = createSpinner('Cleaning').start();
	fse.remove(tempDir, err => {
		if (err) {
			spinner.error();
			console.error(err);
			return;
		}
		spinner.success({ text: `Cleaned` });
	});
}

function fetch() {
	let spinner = createSpinner('Downloading binaries & client file').start();
	try {
		Promise.all([ downloadClient(), downloadBinaries() ])
			.then(function(resArr) {
				spinner.success({ text: `Downloaded binaries & client file` });

				fse.ensureDirSync('bin');

				spinner = createSpinner(`Copying binaries & client file`).start();
				for (platform in constants.files.binaries) {
					for (arch in constants.files.binaries[platform]) {
						let neutralinoBinary = constants.files.binaries[platform][arch];
						fse.copySync(
							`${tempDir}/${neutralinoBinary}`,
							`bin/${neutralinoBinary}`
						);
					}
				}

				for (platform in constants.files.dependencies) {
					for (arch in constants.files.dependencies[platform]) {
						let depArr = constants.files.dependencies[platform][arch];
						depArr.forEach(function(file) {
							fse.copySync(
								`${tempDir}/${file}`,
								`bin/${file}`
							);
						});
					}
				}

			    const clientLibrary = configObj.cli.clientLibrary?.replace(/^\//, '');

			    if (clientLibrary == '' || !clientLibrary) {
			    	spinner.error({ text: `Cannot get client library path from config`});
			    	removeTemp();
			    	return;
			    }

				fse.copySync(
					`${tempDir}/${constants.files.clientLibrary}`,
					`./${clientLibrary}`
				)

				spinner.success({ text: `Copied binaries & client file` });
		    	removeTemp();
			})
		.catch(err => {
			spinner.error();
			removeTemp();
			console.error(err);
		})
	} catch(err) {
		spinner.error();
		console.error(err);
		removeTemp();
	}
}

module.exports = fetch;