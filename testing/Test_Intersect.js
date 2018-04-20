//fetch WFS (json) from openmaps geoserver
//http://docs.geotools.org/latest/userguide/library/cql/ecql.html
function getWFSjsonIntersect(wfsURL, wfsTypeName, wfsProperties, wfsCallback, wfsCQLfilter,
    wfsClippingPolyCoords="-114.049061 48.581803, -119.203918 48.773596, -119.184165 52.247617, -116.548170 52.06121,-114.049061 48.581803",
    wfsGeometryProperty='GEOMETRY') {
    //wfsBbox= '35043.6538, 440006.8768, 1885895.3117, 1735643.8497' //BC Albers
    //cql Filter text attributes must use single quotes (%27), not double quotes (%22),
    //eg: cql_filter="FEATURE_CODE='FM90000010'""
    //Get WGS Coordinates from parameters
    //var bboxBCalb = reProjectWGStoBCalbers(wfsBbox);
    //console.log(bboxBCalb);
    
    var defaultParameters = {
      service: 'WFS',
      version: '2.0',
      request: 'GetFeature',
      typeName: wfsTypeName,
      outputFormat: 'text/javascript', //or application/json (but won't work w/ ajax dataType=jsonp )
      format_options: 'callback:' + wfsCallback,
      SrsName: 'EPSG:4326',
      propertyName: wfsProperties,
      //bbox: '-120.65062584,50.6512122,-120.53745904,50.72483285,epsg:4326' //testing
      //bbox: wfsBbox
      //cql_filter: "bbox(GEOMETRY," + bboxBCalb + ") AND " + cqlFilter
      //DISJOINT(the_geom, setSRS(POLYGON((-90 40, -90 45, -60 45, -60 40, -90 40)), 'EPSG:4326'))
      cql_filter: "CONTAINS(" + wfsGeometryProperty + ", POLYGON('EPSG:4326'(" + wfsClippingPolyCoords + "))) AND " + wfsCQLfilter
    };
  
    var parameters = L.Util.extend(defaultParameters);
    var URL = wfsURL + L.Util.getParamString(parameters);
  
    //map.spin(true);
    //ajax (asynchronous HTTP) request https://www.sitepoint.com/ajaxjquery-getjson-simple-example/
    var ajax = $.ajax({
      url: URL,
      dataType: 'jsonp',
      jsonpCallback: wfsCallback,
      success: function(response) {
        console.log('executed wfs request');
        //map.spin(false);
      }
    });
  }

  //getWFSjsonIntersect(window.aquiferURL, window.aquiferTypeName, window.aquiferClippedProperties, 
    //aquiferClippedCallback, window.aquiferCQLfilter);