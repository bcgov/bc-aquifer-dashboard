var item = 'c8c3c750-bf4d-4213-be58-42c6f42510e8';
var csvData = {};

function loadCsv(item, callback) {
    //load csv item from data catalogue-datastore api
    var data = {
        resource_id: item, // the resource id
        limit: 100000, // get 5 results
        q: '2006' //query
        };
    return request = $.ajax({
        url: 'https://catalogue.data.gov.bc.ca/api/action/datastore_search',
        data: data,
        dataType: 'json',
        success: function(response) {
            console.log(response.result.records);
            return callback(null,response.result.records);
        }
    });
}

//aquifer callback function run when JSON is returned by wfs call
var csvCallback = function (response){
    console.log('callback function');
    //csvData = responseJSON.result.records;
};