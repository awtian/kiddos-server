!/bin/bash
pm2 show app | grep "stopped"
if [ $? -eq 0 ]; then

printf 'NodeJS is not running....'

pm2 start app

curl -s --user 'api:key-2ac15eea72d1e17f4b215b17a9d4db47' \
    https://api.mailgun.net/v3/mail.armadius.com/messages \
    -F from='Armadius <notif@armadius.com>' \
    -F to=rivieravinesa@gmail.com \
    -F subject='Hello NodeJS App Restart' \
    -F text='NodeJS already restarted, hope all is well'


else

     printf  'NodeJS is running'
fi

