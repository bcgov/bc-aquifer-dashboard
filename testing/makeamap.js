
//set variables

var aquifer = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json&propertyname=AQ_TAG,AREA,PRODUCTIVITY,VULNERABILITY,DEMAND,DESCRIPTIVE_LOCATION";
var aquiferWMS = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json&propertyname=AQ_TAG,AREA,PRODUCTIVITY,VULNERABILITY,DEMAND,DESCRIPTIVE_LOCATION";
var wells = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&SRSNAME=epsg:4326&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL&propertyname=WELL_ID,LONGITUDE,LATITUDE";
var wellsCallback = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER%20IS%20NOT%20NULL&format_options=callback:processJSON";
var URL_AQ = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?"
var wellfilter = "CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL";
var options = {};
var aquiferGEOJSON;
var wellGEOJSON;
var summaryData = [];
var selection; //variable boolean for selection

var jsonLayer;
var lyrWellsAjax;

var wmsAQLayer;
var wmsWellsLAyer;
var wmsDistLayer;
var wmsPrecLayer;
var wmsBCBASELayer;
//local json layers
var lyrLocalAQ;
var lyrLocalPrec;
var lyrLocalDist;
var lyrWellsInAquifer;
var lyrWellsInAquiferGroup;

var lyrStreetsMap;
var lyrImageMap;
var lyrTopoMap;
var lyrSearch;

var map;
var mapControl;
var ctlAttribute;
var ctlZoomer;
var ctlScale;

var baseLayers;
var overlays;


//basic map
//set map size
$(document).ready(function(){
  map = L.map('map').setView([50.6, -120.3], 10);

  //add base maps
  lyrImageMap = L.tileLayer.provider('Esri.WorldImagery')
  lyrTopoMap = L.tileLayer.provider('OpenTopoMap');
  lyrStreetsMap = L.tileLayer.provider('OpenStreetMap');
  map.addLayer(lyrTopoMap); //start with default base map


  var URL_BCBASE = "http://maps.gov.bc.ca/arcserver/services/Province/web_mercator_cache/MapServer/WMSServer"
  wmsBCBASELayer = L.tileLayer.wms(URL_BCBASE,{
    format:'image/png',
    layers: '0',
    transparent: 'false'
  });

  var URL_DIST = "https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_DIST_AREA_SVW/ows?"
  wmsDistLayer = L.tileLayer.wms(URL_DIST,{
    service: 'wms',
    format:'image/png',
    version:'1.1.1',
    layers: 'pub:WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_DIST_AREA_SVW',
    transparent: 'true',
    feature_count: 200
  });

  var URL_PREC = "https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_PREC_AREA_SVW/ows?"
  wmsPrecLayer = L.tileLayer.wms(URL_PREC,{
    service: 'wms',
    format:'image/png',
    version:'1.1.1',
    layers: 'pub:WHSE_ADMIN_BOUNDARIES.LWADM_WATMGMT_PREC_AREA_SVW',
    transparent: 'true',
    feature_count: 200
  });

  var URL_Wells = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?"
  wmsWellsLayer = L.tileLayer.wms(URL_Wells,{
    service: 'wms',
    format:'image/png',
    version:'1.1.1',
    layers: 'pub:WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
    transparent: 'true',
    feature_count: 20000
  }).addTo(map);

  //add local district data and layer
  lyrLocalPrec = L.geoJSON.ajax('assets/precinct.json', {style:{color:'black', weight:3, opacity:0.5, fillOpacity:0},onEachFeature:processPrecincts}).addTo(map);
    lyrLocalPrec.on('data:loaded', function(){
        console.log("local precinct loaded")
    });

  //add local district data and layer
  lyrLocalDist = L.geoJSON.ajax('assets/district.json', {style:{color:'rgb(9, 7, 129)', weight:6, opacity:0.5,fillOpacity:0},onEachFeature:processDistricts}).addTo(map);
  lyrLocalDist.on('data:loaded', function(){
      console.log("local precinct loaded")
  });


  //add local geojson aquifer data
  lyrLocalAQ = L.geoJSON.ajax('assets/aquifer_simple.json', {style:styleAquifers,onEachFeature:processAquifers}).addTo(map);
    lyrLocalAQ.on('data:loaded', function(){
        console.log("local aquifers loaded")
    });

  //setup map Layer control
  //base maps
  baseLayers = {
    "Topo Map": lyrTopoMap,
    "Street Map": lyrStreetsMap,
    "BC Base" : wmsBCBASELayer,
    "Imagery": lyrImageMap
  };
  //WMS layers
  overlays = {
    //"Wells": lyrWellsInAquifer,
    "Aquifers": lyrLocalAQ,
    "Precincts": lyrLocalPrec,
    "Districts": lyrLocalDist
    //"Wells WFS" : lyrWellsAjax
  };
  mapControl = new L.control.layers(baseLayers,overlays);
  mapControl.addTo(map);

  //turn off some layers at start
  map.removeLayer(lyrLocalDist);
  map.removeLayer(lyrLocalPrec);

  //add scale bar and cursor controls to map
  ctlScale = L.control.scale({position:'bottomleft', metric:true, maxWidth:150}).addTo(map);
  ctlMouseposition = L.control.mousePosition().addTo(map);


  //add legend
  ctlLegend = new L.Control.Legend({
    position:'topright',
    controlButton:{title:"Legend"}
  }).addTo(map);
  //add the legend div from index.html to the leaflet legend popup div
  //uses font-awsome css icon
  $(".legend-container").append($("#legend"));
  $(".legend-toggle").append($("<i class='legend-toggle-icon fa fa-server ' style='color:#000'></i>"));

  }); // end document ready function

//functions for local layers

//function Precinct foreachfeature
function processPrecincts(json,lyr) {
  var att = json.properties;
  lyr.bindTooltip("<h5>Precinct Name: "+att.PRECINCT_NAME+"<br>Precinct ID: "+att.PRECINCT_ID +"<br>District Name: "+att.DISTRICT_NAME +"</h5>");
  //properties":{"PRECINCT_NAME":"Victoria","PRECINCT_ID":179,"DISTRICT_NAME":"Victoria"}}
}

//function District foreachfeature
function processDistricts(json,lyr) {
  var att = json.properties;
  lyr.bindTooltip("<h5>District Name: "+ att.DISTRICT_NAME+"<br>District ID: "+ att.DISTRICT_ID+"</h5>");
  //properties":{"PRECINCT_NAME":"Victoria","PRECINCT_ID":179,"DISTRICT_NAME":"Victoria"}}
}

//function Aquifer foreachfeature
function processAquifers(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip("<h5>Aquifer Tag: "+ att.AQUIFER_NUMBER+"<br>Type: "+att.TYPE_OF_WATER_USE + "<br>Size: "+att.SIZE_KM2 + " km2</h5>");
  //could create list of AQ IDs here
  //arAquiferIDs.push(att.AQUIFER_NUMBER.toString());
  lyr.on('click', function(e){
    console.log("layer on click " + json.properties.AQUIFER_NUMBER);
    //check for multiple features clicked and allow user to select one
    
    console.log(e.latlng.toString())
    
    
    //jsonFeatures = json
  
    //console.log(lyrLocalAQ.toGeoJSON());
    //console.log(aquiferGEOJSON);
    //var polygons = turf.featureCollection([json]);
    //var allpolygons = turf.featureCollection([lyrLocalAQ.toGeoJSON()]);
    //var allPolygons = aquiferJson;
    //get a geojson feature of the current map bounds
    //mapExtentPolygon = createPolygonFromBounds(map.getBounds()).toGeoJSON()
    //console.log("map extent polygon");
    //console.log(mapExtentPolygon);
    //create a json feature collection from the map extent to use in turf
    //f = turf.geometry(mapExtentPolygon)
    //fc = turf.feature(mapExtentPolygon)
    //mapFC = turf.featureCollection([fc]);
    //console.log("mapFC");
    //console.log(mapFC);
    //inViewPolygons= clipFeaturecollection(allpolygons, mapFC);
    //onsole.log("inview");
    //console.log(inViewPolygons);
    //var points = turf.featureCollection([pt1]);
    //fldName = 'AQ_TAG';
    //var tagged = turf.tag(points, allPolygons, 'AQ_TAG','AQ_TAGS');
    //console.log("tagged")
    //console.log(tagged);

    //call a new WMS get feature info request
    /* console.log('make polygons')
    bbox = e.latlng.lng,e.latlng.lat
    params = {
      service: 'wms',
      request: 'getFeatureInfo',
      bbox: bbox,
      format:'application/json',
      version:'1.1.1',
      layers: 'pub:WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
      transparent: 'true',
      feature_count: 200
     }
    //URL_WMS = L.Util.getParamString(params, URL_AQ )
    URL_WMS = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?&service=wms&request=getFeatureInfo&bbox=-120.32432556152345,50.61985,format=json&version=1.1.1&layers=pub%3AWHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&transparent=true&feature_count=200"

    wmsAQLayer = L.tileLayer.wms(URL_AQ,{
         service: 'wms',
         request: 'getFeatureInfo',
         bbox: bbox,
         format:'application/json',
         version:'1.1.1',
         layers: 'pub:WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
         transparent: 'true',
         feature_count: 200
     }).addTo(map);
    
     //featcount = wmsAQLayer.getLayers().length();
     //console.log(featcount);
     d3.json(URL_WMS,function(data){
      var totalFeatures = data.features.length;
      if (totalFeatures > 1){
        console.log('total features: ' + totalFeatures);
      }
      var tag = data.features[0].properties.AQ_TAG;
      }); */

    lyrLocalAQOnClicked(e,json.properties.AQUIFER_NUMBER);
    });
  };

  //create a polygon from latlng bounds
  function createPolygonFromBounds(latLngBounds) {
    var center = latLngBounds.getCenter()
      latlngs = [];
  
    latlngs.push(latLngBounds.getSouthWest());//bottom left
    latlngs.push({ lat: latLngBounds.getSouth(), lng: center.lng });//bottom center
    latlngs.push(latLngBounds.getSouthEast());//bottom right
    latlngs.push({ lat: center.lat, lng: latLngBounds.getEast() });// center right
    latlngs.push(latLngBounds.getNorthEast());//top right
    latlngs.push({ lat: latLngBounds.getNorth(), lng: map.getCenter().lng });//top center
    latlngs.push(latLngBounds.getNorthWest());//top left
    latlngs.push({ lat: map.getCenter().lat, lng: latLngBounds.getWest() });//center left
  
    return new L.polygon(latlngs);
  }

function clipFeaturecollection(fc1,fc2){
  //  Load the two fcs
  f1 = fc1.features[0]
  f2 = fc2.features
  //Once the features are loaded, iterate over them.
  conflictlist = [];
  for (var i = 0; i < f1.length; i++) {
    var parcel1 = f1[i];
    for (var j = 0; j < f2.length; j++) {
      var parcel2 = f2[j];
      console.log("Processing", i, j);
      var conflict = turf.intersect(parcel1, parcel2);
      if (conflict != null) {
        conflictlist.push(conflict);
      }
    }
  }
  //Create FeatureCollections from intersect results with valid geometries:
  var intersectiontest = turf.featureCollection(conflictlist);
  return intersectiontest
}
//function to zoom to feature when search box event fires or button event
function zoomToFeatureByID(aqtag){
  var val = aqtag;
  var lyr = returnLayerByAttribute(lyrLocalAQ,'AQUIFER_NUMBER',val);
  if (lyr) {
      if (lyrSearch) {
          lyrSearch.remove();
      }
      lyrSearch = L.geoJSON(lyr.toGeoJSON(), {style:{color:'blue', weight:10, opacity:0.5}}).addTo(map);
      map.fitBounds(lyr.getBounds().pad(0.1));
  } else {
      //let the user know the feature was not found somehow.
      console.log("**** Project ID not found ****");
  }
};

//function to get a specific layer/feature from a group layer
//with a specific attribute/value combination
function returnLayerByAttribute(lyr,att,val) {
  var arLayers = lyr.getLayers();
  for (i=0;i<arLayers.length-1;i++) {
      var ftrVal = arLayers[i].feature.properties[att];
      if (ftrVal==val) {
          return arLayers[i];
          console.log("tags searched:" + ftrVal.toString())
      }
  }
  return false;
}

function lyrLocalAQOnClicked(e,ID){
    zoomToFeatureByID(ID);
    setDashboardFilter(ID);
    //console.log("layer on click in function" + ID)
  };

function styleAquifers(json) {
    var att = json.properties;
    switch (att.VULNERABILITY) {
        case 'High':
            return {color:'red'};
            break;
        case 'Moderate':
            return {color: '#FFC300' };
            break;
        case 'Low':
            return {color:'green'};
            break;
    }
}

//set well points style and popup
function returnWellsMarker(json, latlng){
  //lyrWellsInAquifer.addLayer(L.marker(latlng));
  //return L.marker(latlng)
  var att = json.properties;
  var markerOptions = {radius:200, color:'cyan', fillColor:'cyan', fillOpacity:0.5};
  return L.circle(latlng, markerOptions).bindPopup("<h6>Well Tag: "+ att.WELL_TAG_NUMBER);
}

//add the wells inside an aquifer, called from make a graph doStuffWithWells()
function addWellsToMap() {
  if (gwWells.data) {
    //create a cluster group
    lyrWellsInAquiferGroup = L.markerClusterGroup();
    lyrWellsInAquiferGroup.clearLayers();
    //lyrWellsInAquifer = L.geoJSON.ajax(gwWells.data, {pointToLayer: returnWellsMarker});
    lyrWellsInAquifer = L.geoJSON(gwWells.data);
    //add all the markers to the layer
     var arWells = lyrWellsInAquifer.getLayers();
     for ( var i = 0; i < arWells.length; ++i ){
       var ftrWell = arWells[i].feature
       var popup = "<h6>Well Tag: "+ ftrWell.properties.WELL_TAG_NUMBER;
 
       //var m = L.marker( [arWells[i].lat, arWells[i].lng]).bindPopup( popup );
       var m = L.marker([arWells[i].feature.geometry.coordinates[1],arWells[i].feature.geometry.coordinates[0]]).bindPopup( popup );
       console.log("adding well marker for: " + popup);
       lyrWellsInAquiferGroup.addLayer( m );
     }
    
    lyrWellsInAquiferGroup.clearLayers();
    //lyrWellsInAquiferGroup.addLayer(lyrWellsInAquifer);
    lyrWellsInAquiferGroup.addTo(map);
    console.log("wells added !!!")
    } else {
    //let the user know the feature was not found somehow.
    console.log("**** Wells Data not found ****");
    };




}; // end of script

//dont think the stuff below here is doing anything right now

// L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
//   onAdd: function (map) {
//     // Triggered when the layer is added to a map.
//     //   Register a click listener, then do all the upstream WMS things
//     L.TileLayer.WMS.prototype.onAdd.call(this, map);
//     map.on('click', this.getFeatureInfo, this);
//   },

//   onRemove: function (map) {
//     // Triggered when the layer is removed from a map.
//     //   Unregister a click listener, then do all the upstream WMS things
//     L.TileLayer.WMS.prototype.onRemove.call(this, map);
//     map.off('click', this.getFeatureInfo, this);
//   },

//   getFeatureInfo: function (e) {
//     // Make an equest to the server and hope for the best
//     var url = this.getFeatureInfoUrl(e.latlng);
//     d3.json(url,function(data){
//       var totalFeatures = data.features.length;
//       if (totalFeatures > 1){
//         console.log('total features: ' + totalFeatures);
//       }
//       var tag = data.features[0].properties.AQ_TAG;
//     });
//   },

//   getFeatureInfoUrl: function (latlng) {
//     // Construct a GetFeatureInfo request URL given a point
//     var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
//         size = this._map.getSize(),

//         params = {
//           request: 'GetFeatureInfo',
//           service: 'WMS',
//           srs: 'EPSG:4326',
//           styles: this.wmsParams.styles,
//           transparent: this.wmsParams.transparent,
//           version: this.wmsParams.version,
//           format: this.wmsParams.format,
//           bbox: this._map.getBounds().toBBoxString(),
//           height: size.y,
//           width: size.x,
//           layers: this.wmsParams.layers,
//           query_layers: this.wmsParams.layers,
//           feature_count: this.wmsParams.feature_count,
//           info_format: 'application/json'
//         };

//     params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
//     params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

//     return this._url + L.Util.getParamString(params, this._url, true);
//   },

//   showGetFeatureInfo: function (err, latlng, content) {
//     if (err) { console.log(err); return; } // do nothing if there's an error

//     // Otherwise show the content in a popup, or something.
//     //setFilter(content);
//     // L.popup({ maxWidth: 800})
//     //   .setLatLng(latlng)
//     //   .setContent(content)
//     //   .openOn(this._map);
//   }
// });

// L.tileLayer.betterWms = function (URL_AQ, options) {
//   return new L.TileLayer.BetterWMS(URL_AQ, options);
// };