# Building Interaction Interfaces

*Party Game Collection*

21S TU Wien

# Project

## Installation
Requires nodejs! Install first. 

Navigate to the web folder, where the project is located.

```cd web```

Install dependencies:

```npm install```

Start:

```npm start```

This will start a normal nodejs server. For development and debugging a file reloading server is advised. Install and run server:

```
npm install -g nodemon
nodemon index.js
```

Currently the app uses a hardcoded URL (http://localhost) and port (8080), which will be adjusted to be dynamically set once a production stage is near.
Due to the CORS settings for now it is important to use http://localhost:8080 and not http://127.0.0.1:8080 when opening the app as this will cause problems.


### Libs

[P5.js](https://p5js.org/reference/)

[ml5.js](https://learn.ml5js.org/#/reference/index)

[p5.SceneManager](https://github.com/mveteanu/p5.SceneManager/blob/master/lib/scenemanager.js)

[p5.clickable](https://github.com/Lartu/p5.clickable)