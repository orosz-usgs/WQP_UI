
function srsnames($scope, $http) {
    $scope.gridData = {
        data: 'data', 
        showFilter: true,
        enableColumnResize: true};


    $http({method: 'get', url: 'public_srsnames?mimeType=json'})
        .success(function(thisdata, status) {
            $scope.data = thisdata.pcodes;
            $scope.maxLastRevDate = thisdata.maxLastRevDate;
        })
        .error(function(data, status) {
            alert(status);
        });

};
