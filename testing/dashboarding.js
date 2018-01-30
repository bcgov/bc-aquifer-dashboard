function setWidget(content, parentElementId, widgetId){
  var parentE = document.getElementById(parentElementId);
  var widgetDiv = document.createElement('div');
  widgetDiv.className += 'widget';
  widgetDiv.id = widgetId;
  widgetDiv.innerHTML = content;
  parentE.appendChild(widgetDiv);
  return widgetDiv
}
function setFilterDisplay(filterText){
  $('#filter').text('Filter: ' + filterText);
}

function setAquiferFilter(tag){
  //var tag = '0255'
  setFilterDisplay('AQ_TAG:'+ tag);
  getWellsByAquiferByTag(tag);
}

function makeAquiferInfoWidget(geoJson){


  var fieldList = ['AQNAME','AQ_TAG','AQUIFER_CLASSIFICATION','DEMAND','VULNERABILITY', 'AQUIFER_MATERIALS'];
  var tag = geoJson.features[0].properties.AQ_TAG;
  var infoTable = document.getElementById('widget-table');
  if ('widget-table'){
    $('#widget-table').remove()
  }
  var table = '<table class="roundedTable" id=well-table><tbody></tbody></table>';
  var newWidget = setWidget(table,'dashboard','widget-table');
  var infoTable = document.getElementById('well-table');

  var featureProperties = geoJson.features[0].properties;
  var row = infoTable.insertRow(0);
  var cell = row.insertCell(0);
  cell.innerHTML = 'AQUIFER INFORMATION';

  var field;
  var data;
  for(var i=0; i<fieldList.length;i++){
    field = '<strong>'+ fieldList[i].replace("_", " ") + ":</strong>";
    data = featureProperties[fieldList[i]];
    info = field + "  " + data;
    row = infoTable.insertRow(-1);
    cell = row.insertCell(0);
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
