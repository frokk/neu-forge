# Getting Started
Neu Forge is a tool for developing neutralinojs applications.

To get started with neu forge, you need to create a new project, The below given command will guide you through options to customize your template & will finally create a new project for you.

```bash
npx neu-forge@latest create
```

Example:

```bash
~$ npx neu-forge create
Need to install the following packages:
  neu-forge
Ok to proceed? (y) y
? Project name? testApp
? Project version? 0.0.1
? Select a template? Vanilla

✔ Copying "Vanilla" template
✔ Installing NPM Dependencies
✔ Getting Neutralinojs Binaries
✔ Updating Neutralino Config
✔ Updating NPM package.json
~$
```

You should now have a directory with a name of the name you chose while creating your app, for example i chose `testApp` so i will have a directory name `testApp`. If you head into that directory and start up the app, you'll be all set to start developing.
```bash
npm start
```
