# rps-big-red-edition
Play Rock Paper Scissors via a browser and across a socket.io server

## To build dev environment
Install dependencies

```
npm install
```
Do a build

```
grunt build
```

## Get dev environment up and running them play across different devices..
If you want to test across devices or other machines on the same network as the host machine you will need to a do new build. Follow the steps below.

Your machines/devices must be on the same network. 

* From the root of the project run the following - ‘npm install’ - babel brings in a lot of dependencies so this might take a few minutes.
* Find the ip of the machine you want to server the game from and make a not of it.
* Open up src/config.js and change the domain value from localhost to reflect your domain, e.g. domain: ‘http://192.168.1.124'
* Run ```grunt build```
* npm start
* In a browser open the domain on port 3000, e.g. http://192.168.1.124:3000. Other devices/machines should be able to connect and play on the same url


## List of useful grunt commands...
* **grunt karma** - runs the front end tests
* **grunt node_mocha** - runs the back end tests
* **grunt eslint** - runs the listing task
* **grunt jsonlint** - lints the projects
* **grunt test** - runs all of the linting tasks and tests
* **grunt build** - does the production build of the project
* **grunt build-debug** - does a build to help with debugging
* **grunt launch-build** - does a build of the project and launch the app in a browser
* **grunt launch-debug** - does a build of the project and launch the app in a browser with sourcemaps (this still needs a bit of work for node)

