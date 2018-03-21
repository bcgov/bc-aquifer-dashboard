function setWidget(content, parentElementId, widgetId){
  //if widget exists return it
  if (document.getElementById(widgetId)){
    var widgetDiv = document.getElementById(widgetId);
    widgetDiv.innerHTML = '';
  }
  else {
    var parentE = document.getElementById(parentElementId);
    var widgetDiv = document.createElement('div');
    widgetDiv.className += 'grid-item widget';
    widgetDiv.id = widgetId;
    widgetDiv.innerHTML = content;
    parentE.appendChild(widgetDiv);
  }
  return widgetDiv
}
function setFilterDisplay(filterText){
  var firstChar = filterText.charAt(0);
  if ('0123456789'.indexOf(firstChar) !== -1) {
    // Is a number
    document.getElementById('filter-text').innerHTML = 'Aquifer Number: ' + filterText;}
  else {
    //its something else
    document.getElementById('filter-text').innerHTML = filterText;
  }
}

function setDashboardFilter(tag){
  //var tag = '0255'
  setFilterDisplay(tag);
  getWellsByAquiferTag(tag);//getWellsByAquiferByTag(tag);
}

function openWebLink(inLink) {
    window.open(inLink);
}

function makeAquiferInfoWidget(geoJson){
  //list of fields to add to info table
  var fieldList = ['AQNAME','AQ_TAG', 'AQUIFER_SUBTYPE_CODE','AQUIFER_CLASSIFICATION','DEMAND','VULNERABILITY', 'AQUIFER_MATERIALS'];
  var tag = geoJson.features[0].properties.AQ_TAG;
  //var infoTable = document.getElementById('widget-table');
  var featureProperties = geoJson.features[0].properties;
  var table = '<table class="roundedTable" id=info-table><tbody></tbody></table>';
  if (document.getElementById('info-table')){
    var infoTable = document.getElementById('info-table');
    var r = infoTable.rows.length;
    //delete existing rows
    for (var i=1; i<r;i++){
      //delete last row
      infoTable.deleteRow(-1);
    }
  }
  else{
    var newWidget = setWidget(table,'dashboard','widget-table');
    var infoTable = document.getElementById('info-table');
    var row = infoTable.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = 'AQUIFER INFORMATION';
  }

  var featureProperties = geoJson.features[0].properties;
  var field;
  var data;
  weblink = featureProperties["AQUIFER_DESCRIPTION_RPT_URL"]
  webbutton = '<button onclick = "openWebLink(weblink)">'+"Download Aquifer Report"+'</button>';
  var row = infoTable.insertRow(-1);
  var cell = row.insertCell(0);
  cell.innerHTML = webbutton;
  for(var i=0; i<fieldList.length;i++){
    field = '<strong>'+ fieldList[i].replace("_", " ") + ":</strong>";
    data = featureProperties[fieldList[i]];
    var info = field + "  " + data;
    var row = infoTable.insertRow(-1);
    var cell = row.insertCell(0);
    cell.innerHTML = info;
  }
  //add links to lookup codes
  var row = infoTable.insertRow(-1);
  var cell = row.insertCell(0);
  weblink = "<a href='https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/groundwater-wells/aquifers/aquifer-subtype-code-description' target='_blank' style='font-size:.8em'>Lookup Subtype Codes</a>"
  cell.innerHTML = weblink;
  row = infoTable.insertRow(-1);
  cell = row.insertCell(0);
  weblink = "<a href='https://www2.gov.bc.ca/assets/gov/environment/air-land-water/water/pgown/aquifer-classes.png' target='_blank' style='font-size:0.8em'>Lookup Classification Codes</a>"
  cell.innerHTML = weblink;
  



  console.log('makeInfoWidget');
}
function setDiv(content, parentElementId, widgetId){
  var parentE = document.getElementById(parentElementId);
  var widgetDiv = document.createElement('div');
  //widgetDiv.className += 'widget';
  widgetDiv.id = widgetId;
  widgetDiv.innerHTML = content;
  parentE.appendChild(widgetDiv);
  return widgetDiv
}

function makeWellsInfoWidget(ingeoJson){
  var fieldList = {
    'Total_Wells':"",'Total_Observation_Wells':"",'Wells_Median_Depth_m':"",'Wells_Average_Depth':"",
    'Total_Wells_No_Well_Depth':"", 'Bedrock_Median_Depth':"",'Total_Wells_No_Bedrock_Depth':"",
    'Drilled_Median_Depth':"", 'Drilled_Average_Depth':"",'Total_Wells_No_Drilled_Depth':"",
    'Total_Wells_Yield_Sum':"",'Total_Wells_No_Yield_Value':""};
  function setDefaultVal(value, defaultValue){
     return (value === undefined) ? defaultValue : value;
   }
  var dataArray = json2array(ingeoJson);
  fieldList.Total_Wells = setDefaultVal(gwWells.data.features.length,0);
  fieldList.Total_Observation_Wells = setDefaultVal(obsWells.totalFeatures,0)

  //Just get data from field in array and return numbers in arrary list and nulls that were in data . e.g. [2,5,6,2,13,67]
  outArrayvarswaterdepth = flatArray(dataArray,'WATER_DEPTH')
  flatArraypntswaterdepth = outArrayvarswaterdepth[0]
  //sort flat array sequential
  sortedflatArraypntswaterdepth = Array_Sort_Numbers(flatArraypntswaterdepth)
  var arrayLow = sortedflatArraypntswaterdepth[0]
  var arrayHigh = sortedflatArraypntswaterdepth[((sortedflatArraypnts.length) - 1)]
  var arrayMedian = Quartile_50(sortedflatArraypntswaterdepth);
  fieldList.Wells_Median_Depth_m = arrayMedian
  nullcount = outArrayvarswaterdepth[1]
  fieldList.Total_Wells_No_Well_Depth = nullcount
  fieldList.Wells_Average_Depth = Array_Average(sortedflatArraypntswaterdepth);

  outArrayvarsbedrockrdepth = flatArray(dataArray,'BEDROCK_DEPTH')
  flatArraypntsbedrockrdepth = outArrayvarsbedrockrdepth[0]
  //sort flat array sequential
  sortedflatArraypntsbedrockrdepth = Array_Sort_Numbers(flatArraypntsbedrockrdepth)
  var arrayMedian = Quartile_50(sortedflatArraypntsbedrockrdepth);
  fieldList.Bedrock_Median_Depth = arrayMedian
  nullcount = outArrayvarsbedrockrdepth[1]
  fieldList.Total_Wells_No_Bedrock_Depth = nullcount

  outArrayvarsdrilleddepth = flatArray(dataArray,'DEPTH_WELL_DRILLED')
  flatArraypntsdrilleddepth = outArrayvarsdrilleddepth[0]
  //sort flat array sequential
  sortedflatArraypntsdrilleddepth = Array_Sort_Numbers(flatArraypntsdrilleddepth)
  var arrayMedian = Quartile_50(sortedflatArraypntsdrilleddepth);
  fieldList.Drilled_Median_Depth = arrayMedian
  nullcount = outArrayvarsbedrockrdepth[1]
  fieldList.Total_Wells_No_Drilled_Depth = nullcount
  fieldList.Drilled_Average_Depth = Array_Average(sortedflatArraypntsdrilleddepth);

  outArrayvarsyieldvalue = flatArray(dataArray,'YIELD_VALUE')
  flatArraypntsyieldvalue = outArrayvarsyieldvalue[0]
  //sort flat array sequential
  sortedflatArraypntsyieldvalue = Array_Sort_Numbers(flatArraypntsyieldvalue)
  var arraySum = Array_Sum(sortedflatArraypntsyieldvalue);
  fieldList.Total_Wells_Yield_Sum = arraySum
  arrayCount = countInArray(sortedflatArraypntsyieldvalue,0)
  fieldList.Total_Wells_No_Yield_Value = arrayCount

  //call arraystats.js and return stats from array list

  //var infoTable = document.getElementById('widget-table');
  var table = '<table class="roundedTable" id=info-table-wells><tbody></tbody></table>';
  if (document.getElementById('info-table-wells')){
    var infoTable = document.getElementById('info-table-wells');
    var r = infoTable.rows.length;
    //delete existing rows
    for (var i=1; i<r;i++){
      //delete last row
      infoTable.deleteRow(-1);
    }
  }
  else{
    var newWidget = setWidget(table,'dashboard','widget-table-wells');
    var infoTable = document.getElementById('info-table-wells');
    var row = infoTable.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = 'GROUNDWATER WELL INFORMATION';
  }
  for (var key in fieldList){
    
    var field = '<strong>'+ key.replace(/_/g, " ") + ":</strong>";
    var data = fieldList[key];
    var info = field + "  " + data;
    var row = infoTable.insertRow(-1);
    var cell = row.insertCell(0);
    cell.innerHTML = info;
  }
  document.getElementById("widget-table-wells").classList.add("grid-item--height4");
}

function setDiv(content, parentElementId, widgetId){
  var parentE = document.getElementById(parentElementId);
  var widgetDiv = document.createElement('div');
  //widgetDiv.className += 'widget';
  widgetDiv.id = widgetId;
  widgetDiv.innerHTML = content;
  parentE.appendChild(widgetDiv);
  return widgetDiv
}

function filterEvents(filterValue){
  //this function is fired when the filter box value is changed
  console.log('filterEvent');

  if (filterValue){
    console.log(filterValue);
    var firstChar = filterValue.charAt(0);
    //trigger any filter actions here! --map and --graphing
    //detect aquifer filter
    if ('0123456789'.indexOf(firstChar) !== -1) {
      console.log('aquifer filter:' + filterValue);
      zoomToFeatureByID(filterValue);
      setDashboardFilter(filterValue);
    }
    //detect region filter
    else if (filterValue.indexOf('Natural Resource Region') !== -1) {
      console.log('regional filter:' + filterValue);
      zoomToRegionDistrict(filterValue);
      setFilterDisplay(filterValue);
      //add region-specific function calls here
    }

  }
  else {console.log('no filter value');}
}

var fList = [];

function makeFilterList(wfsJson){
  //var fList = [];
  //convert to array
  var dataArray = json2array(wfsJson);
  //expect field names to be first array
  //Regions
  if (dataArray[0].indexOf('REGION_NAME') !== -1) {
    var dataIndex = dataArray[0].indexOf('REGION_NAME');
  }
  //Aquifers
  else if (dataArray[0].indexOf('AQ_TAG') !== -1) {
    var dataIndex = dataArray[0].indexOf('AQ_TAG');
  }
  else {console.log('no field value found in json');}

  //populate fList with region name or aquifer tag
  for (i=1;i<dataArray.length;i++){
    var val = dataArray[i][dataIndex];
    fList.push(val);
  }

  //test new searchbox
  $('#searchinput').autocomplete({
    source: fList,
    select: function(event, ui) {
        filterEvents(ui.item.value);
        $(this).val(ui.item.value);
    }
  })


  $('#filterbox').autocomplete({
                  source: fList,
                  select: function(event, ui) {
                      filterEvents(ui.item.value);
                      $(this).val(ui.item.value);
                  }
              })

}


function makeSingleInfoWidget(wellLyr){
  var fieldList = {'WELL_TAG':"",'YIELD_VALUE':"",'DEPTH_WELL_DRILLED':"",'WELL_USE_CODE':"",'WELL_LICENCE_GENERAL_STATUS':""};
  function setDefaultVal(value, defaultValue){
     return (value === undefined) ? defaultValue : value;
   }
  fieldList.WELL_TAG = wellLyr.WELL_TAG_NUMBER
  fieldList.YIELD_VALUE = setDefaultVal(wellLyr.YIELD_VALUE,0)
  fieldList.DEPTH_WELL_DRILLED = setDefaultVal(wellLyr.DEPTH_WELL_DRILLED,0)
  fieldList.WELL_USE_CODE = wellLyr.WELL_USE_CODE
  fieldList.WELL_LICENCE_GENERAL_STATUS = wellLyr.WELL_LICENCE_GENERAL_STATUS

  //var infoTable = document.getElementById('widget-table');
  var table = '<table class="roundedTable" id=info-table-well><tbody></tbody></table>';
  if (document.getElementById('info-table-well')){
    var infoTable = document.getElementById('info-table-well');
    var r = infoTable.rows.length;
    //delete existing rows
    for (var i=1; i<r;i++){
      //delete last row
      infoTable.deleteRow(-1);
    }
  }
  else{
    var newWidget = setWidget(table,'dashboard','widget-table-well');
    var infoTable = document.getElementById('info-table-well');
    var row = infoTable.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = 'SELECTED WELL INFORMATION';
    weblinkwell = wellLyr.WELL_DETAIL_URL
    webbutton = '<button onclick = "openWebLink(weblinkwell)">'+"Link to Groundwater Well Information"+'</button>';
    var row = infoTable.insertRow(-1);
    var cell = row.insertCell(0);
    cell.innerHTML = webbutton;
  }
  for (var key in fieldList){
    if (Object.keys(fieldList).indexOf(key)>8){
      $('#widget-table-well').css('height',"600px");
    }
    var field = '<strong>'+ key.replace(/_/g, " ") + ":</strong>";
    var data = fieldList[key];
    var info = field + "  " + data;
    var row = infoTable.insertRow(-1);
    var cell = row.insertCell(0);
    cell.innerHTML = info;
  }
}

function addObservationwellGraph(){

}