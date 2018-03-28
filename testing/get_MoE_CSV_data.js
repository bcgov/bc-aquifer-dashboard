//MoE Observation Well Data Constants:
var moeObsWellDataURL = 'http://www.env.gov.bc.ca/wsd/data_searches/obswell/map/data';
var moeCsvData = {};

//DataBc datastore resource_id items:
var resourceIDs = {
    'GWL_monthly_csv': 'c8c3c750-bf4d-4213-be58-42c6f42510e8', //circa 2014
    'GW_Well_Attributes_csv': 'a8933793-eadb-4a9c-992c-da4f6ac8ca51', //circa 2014
    //not in databc's datastore:
    'ObservationWellDataAll_DailyMean_csv': 'ObservationWellDataAll_DailyMean.csv', //'caa18e44-c1a3-490f-a467-f2352bd8d382' not in datastore
    'ObservationWellDataPast1years_Hourly_csv': 'ObservationWellDataPast1years_Hourly.csv' //'a77e0aea-1216-470a-a00f-1f75e3c8432a' not in datastore
};

function getObsWellCsv(resourceItem, callback) {
    var defaultParameters = {
        //url: moeObsWellDataURL,
        resource_id: resourceItem
    }

    //var parameters = L.Util.extend(defaultParameters);
    //console.log(parameters);
    var URL = moeObsWellDataURL + "/" + resourceItem;
    console.log(URL);

    var request = $.ajax({
        url: URL,
        dataType: 'jsonp',
        //jsonpCallback: wfsCallback,
        success: function(response) {
          console.log('executed moe CSV request');
          //map.spin(false);
        }
      });
};

//CSV callback function run when JSON is returned by loadCsv
//https://github.com/maxogden/art-of-node#callbacks
var moeCsvCallback = function (response){
    console.log('MoE CSV callback function');
    moeCsvData = response.result.records;
    console.log(moeCsvData);
};

//load MoE CSV from MoE Data site
//'ObservationWellDataAll_DailyMean.csv' or 'ObservationWellDataPast1years_Hourly.csv'
//getObsWellCsv(resourceIDs['ObservationWellDataAll_DailyMean_csv'], moeCsvCallback);
