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

//$( document ).ready(function() {});

//aquifer geoJson global
var aquiferJson = {};

//call this to load data into aquiferJson
function getAquiferJSON(){


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
      console.log('executed wfs request');
    }
  });
}
//this is a callback function to be run when JSON is returned by wfs call
var getJson = function (response){
  console.log('getJson callback function');
  aquiferJson = response;
};
