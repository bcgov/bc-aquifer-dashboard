/* -----------------------------------------------------------------------------------
   Get Aquifer WFS
   Developed by GeoBC
   (c) 2018 GeoBC | http://www.geobc.gov.bc.ca
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

/*-----AQUIFER WFS-----*/
// https://gis.stackexchange.com/questions/64406/getting-wfs-data-from-geoserver-into-leaflet
  var aquiferURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows"

  var defaultParameters = {
    service: 'WFS',
    version: '2.0',
    request: 'GetFeature',
    typeName: 'WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
    outputFormat: 'text/javascript', //or application/json (but won't work w/ ajax dataType=jsonp )
    format_options: 'callback:getJson',
    SrsName: 'EPSG:4326',
    //exclude 'GEOMETRY' from list below if spatial not required
    propertyName: ['AQ_TAG', 'AQNAME', 'AQUIFER_MATERIALS', 'PRODUCTIVITY',
    'VULNERABILITY', 'DEMAND', 'AQUIFER_CLASSIFICATION', 'AQUIFER_NAME',
    'AQUIFER_RANKING_VALUE', 'DESCRIPTIVE_LOCATION', 'LITHO_STRATOGRAPHIC_UNIT',
    'QUALITY_CONCERNS', 'AQUIFER_DESCRIPTION_RPT_URL', 'AQUIFER_STATISTICS_RPT_URL',
    'AQUIFER_SUBTYPE_CODE', 'QUANTITY_CONCERNS', 'SIZE_KM2', 'TYPE_OF_WATER_USE',
    'PRODUCTIVITY_CODE', 'DEMAND_CODE', 'VULNERABILITY_CODE', 'CLASSIFICATION_CODE',
    'GEOMETRY', 'FEATURE_AREA_SQM']
  };

  var parameters = L.Util.extend(defaultParameters);
  var URL = aquiferURL + L.Util.getParamString(parameters);

  var WFSLayer = null;
  //ajax (asynchronous HTTP) request https://www.sitepoint.com/ajaxjquery-getjson-simple-example/
  var ajax = $.ajax({
    url: URL,
    dataType: 'jsonp',
    jsonpCallback: 'getJson',
    success: function(response) {
      console.log(response);
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
        + '<br>NAME: ' + feature.properties.AQNAME
        + '<br>SUBTYPE CODE: ' + feature.properties.AQUIFER_SUBTYPE_CODE);
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

/*-----WMS OVERLAYS-----*/

  var crs84 = new L.Proj.CRS('CRS:84', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

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
