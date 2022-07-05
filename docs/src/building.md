## Building Distributables
So you've got an amazing application there, and you want to package it all up and share it with the world. If you run `neu-forge build` Neu Forge will generate you platform specific distributables for you to share with everyone.

```bash
npm run build
```

this command will create a new folder `dist` which will contain binaries for different platforms & cpu architectures, supported platforms are:

1. Windows 8+
2. MacOs
3. Linux

supported cpu architectures are x64, arm64 (linux), **note** we are working on x86 cpu architecture...

the `dist` folder contains

```
dist
  |
  └- win32
  |   └- x64
  |      └- yourApp.exe
  |      └─ resources.neu
  |      └- Webview2Loader.dll
  |
  └─ linux
  |   └- x64
  |   |  └- yourApp
  |   |  └- resources.neu
  |   |
  |   └- arm64
  |      └- yourApp
  |      └- resources.neu
  |
  └─ darwin
      └- x64
         └- yourApp
         └- resources.neu
```

the directory structure is same everywhere, in `dist` directory there will be a directory representing the platform it contains the binaries for, and inside that directory there will be directories representing the cpu architecture they are for.
