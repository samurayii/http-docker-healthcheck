# Настройка контейнеров

## Информация

Сервис находит/настраивает проверку здоровья для контейнера при помощи меток контейнера с префиксом указанным в файле конфигурации в секции **docker**. 


пример запуска: `docker run --rm -it --name test-app1 --hostname test-app1 -l healthcheck.header.header1=header1-val -l healthcheck.policy_trigger=3 -l healthcheck.policy=restart -l healthcheck.initialization_timeout=10 -l healthcheck.unhealthy_after=3 -l healthcheck.healthy_after=3 -l healthcheck.interval=10 -l healthcheck.timeout=10 -l healthcheck.method=get -l healthcheck.host=localhost -l healthcheck.port=6001 -l healthcheck.enable=true -l healthcheck.path=/healthcheck -l healthcheck.tags=tag1,tag2 -l healthcheck.protocol=http -p 6001:6001 test/app:0.1`

### Таблица параметров конфигурации контейнера

| Параметр | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- |
| enable | логическое | false | активация проверки здоровья |
| path | строка | /healthcheck | путь опроса |
| protocol | строка | http | протокол опроса (http или https) |
| method | строка | get | метод опроса (get, post, head, options, put, patch или delete) |
| port | число | 80 при http, 443 при https | порт опроса |
| host | строка | если не указан, равен имени контейнера | адрес опроса |
| timeout | число | 10 | время жизни опроса |
| interval | число | 10 | интервал опроса |
| healthy_after | число | 3 | удачные попытки |
| unhealthy_after | число | 3 | неудачные попытки |
| initialization_timeout | число | 10 | интервал ожидания |
| policy | строка | restart | политика поведения (node или restart) |
| policy_trigger | число | 3 | количество неудач для запуска действий политики |
| tags | строка | | теги фильтрации контейнера |
| header.${header} | строка | | добавить заголовок опроса ${header} |