
//set variables

var aquifer = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&SRSNAME=epsg:4326&outputFormat=json&propertyname=AQ_TAG,AREA,PRODUCTIVITY,VULNERABILITY,DEMAND,DESCRIPTIVE_LOCATION";
var wells = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&SRSNAME=epsg:4326&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER IS NOT NULL&propertyname=WELL_ID,LONGITUDE,LATITUDE";
var wellsCallback = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW/ows?service=WFS&request=GetFeature&typeName=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&CQL_FILTER=OBSERVATION_WELL_NUMBER%20IS%20NOT%20NULL&format_options=callback:processJSON";
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
var lyrLocalAQ;

var lyrStreetsMap;
var lyrImageMap;
var lyrTopoMap;

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

  //lyrWellsAjax = L.geoJSON.ajax(wellsCallback.geoJSON());
  //lyrWellsAjax.on('data:loaded', function(){
  //  console.log("layers loaded by Ajax method")
  //  console.log("well count: " + lyrWellsAjax.geoJSONcount.toString)
    //map.fitBounds(lyrWellsAjax.getBounds());
  //});

  var URL_AQ = "https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?"
  wmsAQLayer = L.tileLayer.wms(URL_AQ,{
      service: 'wms',
      format:'image/png',
      version:'1.1.1',
      layers: 'pub:WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
      transparent: 'true',
      feature_count: 200
  }).addTo(map);

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
    feature_count: 200
  }).addTo(map);

  //add local geojson aquifer data
  lyrLocalAQ = L.geoJSON.ajax('.assets/aquifer_simple.geojson', {onEachFeature:processAquiferss}).addTo(mymap);
    lyrLocalAQ.on('data:loaded', function(){
        console.log("local quifers loaded")
    });
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
    "Districts": wmsDistLayer,
    "Precincts": wmsPrecLayer,
    //"Aquifers": wmsAQLayer,
    "Aquifers": lyrLocalAQ,
    "Wells": wmsWellsLayer
    //"Wells WFS" : lyrWellsAjax
  };
  mapControl = new L.control.layers(baseLayers,overlays);
  mapControl.addTo(map);
  //add scale bar and cursor controls to map
  ctlScale = L.control.scale({position:'bottomleft', metric:true, maxWidth:150}).addTo(map);
  ctlMouseposition = L.control.mousePosition().addTo(map);

}); // end document ready function

//functions for local layers
//function Aquifer foreachfeature
function processAquifers(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip("<h4>Aquifer ID: "+att.AQUIFER_NUMBER+"</h4>Type: "+att.TYPE_OF_WATER_USE);
  //could create list of AQ IDs here
  //arAquiferIDs.push(att.AQUIFER_NUMBER.toString());
}

L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },

  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },

  getFeatureInfo: function (evt) {
    // Make an equest to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng);
    d3.json(url,function(data){
      var totalFeatures = data.features.length;
      if (totalFeatures > 1){
        console.log('total features: ' + totalFeatures);
      }
      var tag = data.features[0].properties.AQ_TAG;
      setAquiferFilter(tag);

    });
  },

  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),

        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          feature_count: this.wmsParams.feature_count,
          info_format: 'application/json'
        };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return this._url + L.Util.getParamString(params, this._url, true);
  },

  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); return; } // do nothing if there's an error

    // Otherwise show the content in a popup, or something.
    setFilter(content);
    // L.popup({ maxWidth: 800})
    //   .setLatLng(latlng)
    //   .setContent(content)
    //   .openOn(this._map);
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);
};


function makeWellMap(geoJSONlist){
  //basic map
  //set map size
  if (document.getElementById('mapcontainer')){
    $('#mapcontainer').empty()
    var parentElement = document.getElementById('mapcontainer');
    var mapdiv = document.createElement('div');
    mapdiv.id = 'well-map';
    var h = parentElement.offsetHeight;
    mapdiv.style.height = h.toString() + "px";
    mapdiv.style.width = h.toString() + "px";
    parentElement.appendChild(mapdiv);
  }
  else{
    var newWidget = setWidget('','dashboard', 'mapcontainer');
    newWidget.style.height = "420px";
    newWidget.style.width = "420px";
    var parentElement = document.getElementById('mapcontainer');
    var mapdiv = document.createElement('div');
    mapdiv.id = 'well-map';
    var h = parentElement.offsetHeight;
    mapdiv.style.height = h.toString() + "px";
    mapdiv.style.width = h.toString() + "px";
    parentElement.appendChild(mapdiv);
  }

  var cntr = turf.centroid(geoJSONlist[0]);


  var map = L.map('well-map').setView([cntr.geometry.coordinates[1], cntr.geometry.coordinates[0]], 12);
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
