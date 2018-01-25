
//requests are faster with limits on fields returned... including excluding geometery for polygons....
//probably best to draw polygons with wms... get the feature with featureInfo... then request geometry for use with TURF to get related wells
var aquifer = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json&propertyname=AQ_TAG,AREA,PRODUCTIVITY,VULNERABILITY,DEMAND,DESCRIPTIVE_LOCATION";
var wells = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&SRSNAME=epsg:4326&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL&propertyname=WELL_ID,LONGITUDE,LATITUDE";
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
function makeWellMap(geoJSONlist){
  //basic map
  //set map size
  var parentElement = document.getElementById('cell-ll');
  var mapdiv = document.createElement('div');
  mapdiv.id = 'map';
  var h = parentElement.offsetHeight - 20;
  mapdiv.style.height = h.toString() + "px";
  parentElement.appendChild(mapdiv);
  var cntr = turf.centroid(geoJSONlist[0]);


  var map = L.map('map').setView([cntr.geometry.coordinates[1], cntr.geometry.coordinates[0]], 12);
  var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 18,
  }).addTo(map);
  //add all the geojson in list
  var geoJSONcount = geoJSONlist.length;
  for (var i = 0; i < geoJSONcount; i++) {
      L.geoJSON(geoJSONlist[i]).addTo(map);
  }
  var popup = L.popup();

  function onMapClick(e) {
      popup
          .setLatLng(e.latlng)
          .setContent(e.latlng.toString() + " zoom:" + map.getZoom())
          .openOn(map);
  }

  map.on('click', onMapClick);
}
function testingTurf(){
  //only a test to see if Turf will work for point in poly joint
  //aquifer AQ Tag: 0255
  var polyGeoJSON;
  var pntGeoJSON;
  var testPoly = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json&CQL_FILTER=AQ_TAG='0255'";
  var testPoints = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&SRSNAME=epsg:4326&outputFormat=json";
  function getWFS(url, bbox){
    //build bounding box into query
    var newURL = testPoints + "&BBOX=" + bbox[0] + ","+ bbox[1]+ "," + bbox[2] + ","+ bbox[3] + ",epsg:4326";
    d3.queue()
      .defer(d3.json,newURL)
      .await(doturfwork);
      function doturfwork(error,geojson){
          pntGeoJSON = geojson;
          var polyPnts = turf.pointsWithinPolygon(pntGeoJSON,polyGeoJSON);
          makeWellMap([polyGeoJSON,polyPnts]);

      }
    //console.log(bboxGeoJSON.totalFeatures);
  }
  d3.queue()
    .defer(d3.json, testPoly)
    .await(getBBOX);
    function getBBOX(error,geojson){
      bbox = turf.bbox(geojson);
      console.log(bbox);
      polyGeoJSON = geojson;
      getWFS(testPoints,bbox);
    }

  console.log("done");
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
testingTurf();
