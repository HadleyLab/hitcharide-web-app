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
