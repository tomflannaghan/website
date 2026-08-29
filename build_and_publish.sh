#!/bin/bash

jekyll clean
jekyll build
rsync -rv _site/* lightsail:/usr/share/nginx/html/flannaghan.com/.
