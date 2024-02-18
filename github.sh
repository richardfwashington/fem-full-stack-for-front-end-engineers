#! /usr/bin/bash

cd /var/www/app
git pull origin main --ff-only
composer install
pm2 restart app


