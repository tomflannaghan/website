// My simple script for loading a kml map.

var map;

function init(mapid, kmlfile){
    map = new OpenLayers.Map(mapid);
    
    var osm = new OpenLayers.Layer.OSM(
        "OpenCycleMap",
        ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
         "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]);
    
    var kmlLayer = new OpenLayers.Layer.Vector("KML", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: kmlfile,
            format: new OpenLayers.Format.KML({
                extractStyles: true,
                extractAttributes: true
            })
        })
    });
    kmlLayer.events.register('loadend', kmlLayer, 
                             function (e) {
                                 map.zoomToExtent(kmlLayer.getDataExtent());
                             });    
    map.addLayers([osm, kmlLayer]);
}
