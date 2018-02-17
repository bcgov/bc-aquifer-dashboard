/* -----------------------------------------------------------------------------------
   get_dashboard_jsons.js

   Retrieves WFS layers (as JSONs) for the Aquifer Dashboard: makes various data
   available for different features of the dashboard (e.g., maps, graphs, widgets)

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

//aquifer globals
var aquiferJson = {};
var aquiferURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows";
var aquiferTypeName = 'WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW';
var aquiferProperties = ['AQ_TAG', 'AQNAME', 'AQUIFER_MATERIALS', 'PRODUCTIVITY',
'VULNERABILITY', 'DEMAND', 'AQUIFER_CLASSIFICATION', 'AQUIFER_NAME',
'AQUIFER_RANKING_VALUE', 'DESCRIPTIVE_LOCATION', 'LITHO_STRATOGRAPHIC_UNIT',
'QUALITY_CONCERNS', 'AQUIFER_DESCRIPTION_RPT_URL', 'AQUIFER_STATISTICS_RPT_URL',
'AQUIFER_SUBTYPE_CODE', 'QUANTITY_CONCERNS', 'SIZE_KM2', 'TYPE_OF_WATER_USE',
'PRODUCTIVITY_CODE', 'DEMAND_CODE', 'VULNERABILITY_CODE', 'CLASSIFICATION_CODE',
'GEOMETRY', 'FEATURE_AREA_SQM'];
var aquiferCallback = 'getJsonAquifer';

//aquifer callback function run when JSON is returned by wfs call
var getJsonAquifer = function (response){
  console.log(aquiferCallback + ' callback function');
  aquiferJson = response;
  //populate search box
  //makeFilterList();
};

//NRS regions globals
var regionsJson = {};
var regionsURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG/ows";
var regionsTypeName = 'WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG';
var regionsProperties = ['REGION_NAME', 'ORG_UNIT', 'ORG_UNIT_NAME',
'FEATURE_CODE', 'FEATURE_NAME', 'SHAPE', 'FEATURE_AREA_SQM'];
var regionsCallback = 'getJsonRegions';

//NRS regions callback function run when JSON is returned by wfs call
var getJsonRegions = function (response){
  console.log(regionsCallback + ' callback function');
  regionsJson = response;
};

//water precincts globals
var precinctsJson = {};
var precinctsURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_PREC_AREA_SVW/ows";
var precinctsTypeName = 'WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_PREC_AREA_SVW';
var precinctsProperties = ['WATMGMT_PRECINCT_AREA_ID', 'FEATURE_CODE',
'PRECINCT_NAME', 'PRECINCT_ID', 'DISTRICT_NAME', 'FEATURE_AREA_SQM', 'GEOMETRY'];
var precinctsCallback = 'getJsonPrecincts';

//water precincts callback function run when JSON is returned by wfs call
var getJsonPrecincts = function (response){
  console.log(precinctsCallback + ' callback function');
  precinctsJson = response;
};

//water districts globals
var districtsJson = {};
var districtsURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_DIST_AREA_SVW/ows";
var districtsTypeName = 'WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_DIST_AREA_SVW';
var districtsProperties = ['WATMGMT_DISTRICT_AREA_ID', 'FEATURE_CODE',
'DISTRICT_ID', 'DISTRICT_NAME', 'FEATURE_AREA_SQM', 'GEOMETRY'];
var districtsCallback = 'getJsonDistricts';

//water districts callback function run when JSON is returned by wfs call
var getJsonDistricts = function (response){
  console.log(districtsCallback + ' callback function');
  districtsJson = response;
};

//points of well diversions (PWD) licences globals
var pwdLicencesJson = {};
var pwdLicencesURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.WLS_PWD_LICENCES_SVW/ows";
var pwdLicencesTypeName = 'WHSE_WATER_MANAGEMENT.WLS_PWD_LICENCES_SVW';
var pwdLicencesProperties = ['PWD_LICENCE_ID', 'PWD_NUMBER', 'PWD_STATUS',
'FILE_NUMBER', 'WELL_TAG_NUMBER', 'LICENCE_NUMBER', 'LICENCE_STATUS',
'LICENCE_STATUS_DATE', 'PRIORITY_DATE', 'EXPIRY_DATE', 'PURPOSE_USE_CODE',
'PURPOSE_USE', 'AQUIFER_NAME', 'REDIVERSION_IND', 'QUANTITY', 'QUANTITY_UNITS',
'QUANTITY_FLAG', 'QUANTITY_FLAG_DESCRIPTION', 'HYDRAULIC_CONNECTIVITY',
'PERMIT_OVER_CROWN_LAND_NUMBER', 'PRIMARY_LICENSEE_NAME', 'ADDRESS_LINE_1',
'ADDRESS_LINE_2', 'ADDRESS_LINE_3', 'ADDRESS_LINE_4', 'COUNTRY', 'POSTAL_CODE',
'LATITUDE', 'LONGITUDE', 'DISTRICT_PRECINCT_NAME', 'SHAPE'];
var pwdLicencesCallback = 'getJsonPwdLicences';

//points of well diversions (PWD) licences callback function run when JSON is returned by wfs call
var getJsonPwdLicences = function (response){
  console.log(pwdLicencesCallback + ' callback function');
  pwdLicencesJson = response;
};

//$( document ).ready(function() {});
$( document ).ready(getWFSjson(aquiferURL, aquiferTypeName, aquiferProperties, aquiferCallback));

//fetch WFS (json) from openmaps geoserver
function getWFSjson(wfsURL, wfsTypeName, wfsProperties, wfsCallback) {
  var defaultParameters = {
    service: 'WFS',
    version: '2.0',
    request: 'GetFeature',
    typeName: wfsTypeName,
    outputFormat: 'text/javascript', //or application/json (but won't work w/ ajax dataType=jsonp )
    format_options: 'callback:' + wfsCallback,
    SrsName: 'EPSG:4326',
    //exclude 'GEOMETRY' from list below if spatial not required
    propertyName: wfsProperties
  };

  var parameters = L.Util.extend(defaultParameters);
  var URL = wfsURL + L.Util.getParamString(parameters);

  //map.spin(true);
  //ajax (asynchronous HTTP) request https://www.sitepoint.com/ajaxjquery-getjson-simple-example/
  var ajax = $.ajax({
    url: URL,
    dataType: 'jsonp',
    jsonpCallback: wfsCallback,
    success: function(response) {
      console.log('executed wfs request');
      //map.spin(false);
    }
  });
}
