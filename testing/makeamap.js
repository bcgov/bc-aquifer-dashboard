
//set variables
var wmsAQLayer;
var wmsWellsLAyer;
var wmsDistLayer;
var wmsPrecLayer;
var wmsBCBASELayer;

var lyrStreetsMap;
var lyrImageMap;
var lyrTopoMap;

var mapControl;
var ctlZoomer;
var ctlSearch;

var baseLayers;
var overlays;


//basic map
//set map size
$( document).ready(function(){
  var map = L.map('map').setView([55, -124], 5);
  // var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; ' + mapLink + ' Contributors',
  //   maxZoom: 18,
  // }).addTo(map);

  L.tileLayer.wms('http://maps.gov.bc.ca/arcserver/services/province/web_mercator_cache/MapServer/WMSServer', {
   layers: '0',
   format: 'image/png',
   transparent: true,
         attribution: 'Province of BC',
         maxZoom: 18,
  }).addTo(map);
  //LAYERS=pub%3AWHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW&TRANSPARENT=TRUE&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fpng&SRS=EPSG%3A3857', {
  var wmsLayer = L.tileLayer.betterWms('https://openmaps.gov.bc.ca/geo/pub/WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW/ows?',{
      service: 'wms',
      format:'image/png',
      version:'1.1.1',
      layers: 'pub:WHSE_WATER_MANAGEMENT.GW_AQUIFERS_CLASSIFICATION_SVW',
      transparent: 'true',
      feature_count: 20
  }).addTo(map);



});

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
