# Дипломный проект профессии «Fullstack-разработчик на Python»

## Облачное хранилище «Моё облако»

## Развертывание на сервере

- Подключаемся к серверу под root
```
$ ssh root@<IP сервера>
```
- создаем пользователя, даем ему права и переключаемся на него
```
$ adduser <unix_username>
$ usermod <unix_username> -aG sudo
$ su - <unix_username>
```
- обновляем пакеты, устанавливаем новые
```
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install python3-venv python3-pip postgresql nginx npm
```
- проверяем, что Nginx запущен
```
$ sudo systemctl start nginx
$ sudo systemctl status nginx
```
- клонируем репозиторий и заходим в него
```
$ git clone https://github.com/vladvolkov71/fpy-diplom.git
$ cd fpy-diplom
```
### База данных
- не забудем установить базу данных, используем пользователя `postgres`
```
$ sudo su postgres
$ psql
$ \password

# CREATE DATABASE <db_name>;
# CREATE USER <username> WITH PASSWORD '<passowrd>';
# GRANT ALL PRIVILEGES ON DATABASE <db_name> TO <username>;
# \q

$ exit
```
### Backend
- создаем файл `.env` для указания переменных
```
SECRET_KEY // секретный ключ django
DEBUG // режим отладки True или False
ALLOWED_HOSTS // допустимые хосты (например, для запуска локально укажите 127.0.0.1)
// Данные для подключения к базе данных (к той, что создали в пункте 4):
DB_NAME // имя базы данных (например: my_database)
DB_USER // имя пользователя базы данных (например: admin)
DB_PASSWORD // пароль для доступа к базе данных
DB_HOST // хост базы данных (например: localhost)
DB_PORT // порт базы данных (например: 5432)
```
- создаем и активируем виртуальное окружение
```
$ python3 -m venv venv
$ source ./venv/bin/activate
```
- устанавливаем зависимости Python, применяем миграции и запускаем backend
```
(env) $ pip install -r requirements.txt
(env) $ python manage.py makemigrations
(env) $ python manage.py migrate
```
### Frontend

- Переходим в директорию `frontend/`, обновим Node и установим NPM зависимости
```
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
npm install
```
- В файле `frontend/src/api/requests.js` в переменной `BASE_URL` установим url, на который будут отправляться запросы на сервер (внешний адрес сервера). Например: `http://127.0.0.1:8000/api/`
После этого соберем проект в директории `frontend/`
```
npm run dev
```
- Соберем static файлы и запустим наш проект
```
(env) $ python manage.py collectstatic
(env) $ python manage.py createsuperuser
(env) $ python manage.py runserver 0.0.0.0:8000
```
Сейчас Django проект должен быть доступен по адресу http://<IP сервера>:8000.
- пишем конфиг Gunicorn
```
(env) $ sudo nano /etc/systemd/system/gunicorn.service
```
В файле пишем следующие настройки (вместо `<unix_username>` надо подставить ваше имя юзера):
```
[Unit]
Description=gunicorn.service
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/home/<unix_username>/fpy-diplom
ExecStart=/home/<unix_username>/fpy-diplom/env/bin/gunicorn \
    --access-logfile - \
    --workers=3 \
    --bind unix:/home/vlad/fpy-diplom/my_cloud/gunicorn.sock my_cloud.wsgi:application

[Install]
WantedBy=multi-user.target
```
- запускаем Gunicorn
```
(env) $ sudo systemctl start gunicorn
(env) $ sudo systemctl enable gunicorn
```
- пишем конфиг Nginx
```
(env) $ sudo nano /etc/nginx/sites-available/fpy-diplom
```
В файле пишем следующие настройки (вместо `<unix_username>` надо подставить ваше имя юзера):
```
server {
	listen 80;
	server_name <server_IP>;

	location /static/ {
		root /home/<unix_username>/fpy-diplom;
	}
                
	location / {
        include proxy_params;
        proxy_pass http://unix:/home/<unix_username>/fpy-diplom/my_cloud/gunicorn.sock;
    }
	
}
```
- делаем ссылку на него
```
(env) $ sudo ln -s /etc/nginx/sites-available/fpy-diplom /etc/nginx/sites-enabled
```
- открываем порты и даем права Nginx
```
(env) $ sudo ufw allow 8000
(env) $ sudo ufw allow 80
(env) $ sudo ufw allow 'Nginx Full'
```
- проверяем, что службы активны
```
(env) $ sudo systemctl status gunicorn
(env) $ sudo systemctl status nginx
```
- перезагружаем службы
```
(env) $ sudo systemctl daemon-reload
(env) $ sudo systemctl restart gunicorn
(env) $ sudo systemctl restart nginx
```
Теперь Django проект должен быть доступен по http://<IP сервера> на обычном порту 80. Если видим ошибку 502, то, возможно, дело в правах и меняем существующего юзера на имя нашего юзера:
```
(env) $ sudo nano /etc/nginx/nginx.conf
```
```
...
...
user <unix_username>
...
...
```
- перезагружаем службы еще раз и Django проект должен быть доступен по http://<IP сервера> на обычном порту 80:
```
(env) $ sudo systemctl daemon-reload
(env) $ sudo systemctl restart gunicorn
(env) $ sudo systemctl restart nginx
```
- выходим из пользователя обратно в `root`
```
(env) $ exit
```
Теперь проект Django + React должен быть полностью доступен по http://<IP сервера> на обычном порту 80.


## Структура проекта
Проект основан на Django и включает в себя два приложения:

* my_cloud - backend часть проекта, реализованная на django rest framework
* frontend - frontend часть проекта, которая реализована на react

Связь фронденда с бекендом осуществляется через шаблон django, находящийся в директории `frontend/templates/frontend/index.html`.

## Создание пользователя, регистрация

### Создание администратора
Создать администратора вы можете с помощью команды `python manage.py createsuperuser`. В проекте не используется стандартный административный раздел django.
Авторизация под администратором происходит через общую форму авторизации для всех пользователей.

### Регистрация в приложении

Вы можете зарегистрироваться в приложении через форму регистрации, перейти к которой можно через шапку сайта - "Регистрация", или через кнопку 
"Начать" на стартовой странице.

Вход в личный кабинет осуществляется через шапку сайта - "Войти". Для авторизации используются адрес электронной почты и пароль. 

## Основной функционал
### Добавление файла
Добавить файл в хранилище вы можете через кнопку `Добавить` в нижнем правом углу. Добавление файлов осуществляется по одному.

### Удаление, переименование, загрузка файла. Комментарий
Чтобы управлять файлом, вы можете выделить его. После этого внизу появится панель для управления.

**Переименовать** - переименовать файл.

**Изменить комментарий** - добавить или изменить комментарий.

**Скачать** - загрузить файл.

**Ссылка для скачивания** - получение ссылки для скачивания файла третьими лицами. Ссылку можно передать другу, знакомому, коллеге. 
Они могут по ней скачать файл без регистрации.

**Удалить** - удалить файл.

### Переключение между режимами работы
После авторизации пользователя в шапке доступны два режима работы - "Обычный" и "Администратор". 
При переключении режимов работы осуществляется перезагрузка страницы. В случае отсутствия прав администратора у пользователя, 
будет выдано сообщение об отсутствии прав администратора.

### Панель администратора
На панели администратора есть список пользователей с их информацией. Вы можете удалить пользователя или изменить его статус (администратор/пользователь). 
Кроме этого, вы можете открыть список файлов пользователя и выполнить любые операции с ними.
------------------------

