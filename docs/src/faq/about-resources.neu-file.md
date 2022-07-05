# About `resources.neu` File
when you build your application you might've noticed that there is a file named `resources.neu` file, what is this file? what is it used for? why is it there?

the `resources.neu` file is a 'Archive' and it contains your HTML, CSS & JavaScript Code, basically it contains everything inside the folder which you have specified inside `cli.resourcesPath` property in the `neutralino.config.json`, also the `neutralino.config.json` is also inside this archive.

when the your app launched it looks for the `resources.neu` file in the directory the app is, and when the app finds the archive it loads it into the memory and starts showing your app.
