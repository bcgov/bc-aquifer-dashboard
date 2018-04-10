//DataBC datastore CSV Constants:
var datastoreURL = 'https://catalogue.data.gov.bc.ca/api/action/datastore_search';
var csvData = {};
var queryFilter = null; //'2014'; //'Observation Well #185';

//DataBc datastore resource_id items:
var resourceIDs = {
    'GWL_monthly_csv': 'c8c3c750-bf4d-4213-be58-42c6f42510e8', //circa 2014
    'GW_Well_Attributes_csv': 'a8933793-eadb-4a9c-992c-da4f6ac8ca51', //circa 2014
    //not in databc's datastore:
    'ObservationWellDataAll_DailyMean_csv': 'ObservationWellDataAll_DailyMean.csv', //'caa18e44-c1a3-490f-a467-f2352bd8d382' not in datastore
    'ObservationWellDataPast1years_Hourly_csv': 'ObservationWellDataPast1years_Hourly.csv' //'a77e0aea-1216-470a-a00f-1f75e3c8432a' not in datastore
};

//load CSV function
function loadCsv(resourceItem, callback, queryFilter) {
    //load csv by resouce_id from data catalogue-datastore api
    var data = {
        resource_id: resourceItem, // the resource id from databc datastore
        limit: 1000, // get max n results
        q: queryFilter//query
        };
    return request = $.ajax({
        url: datastoreURL,
        data: data,
        dataType: 'json',
        success: function(response) {
            //console.log(response);
            return callback(response);
        },
        error: function(response) {
            console.log(response.responseJSON.error);
        }
    });
};

//CSV callback function run when JSON is returned by loadCsv
//https://github.com/maxogden/art-of-node#callbacks
var csvCallback = function (response){
    console.log('CSV callback function');
    csvData = response.result.records;
    console.log(csvData);
};

//load CSV from databc datastore via resource_id
//loadCsv(resourceIDs['GW_Well_Attributes_csv'], csvCallback);
//loadCsv(resourceIDs['GWL_monthly_csv'], csvCallback, 175);