"""This python script processes JSON on the standard input. Designed
to work with procroute.rb.
"""

import sys
import gpxpy
import os
import pylab
import numpy
import json

input_data = json.load(sys.stdin)
for route_data in input_data:
    print "Generating " + route_data['alt_file']
    dist, ele = numpy.array(route_data['profile_data']).T
    ######## elevation figure
    pylab.figure(1, figsize=(10,2))
    pylab.clf()
    pylab.plot(dist, ele, color='b', lw=2)
    locs, labs = pylab.yticks()
    for loc in locs:
        pylab.fill_between(dist, numpy.clip(ele, 0, loc), 0, 
                           color='b', alpha=0.05)
    pylab.xlim(0, dist[-1])
    pylab.ylim(0, 1.1 * ele.max())
    pylab.ylabel("Elevation, m")
    pylab.xlabel("Distance, km")
    pylab.tight_layout()
    pylab.savefig(route_data['alt_file'])
