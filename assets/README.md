# WQP_UI Compiled Static Assets

This project includes compiled assets for the Water Quality Portal. The assets
produced by this project are dependencies of the [Flask server](../server).

## Install dependencies

Javascript and LESS assets are built with Node.js v8.11.2. Usage of
[nvm](https://github.com/creationix/nvm) is a convenient way to use a specific
version of Node.js:

```bash
nvm use v8.11.2
```

Node.js dependencies are installed via:

```bash
npm install
```

## Run a development server

Run the node.js development server at
[http://localhost:9000](http://localhost:9000):

```bash
npm run watch
```

If you need to run the development server at https [https://127.0.0.1:9000](https://127.0.0.1:9000):
```bash
npm run httpswatch
```

## Test the production static assets build locally

To build the complete production package, built to `./dist`:

```bash
npm run build
```

Rather than using the `watch` task, you can serve the manually built assets.
To locally serve the production build without recompiling on filesystem
changes:

```bash
npm run serve:static
```

## Running tests

To run tests in Chrome via Karma, these are equivalent:

```bash
npm test
npm run test
```

To watch Javascript files for changes and re-run tests with Karma on change,
run:

```bash
npm run test:watch
```
