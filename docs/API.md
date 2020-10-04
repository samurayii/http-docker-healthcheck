# API

## Информация

Сервис предоставляет API, который настраивается в секции файла настройки **api**. API доступно по протоколу HTTP.

### Примеры применения

проверить доступность сервера: `curl -i http://localhost:3001/api/healthcheck` или `curl -i http://localhost:3001/api/`  
получить информацию о сервисах: `http://localhost:3001/api/v1/services/list`  

### API информации сервиса

| URL | Метод | Код | Описание | Пример ответа/запроса |
| ----- | ----- | ----- | ----- | ----- |
| / | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck/status | GET | 200 | получить статус здоровья | [пример](#v1_status) |
| /_ping | GET | 200 | проверить доступность сервиса | OK |
| v1/services/list | GET | 200 | получить информацию о сервисах | [пример](#v1_services_list) |
| v1/services/list/${id} | GET | 200 | получить информацию о сервисе по id | [пример](#v1_services_info) |

## Примеры ответов/запросов

### Базовый ответ провала

Этот ответ возвращается при отказе выполнения запроса. Пример:

```js
{
    "status": "fail",
    "message": "Причина отказа"
}
```

### Базовый ответ ошибки

Этот ответ возвращается при ошибке на сервере. Пример:

```js
{
    "status": "error",
    "message": "Причина ошибки"
}
```

### <a name="v1_status"></a> Получить статус здоровья: /healthcheck/status

**Тело ответа**
```js
{
    "healthy": true,
    "work_time": 21,
    "human_work_time": "21s"
}
```

### <a name="v1_services_list"></a> Получить информацию о сервисах: v1/services/list

**Тело ответа**
```js
{
    "status": "success",
    "data": [
        {
            "healthy": false,
            "image": "test/app:0.1",
            "id": "5346da6ec0f4bb8da88458b2914fe6539b39da072f6a7a20c3eea392af577d72",
            "name": "test-app4",
            "created": 1601743647,
            "tags": [
                "tag1",
                "tag2"
            ],
            "service": {
                "status": {
                    "healthy_attempt": 0,
                    "unhealthy_attempt": 0,
                    "triggered_count": 0
                },
                "info": {
                    "path": "/healthcheck",
                    "protocol": "http",
                    "method": "get",
                    "port": 6004,
                    "host": "localhost",
                    "timeout": 10,
                    "interval": 10,
                    "healthy_after": 3,
                    "unhealthy_after": 3,
                    "initialization_timeout": 10,
                    "policy": "restart",
                    "policy_trigger": 3,
                    "headers": {}
                }
            }
        }
    ]
}
```

### <a name="v1_services_info"></a> Получить информацию о сервисе по id: v1/services/list/${id}

**Тело ответа**
```js
{
    "status": "success",
    "data": {
        "healthy": false,
        "image": "test/app:0.1",
        "id": "5346da6ec0f4bb8da88458b2914fe6539b39da072f6a7a20c3eea392af577d72",
        "name": "test-app4",
        "created": 1601743647,
        "tags": [
            "tag1",
            "tag2"
        ],
        "service": {
            "status": {
                "healthy_attempt": 0,
                "unhealthy_attempt": 0,
                "triggered_count": 0
            },
            "info": {
                "path": "/healthcheck",
                "protocol": "http",
                "method": "get",
                "port": 6004,
                "host": "localhost",
                "timeout": 10,
                "interval": 10,
                "healthy_after": 3,
                "unhealthy_after": 3,
                "initialization_timeout": 10,
                "policy": "restart",
                "policy_trigger": 3,
                "headers": {}
            }
        }
    }
}
```