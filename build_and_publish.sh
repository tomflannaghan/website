#!/bin/bash

# python poole_comments.py
jekyll clean
jekyll build
rsync -rv _site/* lightsail:stack/nginx/flannaghan.com/.
