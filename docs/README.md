# HTTP Docker healthcheck

## Информация

Http проверка здоровья сервисов для docker.

## Оглавление:
- [Установка](#install)
- [Ключи запуска](#launch)
- [Конфигурация](#configuration)
- [Настройка контейнеров](CONTAINERS.md)
- [HTTP API](API.md)

## <a name="install"></a> Установка и использование

пример строки запуска: `node /http-docker-healthcheck/app.js -c config.toml`

пример запуска docker контейнера: `docker run -d --restart unless-stopped -v /var/run/docker.sock:/var/run/docker.sock -e HTTP_DOCKER_HEALTHCHECK_WEB_ENABLE=true -p 3001:3001 samuray/http-docker-healthcheck:latest`

## <a name="launch"></a> Таблица ключей запуска
Ключ | Описание
------------ | -------------
--version, -v | вывести номер версии приложения
--help, -h | вызвать справку по ключам запуска
--config, -c | путь к файлу конфигурации в формате toml или json, (переменная среды: HTTP_DOCKER_HEALTHCHECK_CONFIG_PATH)

## <a name="configuration"></a> Конфигурация

Программа настраивается через файл конфигурации двух форматов TOML или JSON. Так же можно настраивать через переменные среды, которые будут считаться первичными. 

### Секции файла конфигурации:

- **logger** - настрока логгера (переменная среды: HTTP_DOCKER_HEALTHCHECK_LOGGER)
- **authorization** - настрока авторизации (переменная среды: HTTP_DOCKER_HEALTHCHECK_AUTHORIZATION)
- **api** - настройка API (переменная среды: HTTP_DOCKER_HEALTHCHECK_API)
- **web** - настройка статического Web сервера (переменная среды: HTTP_DOCKER_HEALTHCHECK_WEB)
- **web.static** - настройка статического сервера (пакет: https://github.com/koajs/static) (переменная среды: HTTP_DOCKER_HEALTHCHECK_WEB_STATIC)
- **docker_healthcheck** - настрока провеки здоровья для контейнера (переменная среды: HTTP_DOCKER_HEALTHCHECK_DOCKER_HEALTHCHECK)

### Пример файла конфигурации config.toml

```toml
[logger]                # настройка логгера
    mode = "prod"       # режим (prod или dev или debug)
    enable = true       # активация логгера
    timestamp = "none"  # выводить время лога (none, time или full)
    type = true         # выводить тип лога (true или false)

[authorization]                     # настрока авторизации
    [[authorization.users]]         # массив пользователей
        username = "username"       # имя пользователя
        password = "password"       # пароль пользователя
    [[authorization.users]]
        token = "xxxxxxxxxxxx"      # токен доступа

[api]                                   # настройка API
    enable = false                      # активация API
    auth = false                        # активация авторизации
    listening = "*:3001"                # настройка слушателя
    prefix = "/api"                     # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie

[web]                                   # настройка WEB сервера
    enable = false                      # активация WEB сервера
    auth = false                        # активация авторизации
    listening = "*:3000"                # настройка слушателя
    prefix = ""                         # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie
    [web.static]                        # настройка статического сервера (пакет: https://github.com/koajs/static)
        folder = "static"               # папка со статическими файлами
        maxage = 0                      # время жизни кеша в миллисекундах
        hidden = false                  # разрешение отдавать скрытые файлы
        index = "index.html"            # название файла индекса
        defer = false                   # позволить активировать нижестоящие промежуточное по первым
        gzip = true                     # gzip сжатие
        brotli = true                   # автоматическое обслуживание файла brotli

[docker_healthcheck]    # настрока провеки здоровя для контейнера (утилита docker-healthcheck)
    enable = false      # активация
    timeout = 10        # время ожидания

[docker]                                # настройки докера
    label_prefix = "healthcheck"        # префикс меток поиска
    host = "localhost"                  # хост подключения, игнорируется если указан socket.
    port = 2375                         # порт подключения, игнорируется если указан socket.
    ca = ""                             # путь файла до файла CA, игнорируется если указан socket.
    cert = ""                           # путь до файла сертификата, игнорируется если указан socket.
    key = ""                            # путь до файла ключа, игнорируется если указан socket.
    version = "v1.38"                   # версия api docker
    interval = 10                       # интервал опроса в секундах
    #tags = ["tag1"]                    # теги выборки (не обязательно)
    #socket = "/var/run/docker.sock"    # путь к сокету docker (не обязательно)
```

### Настройка через переменные среды

Ключи конфигурации можно задать через переменные среды ОС. Имя переменной среды формируется из двух частей, префикса `HTTP_DOCKER_HEALTHCHECK_` и имени переменной в верхнем реестре. Если переменная вложена, то это обозначается символом `_`. Переменные среды имеют высший приоритет.

пример для переменной **logger.mode**: `HTTP_DOCKER_HEALTHCHECK_LOGGER_MODE`

пример для переменной **api.ips_count**: `HTTP_DOCKER_HEALTHCHECK_API_IPS_COUNT`

### Таблица параметров конфигурации

| Параметр | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- |
| logger.mode | строка | prod | режим отображения prod, dev или debug |
| logger.enable | логический | true | активация логгера |
| logger.timestamp | логический | false | выводить время лога (true или false) |
| logger.type | логический | true | выводить тип лога (true или false) |
| authorization.users | массив | [] | массив пользователей |
| api.enable | логический | false | активация API (true или false) |
| api.auth | логический | false | активация авторизации (true или false) |
| api.listening | строка | *:3001 | настройка слушателя, формат <хост>:<порт> |
| api.prefix | строка | /api | префикс |
| api.proxy | логический | false | когда поле заголовка true proxy будут доверенным |
| api.subdomain_offset | число | 2 | смещение от поддомена для игнорирования |
| api.proxy_header | строка | X-Forwarded-For | заголовок IP прокси |
| api.ips_count | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| api.env | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| api.keys | строка[] |  | массив подписанных ключей cookie |
| web.enable | логический | false | активация API (true или false) |
| web.auth | логический | false | активация авторизации (true или false) |
| web.listening | строка | *:3001 | настройка слушателя, формат <хост>:<порт> |
| web.prefix | строка |  | префикс |
| web.proxy | логический | false | когда поле заголовка true proxy будут доверенным |
| web.subdomain_offset | число | 2 | смещение от поддомена для игнорирования |
| web.proxy_header | строка | X-Forwarded-For | заголовок IP прокси |
| web.ips_count | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| web.env | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| web.keys | строка[] |  | массив подписанных ключей cookie |
| web.static.folder | строка | static | папка со статическими файлами |
| web.static.hidden | логический | false | разрешение отдавать скрытые файлы |
| docke_healthcheck.enable | логический | false | активация |
| docke_healthcheck.timeout | число | 10 | время ожидания в секундах |
