# Processes a route defined by a KML file, producing a GPX file (and
# other things).

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
        if (not File.exist?(kml_fs)) or (File.mtime(gpx_fs) > File.mtime(kml_fs))
          print "Generating #{kml_fs}...\n"
          wasGood = system("python excluded/process_route.py \"#{gpx_fs}\" \"#{kml_fs}\" \"#{alt_fs}\"")
          raise "KML generation failed." if not wasGood
        end
        post.data['kml'] = kml
        post.data['gpx'] = gpx
        post.data['altimage'] = alt
      end
    end
    
  end
end
