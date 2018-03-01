function provincialdataSummaries(aquiferJson,gwWellsJson,pwdLicencesJson,precinctsJson){
        aquiferProvDataarray = json2array(aquiferJson);
        aquiferProvVulnerability(aquiferProvDataarray);
        //aquifersbyAreas(aquiferJson,regionsJson,precinctsJson,districtsJson);
        //wellsbyAreas(gwWellsJson,precinctsJson);
}

function getWellsByAquiferByTag(tag){
  var polyGeoJSON;
  var pntGeoJSON;
  var aqURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json";
  aqURL = aqURL + "&CQL_FILTER=AQ_TAG" + "=%27"+ tag + "%27";
  var wellURL = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&SRSNAME=epsg:4326&outputFormat=json";
  function getWFS(url, bbox){
    //build bounding box into query
    var newURL = url + "&BBOX=" + bbox[0] + ","+ bbox[1]+ "," + bbox[2] + ","+ bbox[3] + ",epsg:4326";
    d3.queue()
      .defer(d3.json,newURL)
      .await(doturfwork);
      function doturfwork(error,geojson){
          pntGeoJSON = geojson;
          var polyPnts = turf.pointsWithinPolygon(pntGeoJSON,polyGeoJSON);
          //load aquifer and wells on map
          makeAquiferInfoWidget(polyGeoJSON);
          makeWellDepthGraph(polyPnts);
          makeBoxChartGraph2(polyPnts);
      }
  }
  d3.queue()
    .defer(d3.json, aqURL)
    .await(getBBOX);
    function getBBOX(error,geojson){
      bbox = turf.bbox(geojson);
      polyGeoJSON = geojson;
      getWFS(wellURL,bbox);
    }

  console.log("done");
}
function makeWellDepthGraph(geoJSONPnts){
  var dataArray = json2array(geoJSONPnts);
  var graphArray = [];
  var valueIndex = dataArray[0].indexOf("WATER_DEPTH");
  var tagIndex = dataArray[0].indexOf("WELL_ID");

  graphArray.push(["WELL_ID","WATER DEPTH"]);
  for (i=1;i<dataArray.length; i++){
    graphArray.push(['Well-id:' + dataArray[i][tagIndex],dataArray[i][valueIndex]]);
  }
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
        var data = google.visualization.arrayToDataTable(graphArray,false);
        var options = {
          title: 'Aquifer ' + $('#filter').value +': Well Water Depth',
          legend: { position: 'none' },
          vAxis: {title: 'count'},
          width:500,
          height:300,
          backgroundColor:'#dddddd'
        };
        if (document.getElementById('well-depth-graph')){
          var chart = new google.visualization.Histogram(document.getElementById('well-depth-graph'));
        }
        else {
          setWidget('','dashboard','well-depth-graph');
          var chart = new google.visualization.Histogram(document.getElementById('well-depth-graph'));
        }
        chart.draw(data, options);
      }
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

function aquiferProvVulnerability(aquiferProvDataarray){
    //convert to array
    var aquiferProvVulnerableArray = [];
    var valueIndex = aquiferProvDataarray[0].indexOf("SIZE_KM2");
    var tagIndex = aquiferProvDataarray[0].indexOf("VULNERABILITY");
    aquiferProvVulnerableArray.push(["VULNERABILITY","SIZE_KM2"]);
    for (i=1;i<aquiferProvDataarray.length; i++){
      aquiferProvVulnerableArray.push(['Vulnerable:' + aquiferProvDataarray[i][tagIndex],aquiferProvDataarray[i][valueIndex]]);
    }
    console.log(aquiferProvVulnerableArray)
    sumVulnerabilitydata = rollupArray(aquiferProvVulnerableArray, "VULNERABILITY", "SIZE_KM2");
    console.log(sumVulnerabilitydata)
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
          var data = google.visualization.arrayToDataTable(sumVulnerabilitydata,false);
          var options = {
            title: 'Aquifer Provincial Vulnerability: Area Km2',
            width:400,
            height:300,
            colors: ['#ff0000', '#008000', '#ffa500'],
            backgroundColor:'#adafb2'
          };
          setWidget('','dashboard','prov-vulnerable-pie');
          var chart = new google.visualization.PieChart(document.getElementById('prov-vulnerable-pie'));
          chart.draw(data, options);
        }
          console.log('done prov vulnerability');
  }

function aquifersbyAreas(inaquiferJson,inregionsJson,inprecinctsJson,indistrictsJson){
    //Move the aquifer polygons to a centroid
    var aquifercentroidPt = turf.centroid(inaquiferJson);
    var result = {
      "type": "FeatureCollection",
      "features": [inaquiferJson, aquifercentroidPt]
    };
    console.log('Aquifer by Areas');
    console.log(result);
}

//worked with smaller
function wellsbyAreas(ingwWellsJson,inprecinctsJson){
   console.log('tagged');
    var tagged = turf.tag(ingwWellsJson, inprecinctsJson, 'PRECINCT_NAME', 'PREC_NAME');
    console.log('tagged');
    console.log(tagged);
}


function makeBoxChartGraph2(ingeoJSONPnts){
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    //need to figure out quartile data here
    function drawChart() {
      var data = google.visualization.arrayToDataTable([
        ['Well Data', 20, 28, 38, 45]
        // Treat first row as data as well.
      ], true);

      var options = {
        legend:'none'
      };
      setWidget('','dashboard','well-box-graph');
      var chart = new google.visualization.CandlestickChart(document.getElementById('well-box-graph'));

      chart.draw(data, options);
    }
}
