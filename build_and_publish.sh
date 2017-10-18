#!/bin/bash

# python poole_comments.py
jekyll build
rsync -rv _site/* flannaghan:public_html/.
