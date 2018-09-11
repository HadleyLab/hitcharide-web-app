### Project setup for testing

##### Api:
```
1. docker-compose build
2. В корне выполнить cp .env_example .env
3. api/config/settings.py нужно добавить ALLOWED_HOSTS по типу
    ALLOWED_HOSTS = ['localhost', '192.168.11.254'] - вместо 192.168.11.254 свой хост
5. docker-compose up
6. Миграции и суперюзер
7. Импорт городов
    docker-compose run --rm api ./manage.py import_usa_cities
8. В админке Mail templates -> Account activate нужно заменить url по типу

Body:   <p>You're receiving this email because you need to      finish activation process on {{ site_name }}.</p>
        <p>Please go to the following page to activate account:</p>
        <p><a href="http://192.168.11.254:3000/#/{{ url }}">http://192.168.11.254:3000/#/{{ url }}</a></p>
        <p>Thanks for using our site!</p>
        <p>The {{ site_name }} team</p>
```

##### App:
```
1. docker-compose build
2. app/src/services/base.js -> localhost нужно заменить на свой хост
    app/webpack/webpack.dev.config.js -> localhost нужно заменить на свой хост
3. docker-compose up
9. Пароль для удобства задала по умолчанию k134rf2i
10. При регистрации ссылка для активации аккаунта будет в консоле где запущен api
11. При добавлении номера телефона ссылка тоже будет в консоле где запущен api:
'Your Hitcharide activation code is: 4414'
```



### Run project in development mode

##### Without docker

```
yarn
yarn start
```

##### With docker

```
docker-compose build
docker-compose up
```

### Build static project

##### Without docker

```
yarn
yarn build
```

###### With docker

```
docker-compose build
docker-compose up
docker-compose run --rm app bash
yarn build
```

##### Launch HTTPServer to check build
```
cd build/
python -m SimpleHTTPServer
```
### Check mobile version

1. Go to `./webpack/webpack.dev.config.js` and change `localhost` to your host IP
2. Restart the app with `docker-compose up` or `yarn start`
