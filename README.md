# Дипломный проект профессии «Fullstack-разработчик на Python»

## Облачное хранилище «My Cloud»

## Развертывание на сервере

- коннектимся к серверу
```
$ ssh root@<IP сервера>
```
- создаем юзера, даем ему права и коннектимся с ним
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

# CREATE DATABASE Cloud_db4;
# CREATE USER postgres WITH PASSWORD '1';
# GRANT ALL PRIVILEGES ON DATABASE Cloud_db4 TO postgres;
# \q

$ exit
```
### Бэкенд
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
$ python3 -m venv env
$ source ./env/bin/activate
```
- устанавливаем зависимости Python, применяем миграции и запускаем бэкенд
```
(env) $ pip install -r requirements.txt
(env) $ python manage.py makemigrations cloud
(env) $ python manage.py migrate
```
### Фронтенд

- Переходим в директорию `frontend/`, обновим Node и установим NPM зависимости
```
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
npm install
```
- В файле `frontend/src/api/requests.js` в переменной `BASE_URL` установим url, на который будут отправлятся запросы на сервер. Например: `http://127.0.0.1:8000/api/`
После этого пересоберем бандл фронтенда
```
npm run dev
```
- Себерем static файлы и запустим наш проект
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
WorkingDirectory=/home/<unix_username>/cloud_storage
ExecStart=/home/<unix_username>/cloud_storage/env/bin/gunicorn \
    --access-logfile - \
    --workers=3 \
    --bind unix:/home/<unix_username>/cloud_storage/booking_cloud/gunicorn.sock booking_cloud.wsgi:application

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
(env) $ sudo nano /etc/nginx/sites-available/cloud_storage
```
В файле пишем следующие настройки (вместо `<unix_username>` надо подставить ваше имя юзера):
```
server {
	listen 80;
	server_name <server_IP>;

	location /static/ {
		root /home/<unix_username>/cloud_storage;
	}
                
	location / {
        include proxy_params;
        proxy_pass http://unix:/home/<unix_username>/cloud_storage/booking_cloud/gunicorn.sock;
    }
	
}
```
- делаем ссылку на него
```
(env) $ sudo ln -s /etc/nginx/sites-available/cloud_storage /etc/nginx/sites-enabled
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
Теперь Django проект должен быть доступен по http://<IP сервера> на обычном порту 80. Если видим ошибку 502, то, возможно, делло в правах и меняем существующего юзера на имя нашего юзера:
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

* booking_cloud - бэкенд часть проекта, реализованная на django rest framework
* frontend - фронтенд часть проекта, которая реализована на react

Связь фронденда с бекендом осуществляется через шаблон django, находящийся в директории `frontend/templates/frontend/index.html`.

## Создание пользователя, регистрация

### Создание администратора
Создать администратора вы можете с помощью команды `python manage.py createsuperuser`. В проекте не используется стандартный административный раздел django.
Авторизация под администратором происходит через общую форму авторизации для всех пользователей.

> Зайти в административный раздел вы можете по ссылке `http://<адрес сайта>/admin/`. Обычным позователям доступ к разделу ограничен.

Там есть список пользователей с их информацией. Вы можете удалить пользователя или изменить его статус (администратор/пользователь). 
Список файлов других пользователей находится на главной странице.

### Регистрация в приложении

Вы можете зарегистрироватся в приложении через форму регистрации, перейти к которой можно через шапку сайта (справа пункт меню Sign Up), или через конпку 
"Try" на стартовой странице.

Вход в личный кабинет осуществляется через шапку сайта - "Sign In". Для авторизации используются адрес электронной почты и пароль. 

## Основной функционал
### Добавление файла
Добавить файл в хранилище вы можете через кнопку `Add` в нижнем правом углу. Добавление файлов осуществляется по одному.

### Удаление, переименование, загрузка файла. Комментарий
Чтобы управлять файлом вы можете выделить его. После этого внизу появится панель для управления.

**rename** - переименовать файл.

**change comment** - добавить или изменить комментарий.

**download** - загрузить файл.

**get download link** - получение ссылки для скачивания файла третьими лицами. Ссылку можно передать другу, знакомому, коллеге. 
Они могут по ней скачать файл без регистрации.

**delete** - удалить файл.

------------------------

