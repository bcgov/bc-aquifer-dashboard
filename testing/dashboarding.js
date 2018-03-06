function setWidget(content, parentElementId, widgetId){
  //if widget exists return it
  if (document.getElementById(widgetId)){
    var widgetDiv = document.getElementById(widgetId);
    widgetDiv.innerHTML = '';
  }
  else {
    var parentE = document.getElementById(parentElementId);
    var widgetDiv = document.createElement('div');
    widgetDiv.className += 'widget';
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
    document.getElementById('filter-text').innerHTML = 'Aquifer TAG: ' + filterText;}
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

function makeAquiferInfoWidget(geoJson){
  //list of fields to add to info table
  var fieldList = ['AQNAME','AQ_TAG','AQUIFER_CLASSIFICATION','DEMAND','VULNERABILITY', 'AQUIFER_MATERIALS'];
  var tag = geoJson.features[0].properties.AQ_TAG;
  //var infoTable = document.getElementById('widget-table');
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
  for(var i=0; i<fieldList.length;i++){
    field = '<strong>'+ fieldList[i].replace("_", " ") + ":</strong>";
    data = featureProperties[fieldList[i]];
    var info = field + "  " + data;
    var row = infoTable.insertRow(-1);
    var cell = row.insertCell(0);
    cell.innerHTML = info;
  }
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
  var fieldList = {TotalWells:"",TotalObservationWells:"",TotalWellsNoDepth:"", WellsMedianDepth:""};
  var totalwellfeatures = gwWells.data.totalFeatures
  fieldList.TotalWells= totalwellfeatures
  var observationwellfeatures = obswells.data.totalFeatures
  fieldList.TotalObservationWells= observationwellfeatures
  //convert selected pointds to array
  var dataArray = json2array(ingeoJson);
  //Just get data from filed in array and return numbers in arrary list and nulls that were in data . e.g. [2,5,6,2,13,67]
  outArrayvars = flatArray(dataArray,'WATER_DEPTH')
  //sets returns from flatArray
  flatArraypnts = outArrayvars[0]
  //sort flat array sequential
  sortedflatArraypnts = Array_Sort_Numbers(flatArraypnts)
  //call arraystats.js and return stats from array list
  var arrayLow = sortedflatArraypnts[0]
  var arrayHigh = sortedflatArraypnts[((sortedflatArraypnts.length) - 1)]
  var arrayMedian = Quartile_50(sortedflatArraypnts);
  fieldList.WellsMedianDepth= arrayMedian
  nullcount = outArrayvars[1]
  fieldList.TotalWellsNoDepth= nullcount

  //var infoTable = document.getElementById('widget-table');
  var table = '<table class="roundedTable" id=info-table-wells><tbody></tbody></table>';
  var newWidget = setWidget(table,'dashboard','widget-table-wells');
  var infoTable = document.getElementById('info-table-wells');
  var row = infoTable.insertRow(0);
  var cell = row.insertCell(0);
  cell.innerHTML = 'WELLS INFORMATION';
  for(var i=0; i<fieldList.length;i++){
    var field = '<strong>'+ "We" + ":</strong>";
    var data = arrayHigh;
    var info = field + "  " + data;
    var row = infoTable.insertRow(-1);
    var cell = row.insertCell(0);
    cell.innerHTML = info;
  }
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

function filterEvents(filterValue){
  //this function is fired when the filter box value is changed
  console.log('filterEvent');

  if (filterValue){
    console.log(filterValue);
    var firstChar = filterValue.charAt(0);
    //trigger any filter actions here! --map and --graphing
    if ('0123456789'.indexOf(firstChar) !== -1) {
      //detect aquifer filter
      console.log('aquifer filter:' + filterValue);
      zoomToFeatureByID(filterValue);
      setDashboardFilter(filterValue);
    }
    //detect region filter
    else if (filterValue.indexOf('Region') !== -1) {
      console.log('regional filter:' + filterValue);
    }

  }
  else {console.log('no filter value');}

}
function makeFilterList(){
  var fList = [];
  //convert to array
  var aquiferData = json2array(aquiferJson);
  var regionData = json2array(regionsJson);

  //array of region names
  var rIndex = regionData[0].indexOf('REGION_NAME');
  //create an array of fieldname values
  var fIndex = aquiferData[0].indexOf('AQ_TAG');
  //expect field names to be first array
  for (i=1;i<regionData.length;i++){
    var val = regionData[i][rIndex];
    fList.push(val);
  }

  for (i=1;i<aquiferData.length;i++){
    var val = aquiferData[i][fIndex];
    fList.push(val);
  }

  $('#filterbox').autocomplete({
                  source: fList,
                  select: function(event, ui) {
                      filterEvents(ui.item.value);
                      $(this).val(ui.item.value);
                  }
              })

}
