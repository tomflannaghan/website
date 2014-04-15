## some experiments with height gain.
import sys
import gpxpy
import os
import pylab
import numpy
import json
import scipy.interpolate

## file names supplied by Ruby.
gpx_file = "../cycling/gpx/20-mi-loop.gpx"

###### read GPX 
gpx = gpxpy.parse(open(gpx_file, 'r'))
track = gpx.tracks[0]

track_data = []
for segment in track.segments:
    for point in segment.points:
        track_data.append((point.latitude, point.longitude, point.elevation))

track_data = numpy.array(track_data)
lat = track_data[:,0]
lon = track_data[:,1]
ele = track_data[:,2]
latrad = numpy.radians(lat)
lonrad = numpy.radians(lon)
delta_lon = lonrad[1:] - lonrad[:-1]
delta_lat = latrad[1:] - latrad[:-1]
## haversine formula for distance in lat/lon:
a = numpy.sin(delta_lat / 2) ** 2 + \
    numpy.cos(latrad[1:]) * numpy.cos(latrad[:-1])\
    * numpy.sin(delta_lon/2) ** 2
c = 2 * numpy.arctan2(a ** .5, (1 - a)**.5)
dist = numpy.r_[[0], numpy.cumsum(6371 * c)]

def max_ascend_dist(dist_check):
    is_max = numpy.zeros(len(dist), dtype='bool')
    is_min = numpy.zeros(len(dist), dtype='bool')
    for i in range(len(dist)):
        ele_range = ele[(dist > dist[i] - dist_check) 
                        & (dist < dist[i] + dist_check)]
        is_max[i] = (ele[i] >= ele_range).all()
        is_min[i] = (ele[i] <= ele_range).all()
        counted = is_min | is_max
        counted[0] = True
        counted[-1] = True
    return max_ascend(ele[counted])

def max_ascend(arr):
    delta = arr[1:] - arr[:-1]
    return (delta * (delta > 0)).sum()

distances = numpy.logspace(-2, 2, 50)
ascends = numpy.array([max_ascend_dist(d) for d in distances])

pylab.plot(distances, ascends)
pylab.semilogx()
