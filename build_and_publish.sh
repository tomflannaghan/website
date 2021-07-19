#!/bin/bash

# python poole_comments.py
jekyll clean
jekyll build
rsync -rv _site/* lightsail:/usr/share/nginx/html/flannaghan.com/.
