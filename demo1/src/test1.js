
//requests are faster with limits on fields returned... including excluding geometery for polygons....
//probably best to draw polygons with wms... get the feature with featureInfo... then request geometry for use with TURF to get related wells
var aquifer = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&outputFormat=json&propertyname=AQ_TAG,AREA,PRODUCTIVITY,VULNERABILITY,DEMAND,DESCRIPTIVE_LOCATION";
var wells = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL&propertyname=WELL_ID,LONGITUDE,LATITUDE";
var wellsCallback = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER%20IS%20NOT%20NULL&format_options=callback:processJSON";
var wellfilter = "CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL";
var options = {};
var aquiferList = [];
var wellList = [];

function test (){
  console.log("Start test")
  turfAquiferWells(wells,aquifer);
}
function turfAquiferWells(pointURL,polyURL){
  //use turf.tag(pointJSON,POLYJSON) to joint point to poly
  //ie.  for the identified aquifer tag wells that are within

  $.getJSON(pointURL, function(pointResult){
    var pointJSON = pointResult;
    $.getJson(polyURL, function(polyResult){
      console.log(turf.tag(pointJSON,polyResult));
    });
  });
  console.log('turfAquiferWells complete')
}
function test2(){
  console.log('Start Test 2');

  $.getJSON(aquifer, function(result){
    processAquifers(result);
  });
  $.getJSON(wells, function(result){
    processWells(result);
  });
  console.log('test2 complete');
}

function processAquifers(result){
  console.log("parse aquifers");
  $.each(result.features, function(fprop,val){
    var aquiferObj = {};
    $.each(val.properties,function(field,value){
      aquiferObj[field] = value;
    })
    aquiferList.push(aquiferObj);
    $('#ul-value').text(aquiferList.length);
  });
  console.log("parsed aquifers");
}
function processWells(result){
  console.log("parse aquifers");
  $.each(result.features, function(fprop,val){
    var wellObj = {};
    $.each(val.properties,function(field,value){
      //console.log(field + ": " + value);
      wellObj[field] = value;
    })
    wellList.push(wellObj);
    $('#ur-value').text(wellList.length);
  });
  console.log("parsed wells");
}
test2();
