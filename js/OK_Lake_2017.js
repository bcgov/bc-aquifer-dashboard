/* -----------------------------------------------------------------------------------
   Okanagan Lake - 2017
   Developed by GeoBC
   (c) 2017 GeoBC | http://www.geobc.gov.bc.ca  
----------------------------------------------------------------------------------- */

$.urlParam = function(name) {
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)')
      .exec(window.location.href);
  if (!results) {
    return 0;
  }
  return results[1] || 0;
};

$( document ).ready(function() {

  var geomarkId = $.urlParam('geomarkId');
  var map = L.map('map', {
    minZoom: 1
  }).setView([49.6, -119.5], 9);
  
/*-----BASE MAPS-----*/

  var provRoadsWM = new L.tileLayer.wms("http://maps.gov.bc.ca/arcserver/services/province/roads_wm/MapServer/WMSServer", {
    	layers: '0',
        format: 'image/png',
        transparent: true,
        attribution: "© 2013-2017 GeoBC, DataBC, The Province of British Columbia"
	}).addTo(map);
  
  var provWebMercatorCache = new L.tileLayer.wms("http://maps.gov.bc.ca/arcserver/services/Province/web_mercator_cache/MapServer/WMSServer", {
      layers: '0',
        format: 'image/png',
        transparent: true,
        attribution: "© 2013-2017 GeoBC, DataBC, The Province of British Columbia"
	});

  /*
  var SPOTimagery = new L.tileLayer.wms("http://geo_bc:rzVBvz7a@geocloud.blackbridge.com/service?", {
      //layers: '0',
      //format: 'image/png',
      //transparent: true,
      attribution: "© 2017 geomatics.planet.com",
      crs:crs84
  });
  */
  
/*-----OVERLAYS-----*/

  var crs84 = new L.Proj.CRS('CRS:84', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
  
  /*-----OKANAGAN LAKE IMAGERY-----*/

  var OKimagery2013 = new L.tileLayer.wms("http://openmaps.gov.bc.ca/imagex/ecw_wms.dll?", {
      layers: 'REGIONAL_MOSAICS_BC_OKANAGAN_LAKE_XC200MM_2013_BCALB',
        format: 'image/png',
        transparent: true,
        maxZoom: 21,
        attribution: "© 2013-2017 GeoBC, DataBC, The Province of British Columbia"
  });

  var OKimagery2017 = new L.tileLayer.wms("http://test.openmaps.gov.bc.ca/lzt/ows?", {
      layers: 'o17',
        format: 'image/png',
        transparent: true,
        maxZoom: 21,
        attribution: "© 2013-2017 GeoBC, DataBC, The Province of British Columbia"
  }).addTo(map);

  /*-----POINTS OF DIVERSION-----*/  
  /*
  var pointsOfDiversion = new L.tileLayer.wms("https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.WLS_POD_LICENCE_SP/ows", {
      layers: 'pub:WHSE_WATER_MANAGEMENT.WLS_POD_LICENCE_SP',
        format: 'image/png',
        transparent: true,
        attribution: "© 2013-2017 GeoBC, DataBC, The Province of British Columbia",
      crs:crs84,
      styles: 'Points_of_Diversion'
  }).addTo(map);
  */

  /*-----Layer Control-----*/
  var layerControl = L.control.layers(
    {
    'Roads Base Map': provRoadsWM,
    'Terrain Base Map': provWebMercatorCache
    //'SPOT Imagery': SPOTimagery
    },
    {
    'Okanagan Lake 2013 Imagery': OKimagery2013,
    'Okanagan Lake 2017 Imagery': OKimagery2017
    },
    {
    collapsed: false  
    }
  ).addTo(map);
 
  /*-----GEOJSON-----*/ 

  /*-----SCALEBAR-----*/
  var scaleControl = L.control.scale(
    {
    imperial: false
    }
  ).addTo(map);
  
});

