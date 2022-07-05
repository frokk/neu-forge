const fse = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { createSpinner } = require('nanospinner');

const templateMap = {
	"Vanilla": path.resolve(__dirname, "../../template/vanilla/")
}

const questions = [
	{
		name: "projectName",
		type: "input",
		message: "Project name?",
		default() {
			return "neu-App"
		}
	},
	{
		name: "version",
		type: "input",
		message: "Project version?",
		default() {
			return "0.0.0"
		}
	},
	{
		name: "template",
		type: "list",
		message: "Select a template?",
		choices: Object.keys(templateMap)
	}
];

function copyTemplate(template, dirPath) {
	return new Promise(async function(resolve, reject) {
		let spinner = createSpinner(`Copying "${template}" template`).start();
		try {
			const templatePath = templateMap[`${template}`];
				fse.copy(templatePath, dirPath, function(err) {
				if (err) {
					spinner.error()
					reject(err);
				} else {
					spinner.success();
					resolve(true);
				}
			})
		} catch(err) {
			spinner.error()
			reject(err);
		}
	})
}

function installNpmModules(dirPath) {
	return new Promise(async function(resolve, reject) {
		const packageJson = path.resolve(dirPath, `package.json`);
		const hasPackageJson = fse.pathExistsSync(packageJson);

		if (hasPackageJson == false) {
			resolve();
			return;
		}

		let spinner = createSpinner(`Installing NPM Dependencies`).start();
		try {
			let child = spawn("npm", ["install"], { cwd: dirPath, shell: true })
			child.on("close", function(code) {
				if (code == 0) {
					spinner.success();
					resolve();
				} else {
					spinner.warn({ text: `NPM Exited with non-zero exit code: ${code}`});
					resolve(code);
				}
			})
		} catch(err) {
			spinner.error()
			reject(err);
		}
	})
}

function getNeutralinoBinaries(dirPath) {
	return new Promise(async function(resolve, reject) {
		let spinner = createSpinner(`Getting Neutralinojs Binaries`).start();
		try {
			let child = spawn("npx", ["neu-forge", "fetch"], { cwd: dirPath, shell: true })
			child.on("close", function(code) {
				if (code == 0) {
					spinner.success();
					resolve();
				} else {
					spinner.warn({ text: `Neu-Forge Exited with non-zero exit code: ${code}`});
					resolve(code);
				}
			})
		} catch(err) {
			spinner.error()
			reject(err);
		}
	})
}

async function updateSettings(projectName, version, dirPath) {
	return new Promise(async function(resolve, reject) {
		let spinner = createSpinner(`Updating Neutralino Config`).start();
		try {
			const neuConfigJson = path.resolve(dirPath, `neutralino.config.json`);

			fse.readJson(neuConfigJson, function(err, neuJson) {
				neuJson.version = version;
				neuJson.modes.window.title = projectName;
				neuJson.cli.binaryName = projectName;
				neuJson.applicationId = `js.neutralino.${projectName}`;

				fse.writeJson(neuConfigJson, neuJson, { spaces: '\t' }, function(err) {
					if (err) {
						spinner.error();
						reject(err);
						return;
					}
					spinner.success();

					const packageJson = path.resolve(dirPath, `package.json`);
					const hasPackageJson = fse.pathExistsSync(packageJson);
					if (hasPackageJson == true) {
						spinner = createSpinner(`Updating NPM package.json`).start();
						fse.readJson(packageJson, function(err, pkgJson) {
							pkgJson.version = version;
							pkgJson.name = projectName;
							fse.writeJson(packageJson, pkgJson, { spaces: '\t' }, function(err) {
								if (err) {
									spinner.error();
									reject(err);
									return;
								}

								spinner.success();
								resolve();
							});
						});
					}
				})
			});
		} catch(err) {
			spinner.error()
			reject(err);
		}
	})
}

async function create() {
	const inquirer = (await import('inquirer')).default;
	const answers = await inquirer.prompt(questions);
	console.log("");

	const projectName = answers.projectName;
	const version = answers.version;
	const template = answers.template;

	const projectPath = path.resolve(`./${projectName}`);

	await copyTemplate(template, projectPath);
	await updateSettings(projectName, version, projectPath);
	await installNpmModules(projectPath);
	await getNeutralinoBinaries(projectPath);
}

module.exports = create;