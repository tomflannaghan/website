#!/bin/bash

if [ $# -ne 1 ]
then
    echo "Usage: $0 file.gpx"
    echo "Warning: The file will be overwritten."
    exit 1
fi

if [ -e $1 ]
then
    echo "Simplifying Route $1..."
    # nothing :-)
else
    echo "File doesn't exist"
    exit 1
fi

ls -lh $1
gpsbabel -i gpx -f $1 -x simplify,error=0.001 -o gpx -F $1
ls -lh $1
