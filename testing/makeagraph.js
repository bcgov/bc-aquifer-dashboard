
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
          //makeWellMap([polyGeoJSON,polyPnts]);
          

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
          title: 'Aquifer ' + $('#filter').text() +': Well Water Depth',
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

function getProvincialAquiferList (){
  var aquifer = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json&propertyname=AQ_TAG";
  var aquiferData = [];
  var aqList = [];
  //rest request for data
  d3.queue()
	.defer(d3.json, aquifer)
	.await(seethedata);
  function seethedata(error,a,w){
    //add data counts to div

    //convert to array
    aquiferData = json2array(a);
    //create an array of fieldname values
    var fIndex = aquiferData[0].indexOf('AQ_TAG');
    //expect field names to be first array
    for (i=1;i<aquiferData.length;i++){
      var val = aquiferData[i][fIndex];
      aqList.push(val);
    }
    $( "#filterbox" ).autocomplete({
      source: aqList,
      appendTo: "#filter"

    });
  }
  
}