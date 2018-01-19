
//requests are faster with limits on fields returned... including excluding geometery for polygons....
//probably best to draw polygons with wms... get the feature with featureInfo... then request geometry for use with TURF to get related wells
var aquifer = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&outputFormat=json&propertyname=AQ_TAG,AREA,PRODUCTIVITY,VULNERABILITY,DEMAND,DESCRIPTIVE_LOCATION";
var wells = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL&propertyname=WELL_ID,LONGITUDE,LATITUDE";
var wellsCallback = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER%20IS%20NOT%20NULL&format_options=callback:processJSON";
var wellfilter = "CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL";
var options = {};
var aquiferJSON = {};
var wellJSON = {};
var summaryData = [];
function test (){
  console.log("Start test");
  var wellData = [];
  var aquiferData = [];
  //rest request for data
  d3.queue()
	.defer(d3.json, aquifer)
	.defer(d3.json, wells)
	.await(seethedata);
  function seethedata(error,a,w){
    //add data counts to div
    $('#ul-value').text(a.totalFeatures);
    $('#ur-value').text(w.totalFeatures);
    //convert to array
    aquiferData = json2array(a);
    //rollup by VULNERABILITY and AREA
    var sumdata = [];
    sumdata = rollupArray(aquiferData, 'VULNERABILITY', 'AREA');
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
          var data = google.visualization.arrayToDataTable(sumdata,false);
          var options = {
            title: 'Aquifer Vulnerability: Area',
            width:400,
            height:400,
            backgroundColor:'#adafb2'
          };
          var chart = new google.visualization.PieChart(document.getElementById('cell-lr'));
          chart.draw(data, options);
        }
  }
  console.log('done test');
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

function json2array(jsonObj){
  console.log("json to array");
  //build data array
  var darray = [];
  $.each(jsonObj.features, function(fprop,val){
    var fieldList = [];
    var adata = [];
    $.each(val.properties,function(field,value){
      if (fieldList.indexOf(field) == -1){
        fieldList.push(field);
      }
      adata.push(value);
    })
    if (darray.length == 0){
      darray.push(fieldList);
    }
    if (adata.length != 0){
      darray.push(adata);
    }

  });
  console.log(darray);
  console.log("finished json to array");
  return darray;
}
function rollupArray(dataArray,rollupField, valueField){
  //expects first item to be array of columns followed by arrays of equal size for data
  //rollup field must be a string
  //value field must be a numerical type
  var rollup = [];
  var rollupKeyList = [];
  var rollupValueList = [];

  //check for field that does not exist in table
  if (dataArray[0].indexOf(rollupField)!=-1 && dataArray[0].indexOf(valueField)!=-1){
    var rollupIndex = dataArray[0].indexOf(rollupField);
    var valueIndex = dataArray[0].indexOf(valueField);
    var key;
    var kv = 0;
    for (i = 1; i < dataArray.length; i++) {
      key = dataArray[i][rollupIndex];
      kv = dataArray[i][valueIndex];
      if (rollupKeyList.indexOf(key)==-1){
        rollupKeyList.push(key);
        rollupValueList.push(kv);
      }
      else {
        rollupValueList[rollupKeyList.indexOf(key)] = rollupValueList[rollupKeyList.indexOf(key)] + kv;
      }
    }
  }

  //transpose into one array
  rollup.push([rollupField,valueField]);
  for (i=0;i<rollupKeyList.length; i++){
    rollup.push([rollupKeyList[i],rollupValueList[i]]);
  }
  return rollup;
}

test();
