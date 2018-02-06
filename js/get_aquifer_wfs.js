/* -----------------------------------------------------------------------------------
   Aquifer WFS
   Developed by GeoBC
   (c) 2018 GeoBC | http://www.geobc.gov.bc.ca
   https://gis.stackexchange.com/questions/64406/getting-wfs-data-from-geoserver-into-leaflet
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

  var aquiferURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows"

  var defaultParameters = {
    service: 'WFS',
    version: '2.0',
    request: 'GetFeature',
    typeName: 'WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
    outputFormat: 'text/javascript',
    format_options: 'callback:getJson',
    SrsName: 'EPSG:4326'
  };

  var parameters = L.Util.extend(defaultParameters);
  var URL = aquiferURL + L.Util.getParamString(parameters);

  var WFSLayer = null;
  var ajax = $.ajax({
    url: URL,
    dataType: 'jsonp',
    jsonpCallback: 'getJson',
    success: function(response) {
      WFSLayer = L.geoJson(response, {
        style: function (feature) {
          return{
            stroke: true,
            color: '#d440f1',
            weight: 1,
            opacity: 1,
            fill: true,
            fillColor: '000000',
            fillOpacity: 0.25
          };
        },
        onEachFeature: function (feature, layer) {
          popupOptions = {maxWidth: 200};
          layer.bindPopup('AQ_TAG: ' + feature.properties.AQ_TAG
        + '<br>NAME: ' + feature.properties.AQNAME);
        }
      }).addTo(map)
    }
  });

/*-----BASE MAPS-----*/

  var provRoadsWM = new L.tileLayer.wms("http://maps.gov.bc.ca/arcserver/services/province/roads_wm/MapServer/WMSServer", {
    	 layers: '0',
        format: 'image/png',
        transparent: false,
        attribution: "© 2013-2018 GeoBC, DataBC, The Province of British Columbia"
	}).addTo(map);

  var provWebMercatorCache = new L.tileLayer.wms("http://maps.gov.bc.ca/arcserver/services/Province/web_mercator_cache/MapServer/WMSServer", {
        layers: '0',
        format: 'image/png',
        transparent: false,
        attribution: "© 2013-2018 GeoBC, DataBC, The Province of British Columbia"
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
  /*
  var OKimagery2013 = new L.tileLayer.wms("http://openmaps.gov.bc.ca/imagex/ecw_wms.dll?", {
        layers: 'REGIONAL_MOSAICS_BC_OKANAGAN_LAKE_XC200MM_2013_BCALB',
        format: 'image/png',
        transparent: true,
        maxZoom: 21,
        attribution: "© 2013-2018 GeoBC, DataBC, The Province of British Columbia"
  });

  var OKimagery2018 = new L.tileLayer.wms("http://test.openmaps.gov.bc.ca/lzt/ows?", {
        layers: 'o17',
        format: 'image/png',
        transparent: true,
        maxZoom: 21,
        attribution: "© 2013-2018 GeoBC, DataBC, The Province of British Columbia"
  }).addTo(map);
  */

  /*-----AQUIFERS POLY-----*/
  /*
  var aquiferPolys = new L.tileLayer.wms("https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows", {
        layers: 'pub:WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
        format: 'image/png',
        transparent: true,
        attribution: "© 2013-2016 GeoBC, DataBC, The Province of British Columbia",
        crs:crs84,
        styles: 'Aquifers_BC_Outlined'
  });
  */

  /*-----GROUNDWATER WELLS-----*/

  var gwWells = new L.tileLayer.wms("https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows", {
        layers: 'pub:WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
        format: 'image/png',
        version: '1.3.0',
        transparent: true,
        attribution: "© 2013-2018 GeoBC, DataBC, The Province of British Columbia",
        crs:crs84,
        styles: 'Provincial_Groundwater_Observation_Wells_Active' //'Water_Wells_All'
  });//.addTo(map);


  /*-----Layer Control-----*/
  var layerControl = L.control.layers(
    {
    'Roads Base Map': provRoadsWM,
    'Terrain Base Map': provWebMercatorCache
    //'SPOT Imagery': SPOTimagery
    },
    {
    //'Groundwater Wells (Scale Dependent)': gwWells,
    //'Aquifers (Scale Dependent)': aquiferPolys
    //'Okanagan Lake 2013 Imagery': OKimagery2013,
    //'Okanagan Lake 2017 Imagery': OKimagery2017
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
