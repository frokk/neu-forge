const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");
const asar = require("asar");
const { createSpinner } = require('nanospinner');

const config = require('../../src/lib/config.js');
const constants = require('../../src/lib/constants.js');
const configObj = config.get();

function createAsar(dest) {
	return new Promise(function(resolve, reject) {
		let spinner = createSpinner(`Copying Resources`).start();
		try {
			const resourcesDir = configObj.cli.resourcesPath?.replace(/^\//, '');
			const extensionsDir = configObj.cli.extensionsPath?.replace(/^\//, '');
			const clientLibrary = configObj.cli.clientLibrary?.replace(/^\//, '');
			const icon = configObj.modes.window.icon?.replace(/^\//, '');

			fs.mkdirSync(`.tmp`, { recursive: true });
			Promise.all([
					fse.copy(`./${resourcesDir}`, `.tmp/${resourcesDir}`, { overwrite: true }),
					fse.copy(`./${constants.files.configFile}`, `.tmp/${constants.files.configFile}`, { overwrite: true }),
					fse.copy(`./${clientLibrary}`, `.tmp/${clientLibrary}`, { overwrite: true }),
					fse.copy(`./${icon}`, `.tmp/${icon}`, { overwrite: true })
				])
				.then((values) => {
					spinner.success();
					spinner = createSpinner(`Creating Asar Package`).start()
					asar.createPackage('.tmp', dest).then(e => {
						spinner.success();
						resolve();
					});
				})
		} catch(err) {
			spinner.error();
			reject(err);
		}
	})
}

async function build() {
	let spinner = createSpinner(`Copying Executables`);
	try {
		const distDir = "dist";
		const binaryName = configObj.cli.binaryName || "neutralinoApp";

		const asarPath = `${distDir}/${constants.files.resourceFile}`;
		await createAsar(asarPath);

		fse.ensureDirSync(distDir);

		spinner.start();
		for (platform in constants.files.binaries) {
			fse.ensureDirSync(`${distDir}/${platform}`);
			for (arch in constants.files.binaries[platform]) {
				fse.ensureDirSync(`${distDir}/${platform}/${arch}`);

				let neutralinoBinary = constants.files.binaries[platform][arch];
				fse.copySync(
					`bin/${neutralinoBinary}`,
					`${distDir}/${platform}/${arch}/${binaryName}${path.extname(neutralinoBinary)}`
				);
				fse.copySync(
					asarPath,
					`${distDir}/${platform}/${arch}/${path.basename(asarPath)}`
				);
			}
		}

		spinner.success();

		spinner = createSpinner(`Copying dependencies`).start();
		for (platform in constants.files.dependencies) {
			fse.ensureDirSync(`${distDir}/${platform}`);
			for (arch in constants.files.dependencies[platform]) {
				let depArr = constants.files.dependencies[platform][arch];
				depArr.forEach(function(file) {
					fse.copySync(
						`bin/${file}`,
						`${distDir}/${platform}/${arch}/${file}`
					);
				});
			}
		}
		spinner.success();

		spinner = createSpinner(`Cleaning`);
		fse.remove(".tmp", err => {
			if (err) {
				spinner.error();
				console.error(err);
				return
			}
			fse.remove(asarPath, err => {
				if (err) {
					spinner.error();
					console.error(err);
					return
				}
				spinner.success();
			})
		})
	} catch(err) {
		console.error(err);
	}
}

module.exports = build;