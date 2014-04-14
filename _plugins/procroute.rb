# Processes a route defined by a KML file, producing a GPX file (and
# other things).
require 'json'

module Jekyll
  class ProcessRoutes < Generator
    safe true

    def generate(site)
      site.posts.select{ |p| p.categories.include? "cycling"}.each do |post|
        if not post.data['route']
          raise "No route variable found for #{post.name}.\n"
          next
        end
        route = post.data['route']
        kml = "/cycling/kml/#{route}.kml"
        gpx = "/cycling/gpx/#{route}.gpx"
        alt = "/cycling/alt/#{route}.svg"
        kml_fs = ".#{kml}"
        gpx_fs = ".#{gpx}"
        alt_fs = ".#{alt}"
        
        if not File.exist?(gpx_fs)
          raise "No GPX file found at #{gpx_fs}\n"
        end
        print "Generating #{kml_fs}...\n"
        returns = %x( python excluded/process_route.py "#{gpx_fs}" "#{kml_fs}" "#{alt_fs}" )
        return_data = JSON.parse(returns)
        
        post.data['kml'] = kml
        post.data['gpx'] = gpx
        post.data['altimage'] = alt
        post.data['distance'] = return_data['distance'].round
        post.data['climb'] = return_data['total_ele'].round
      end
    end
    
  end
end
