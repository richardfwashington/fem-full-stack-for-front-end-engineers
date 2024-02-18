#! /usr/bin/bash

cd /var/www/app
git pull origin main --ff-only
pm2 restart app
