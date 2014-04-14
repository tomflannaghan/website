import sys
import gpxpy
import os
import pylab
import numpy

#argv = ["./cycling/gpx/20-mi-loop.gpx",
#        "./cycling/kml/20-mi-loop.kml",
#        "./cycling/alt/20-mi-loop.svg"]
gpx_file, kml_file, alt_file = sys.argv[1:]

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

delta_ele = ele[1:] - ele[:-1]
total_ele = (delta_ele * (delta_ele > 0)).sum()

######## elevation figure
pylab.figure(1, figsize=(10,2))
pylab.clf()
pylab.plot(dist, ele, color='b', lw=2)
pylab.fill_between(dist, ele, color='b', alpha=0.3)
pylab.xlim(0, dist[-1])
pylab.ylim(0, 1.1 * ele.max())
pylab.ylabel("Elevation, m")
pylab.xlabel("Distance, km")
pylab.tight_layout()
pylab.savefig(alt_file)

######## KML output
template = open(os.path.join(os.path.dirname(__file__), 'kml_template.kml'), 'r').read()
kml =  template.format(
    coords=' '.join(["%f,%f" % (lo, la) for lo, la in zip(lon, lat)]))
open(kml_file, 'w').write(kml)

