### Run project in development mode

#### Without docker

```
yarn
yarn start
```

#### With docker

```
docker-compose build
docker-compose up
```

### Build static project

#### Without docker

```
yarn
yarn build
```

#### With docker

```
docker-compose build
docker-compose up
docker-compose run --rm app bash
yarn build
```

#### Launch HTTPServer to check build
```
cd build/
python -m SimpleHTTPServer
```
#### Check mobile version

1. Go to `./webpack/webpack.dev.config.js` and change `localhost` to your host IP
2. Restart the app with `docker-compose up` or `yarn start`
