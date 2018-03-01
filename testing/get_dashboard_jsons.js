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
  makeFilterList();
  //provincialdataSummaries(aquiferJson);
  //provincialdataSummaries(aquiferJson,gwWellsJson,pwdLicencesJson,precinctsJson);
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

//Groundwater Wells globals
var gwWellsJson = {};
var gwWellsURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows";
var gwWellsTypeName = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
var gwWellsProperties = ['WELL_TAG_NO', 'SOURCE_ACCURACY', 'GEOMETRY', 'FCODE',
 'WELL_ID', 'WELL_LOCATION', 'WELL_SEQUENCE_NO', 'WELL_IDENTIFICATION_PLATE_NO',
 'WATER_UTILITY_FLAG', 'WATER_SUPPLY_WELL_NAME', 'WELL_TAG_NUMBER',
 'WATER_SUPPLY_SYSTEM_NAME', 'OBSERVATION_WELL_NUMBER', 'AQUIFER_LITHOLOGY_CODE',
 'WATER_DEPTH', 'ARTESIAN_FLOW_VALUE', 'BCGS_ID', 'WATERSHED_CODE', 'BCGS_NUMBER',
 'BEDROCK_DEPTH', 'CERTIFICATION', 'CHEMISTRY_LAB_DATA', 'CHEMISTRY_SITE_ID',
 'CLASS_OF_WELL', 'UTM_NORTH', 'CONSTRUCTION_END_DATE', 'CONSTRUCTION_METHOD_CODE',
 'CONSTRUCTION_METHOD_NAME', 'CONSTRUCTION_START_DATE', 'CONSULTANT_COMPANY',
 'CONTRACTOR_INFO_1', 'CONTRACTOR_INFO_2', 'CONTRACTOR_WELL_PLATE_NMBR',
 'COORDINATE_X', 'COORDINATE_Y', 'COORDINATE_Z', 'CREW_DRILLER_NAME', 'UTM_EAST',
  'CREW_HELPER_NAME', 'DATE_ENTERED', 'DEPTH_WELL_DRILLED', 'DEVELOPMENT_HOURS',
  'DEVELOPMENT_NOTES', 'DIAMETER', 'DRILLER_COMPANY_CODE', 'DRILLER_COMPANY_NAME',
  'DRILLER_WELL_ID', 'ELEVATION', 'FIELD_LAB_DATA', 'GENERAL_REMARKS',
  'GRAVEL_PACKED_FLAG', 'GRAVEL_PACKED_FROM', 'GRAVEL_PACKED_TO',
  'GROUND_WATER_FLAG', 'INDIAN_RESERVE', 'INFO_OTHER', 'INFO_SITE', 'LATITUDE',
  'LEGAL_BLOCK', 'LEGAL_DISTRICT_LOT', 'LEGAL_LAND_DISTRICT_CODE',
  'LEGAL_LAND_DISTRICT_NAME', 'UTM_ACCURACY_CODE', 'LEGAL_MISCELLANEOUS',
  'LEGAL_PLAN', 'LEGAL_RANGE', 'LEGAL_SECTION', 'LEGAL_TOWNSHIP',
  'LITHOLOGY_DESCRIPTION_COUNT', 'LITHOLOGY_FLAG', 'LITHOLOGY_MEASURMENT_UNIT',
  'LOCATION_ACCURACY', 'LOC_ACCURACY_CODE', 'LONGITUDE', 'LOT_NUMBER', 'MERIDIAN',
  'MINISTRY_OBSERVATION_WELL_STAT', 'MS_ACCESS_NUM_OF_WELL', 'OLD_MAPSHEET',
  'OLD_WELL_NUMBER', 'OTHER_CHEMISTRY_DATA', 'OTHER_EQUIPMENT', 'OTHER_INFORMATION',
  'OWNERS_WELL_NUMBER', 'OWNER_ID', 'SURNAME', 'PERFORATION_FLAG', 'PERMIT_NUMBER',
  'PID', 'PLATE_ATTACHED_BY', 'PRODUCTION_TIDAL_FLAG', 'PUMP_DESCRIPTION',
  'PUMP_FLAG', 'REPORTS_FLAG', 'RIG_NUMBER', 'QUARTER', 'SCREEN_FLAG',
  'SCREEN_INFORMATION_TEXT', 'SCREEN_LENGTH', 'SCREEN_MANUFACTURER', 'SCREEN_WIRE',
  'SEQUENCE_NO', 'SIEVE_FLAG', 'SITE_AREA', 'SITE_FLAG', 'SITE_ISLAND', 'SITE_STREET',
  'SURFACE_SEAL_DEPTH', 'SURFACE_SEAL_FLAG', 'SURFACE_SEAL_THICKNESS', 'TYPE_OF_RIG',
  'TYPE_OF_WORK', 'WELL_USE_CODE', 'WELL_USE_NAME', 'WHEN_CREATED', 'WHEN_UPDATED',
  'WHERE_PLATE_ATTACHED', 'WHO_CREATED', 'WHO_UPDATED', 'YIELD_UNIT_CODE',
  'YIELD_UNIT_DESCRIPTION', 'YIELD_VALUE', 'WELL_LICENCE_GENERAL_STATUS',
  'WELL_DETAIL_URL', 'SE_ANNO_CAD_DATA'];
var gwWellsCallback = 'getJsonGwWells';

//gwWells callback function run when JSON is returned by wfs call
var getJsonGwWells = function (response){
  console.log(gwWellsCallback + ' callback function');
  gwWellsJson = response;
  provincialdataSummaries(aquiferJson,gwWellsJson,pwdLicencesJson,precinctsJson);
};

//Groundwater Wells OBJECT
var gwWells = {
  data: {},
  //bbox: lwr left (x max, y min), upper right (x min, y max), epsg
  bbox: "", //example: -120.54016124, 50.68184294, -120.34252514, 50.73057956, epsg:4326
  get_data: function(){
    getWFSjson(gwWellsURL, gwWellsTypeName, gwWellsProperties, "get_gwWells", gwWells.bbox + ',epsg:4326')
  },
  callback: function(){console.log('new blank callback function')} 
};

//gwWells OBJECT callback function run when JSON is returned by wfs call
var get_gwWells = function (response){
  console.log('get_gwWells callback function');
  gwWells.data = response;
  gwWells.callback();
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

getWFSjson(aquiferURL, aquiferTypeName, aquiferProperties, aquiferCallback);
getWFSjson(regionsURL, regionsTypeName, regionsProperties, regionsCallback);

//$( document ).ready(function() {});
/*
$( document ).ready(getWFSjson(aquiferURL, aquiferTypeName, aquiferProperties, aquiferCallback));
$( document ).ready(getWFSjson(regionsURL, regionsTypeName, regionsProperties, regionsCallback));
$( document ).ready(getWFSjson(precinctsURL, precinctsTypeName, precinctsProperties, precinctsCallback));
$( document ).ready(getWFSjson(districtsURL, districtsTypeName, districtsProperties, districtsCallback));
$( document ).ready(getWFSjson(pwdLicencesURL, pwdLicencesTypeName, pwdLicencesProperties, pwdLicencesCallback));
$( document ).ready(getWFSjson(gwWellsURL, gwWellsTypeName, gwWellsProperties, gwWellsCallback));
*/

//fetch WFS (json) from openmaps geoserver
function getWFSjson(wfsURL, wfsTypeName, wfsProperties, wfsCallback, wfsBbox=
'-139.1782824917356, 47.60393449638617, -110.35337939457779, 60.593907018763396, epsg:4326') {
  var defaultParameters = {
    service: 'WFS',
    version: '2.0',
    request: 'GetFeature',
    typeName: wfsTypeName,
    outputFormat: 'text/javascript', //or application/json (but won't work w/ ajax dataType=jsonp )
    format_options: 'callback:' + wfsCallback,
    SrsName: 'EPSG:4326',
    propertyName: wfsProperties,
    //bbox: '-120.65062584,50.6512122,-120.53745904,50.72483285,epsg:4326'
    bbox: wfsBbox
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
