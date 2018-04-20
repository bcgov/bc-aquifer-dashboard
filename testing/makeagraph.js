//GLOBAL store the current aquifer geojson here
var currentAquiferGeoJson;

function provincialdataSummaries(aquiferJson,gwWellsJson,pwdLicencesJson,precinctsJson){
        aquiferProvDataarray = json2array(aquiferJson);
        aquiferProvVulnerability(aquiferProvDataarray);
        //aquifersbyAreas(aquiferJson,regionsJson,precinctsJson,districtsJson);
        //wellsbyAreas(gwWellsJson,precinctsJson);
}
function getWellsByAquiferTag(tag){
  //this function depends on aquiferJson being populated and containing geometry
  currentAquiferGeoJson = filterGeoJsonByAttribute(provincialAquiferJson,'AQ_TAG',tag);
  //set bounding box for aquifer
  var bbox = turf.bbox(currentAquiferGeoJson);
  gwWells.bbox = bbox[0] + ","+ bbox[1]+ "," + bbox[2] + ","+ bbox[3];
  //set and run callback
  gwWells.callback = doStuffWithWells;
  gwWells.get_data();
}
function doStuffWithWells(){
  var polyPnts = turf.pointsWithinPolygon(gwWells.data,currentAquiferGeoJson);
  //replace bbox wells with wells within aquifer
  gwWells.data = polyPnts;
  //load aquifer and wells on map
  var element = document.getElementById('prov-vulnerable-pie');
  if (element){
    element.parentNode.removeChild(element);
  }
  var element2 = document.getElementById('widget-table-well');
  if (element2){
    element2.parentNode.removeChild(element2);
  }
  var element3 = document.getElementById('chart_linesobswell');
  if (element3){
    element3.parentNode.removeChild(element3);
  }

  makeAquiferInfoWidget(currentAquiferGeoJson);
  makeWellDepthGraph(polyPnts);
  makeBoxChartGraph(polyPnts);
  makeWellsInfoWidget(polyPnts)
  //addWellsToMap();
  addWellsToMapCluster();
  if (obsWells.totalFeatures > 0){
      console.log(obsWells.totalFeatures)
      obsWellNumber = obsWells.features[0].properties.OBSERVATION_WELL_NUMBER;
      console.log(obsWellNumber)
      loadCsv(resourceIDs['GWL_monthly_csv'], obswellCallback, obsWellNumber);
      function obswellCallback (response){
        csvData = response.result.records;
        console.log("obswellCallback successful");
        if (csvData.length > 12){
            makeObsWellGraph();
        }
      };
   }
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
          title: $('#filter-text').text() +': Well Water Depth Histogram',
          legend: { position: 'none' },
          vAxis: {title: 'Count'},
          hAxis: {title: 'Depth (m)'},
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
        document.getElementById("well-depth-graph").classList.add('grid-item--width4');
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

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}

function flatArray(dataArray,arrayField){
    //expects first item to be array of columns followed by arrays of equal size for data
    var rollupflat = [];
    var nullcounter = 1
    var valueIndex = dataArray[0].indexOf(arrayField);
    //transpose into one array
    for (i=1;i<dataArray.length; i++){
      kv = dataArray[i][valueIndex];
      if (kv!==null){
        rollupflat.push(kv);
      }
      else{
        nullcounter = nullcounter + 1
      }
    }
    console.log('flat array');
    //returns a list of values and a count of null values
    return [rollupflat,nullcounter];
}


function aquiferProvVulnerability(aquiferProvDataarray){
    //convert to array
    var aquiferProvVulnerableArray = [];
    var valueIndex = aquiferProvDataarray[0].indexOf("SIZE_KM2");
    var tagIndex = aquiferProvDataarray[0].indexOf("VULNERABILITY");
    aquiferProvVulnerableArray.push(["VULNERABILITY","SIZE_KM2"]);
    for (i=1;i<aquiferProvDataarray.length; i++){
      aquiferProvVulnerableArray.push([aquiferProvDataarray[i][tagIndex],aquiferProvDataarray[i][valueIndex]]);
    }
    sumVulnerabilitydata = rollupArray(aquiferProvVulnerableArray, "VULNERABILITY", "SIZE_KM2");
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
          var data = google.visualization.arrayToDataTable(sumVulnerabilitydata,false);
          var options = {
            title: 'Aquifer Provincial Vulnerability: Area Km2',
            width:400,
            height:300,
            colors: ['#008000','#ffa500','#ff0000'],
            backgroundColor:'#dddddd'
          };
          setWidget('','dashboard','prov-vulnerable-pie');
          var chart = new google.visualization.PieChart(document.getElementById('prov-vulnerable-pie'));
          chart.draw(data, options);
          document.getElementById("prov-vulnerable-pie").classList.add('grid-item--width2');
          document.getElementById("prov-vulnerable-pie").classList.add('grid-item--height1');
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


function makeBoxChartGraph(inpolyPnts){
    //convert selected pointds to array
    var dataArray = json2array(inpolyPnts);
    //Just get data from filed in array and return numbers in arrary list and nulls that were in data . e.g. [2,5,6,2,13,67]
    outArrayvars = flatArray(dataArray,'WATER_DEPTH')
    //sets returns from flatArray
    flatArraypnts = outArrayvars[0]
    nullcount = outArrayvars[1]
    //sort flat array sequential
    sortedflatArraypnts = Array_Sort_Numbers(flatArraypnts)
    //call arraystats.js and return stats from array list
    var q25 = Quartile_25(sortedflatArraypnts)
    var q75 = Quartile_75(sortedflatArraypnts)
    var arrayMedian = Quartile_50(sortedflatArraypnts)
    var arrayLow = sortedflatArraypnts[0]
    var end = sortedflatArraypnts[((sortedflatArraypnts.length) - 1)]
    arrayHigh = end
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    //need to figure out quartile data here
    function drawChart() {
      var data = google.visualization.arrayToDataTable([
        ['Wells', arrayLow, q25, q75, arrayHigh]
        // Treat first row as data as well.
      ], true);

      var options = {
        title:'Aquifer Well Depth Boxplot (25 and 75 Quartile)',
        legend:'none',
        backgroundColor:'#dddddd',
        vAxis:{
          title: 'Well Depth (m) '
        }
      };
      setWidget('','dashboard','well-box-graph');
      var chart = new google.visualization.CandlestickChart(document.getElementById('well-box-graph'));
      chart.draw(data, options);
      //document.getElementById("well-box-graph").classList.add('grid-item--width2');
    }
}
function filterGeoJsonByAttribute(aGeoJson,att,val) {
  const geojson = Object.assign({}, aGeoJson);
  var f = geojson.features;
  var newf = [];
  for (i=0;i<f.length;i++) {
      var ftrVal = f[i].properties[att];
      //check for property value match
      if (ftrVal==val) {
        //push to new array
          newf.push(f[i])
      }
  }
  geojson.features = newf;
  geojson.totalFeatures = newf.length;
  return geojson;
}

var regionalAquiferRollup = {
  //this object controls the regional rollup
  //
  geoJson: {},
  bbox: "",
  create: function(regionName){
    //create rollup
    geoJson = function(){
      var data = {};
      var regionGeoJSON = filterGeoJsonByAttribute(lyrLocalRegions.toGeoJSON(),"REGION_NAME",regionName);
      var regionGeom = turf.simplify(regionGeoJSON).features[0].geometry;
      var rawBbox = turf.bbox(regionGeom);
      regionalAquiferRollup.bbox = rawBbox[0] + ","+ rawBbox[1]+ "," + rawBbox[2] + ","+ rawBbox[3];
      window.regionalAquifer_callback = function(response){
        console.log(response.results.totalFeatures);
      };
      getWFSjson(window.aquiferURL, window.aquiferTypeName, window.aquiferClippedProperties, 
        aquiferClippedCallback, window.aquiferCQLfilter, regionalAquiferRollup.bbox + ",'epsg:4326'");
      return data
    };
  }

}