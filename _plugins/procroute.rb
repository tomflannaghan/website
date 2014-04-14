# Processes a route defined by a KML file, producing a GPX file (and
# other things).
require 'json'
require 'gpx'

module Jekyll
  class ProcessRoutes < Generator
    safe true

    def generate(site)
      kml_template = File.read("cycling/kml/template.kml")
      ## accumulate input to the python script for graph plotting
      python_input = []
      
      site.categories["cycling"].each do |post|
        if not post.data['route']
          raise "No route variable found for #{post.name}.\n"
          next
        end
        route = post.data['route']
        kml_file = "/cycling/kml/#{route}.kml"
        gpx_file = "/cycling/gpx/#{route}.gpx"
        alt_file = "/cycling/alt/#{route}.svg"
        kml_fs = ".#{kml_file}"
        gpx_fs = ".#{gpx_file}"
        alt_fs = ".#{alt_file}"
        
        ## GPX file must exist!
        if not File.exist?(gpx_fs)
          raise "No GPX file found at #{gpx_fs}\n"
        end
        print "Generating #{kml_fs}...\n"
        
        ## initialize metadata that will be gathered
        total_climb = 0
        last_point = nil
        coords_for_kml = ""
        elevation_profile_data = []
        total_distance = 0

        ## process the gpx file and calculate metadata
        gpx = GPX::GPXFile.new(:gpx_file => gpx_fs)
        track = gpx.tracks[0]
        track.segments.each do |segment|
          segment.points.each do |point|
            if last_point.nil?
              last_point = point
              next
            end
            ## accumulate the metadata information needed.
            if point.elevation > last_point.elevation
              total_climb += point.elevation - last_point.elevation
            end
            coords_for_kml += "#{point.lon},#{point.lat} "
            total_distance += haversine_distance(last_point, point)
            elevation_profile_data << [total_distance, point.elevation]
            last_point = point
          end
        end
        
        ## write the KML file.
        f = File.open(kml_fs, 'w')
        f.write(kml_template % {:coords => coords_for_kml})
        f.close()
        push_static_file(site, kml_fs)
        
        ## the alt files are processed in bulk by python --> more efficient.
        python_input << {
          :profile_data => elevation_profile_data, 
          :alt_file => alt_fs}
        push_static_file(site, alt_fs) ## ok to do before file created.
        
        post.data['kml'] = kml_file
        post.data['gpx'] = gpx_file
        post.data['altimage'] = alt_file
        post.data['distance'] = track.distance.round
        post.data['climb'] = total_climb.round
      end
      
      ## finally call the python to actually generate images.
      IO.popen(["python", "_plugins/procroute.py"], mode="w+") do |io|
        io.write(JSON.generate(python_input))
        io.close_write
        io.each do |line|
          print line
        end
      end
    end
  end
end

## some helper functions.

def push_static_file(site, f)
  base = File.basename(f)
  dir = File.dirname(f)
  site.static_files << Jekyll::StaticFile.new(site, site.source, dir, base)
end

def haversine_distance(p1, p2)
  d_lat = p2.latr - p1.latr;
  d_lon = p2.lonr - p1.lonr;
  a = Math.sin(d_lat/2) * Math.sin(d_lat/2) + Math.cos(p1.latr) * Math.cos(p2.latr) * Math.sin(d_lon/2) * Math.sin(d_lon/2);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  d = 6378 * c;
  return d;
end
