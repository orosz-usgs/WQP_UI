var PORTAL = PORTAL || {};
PORTAL.CONTROLLER = PORTAL.CONTROLLER || {};

/*
 * @param siteIds Array of site ID string
 * @param updateFnc function with a single string parameter which will take the generated html
 * @param option successFnc which is called if the ajax request succeeds
 *
 * Generates html which is passed into the updateFnc function. Prior to making the ajax call
 * to retrieve info about the sites, updateFnc is called and then the ajax call is made.
 * The site info table is generated and then sent to the updateFnc. The successFnc is
 * called if the ajax call suceeds and is optional.
 */
PORTAL.CONTROLLER.retrieveSiteIdInfo = function(siteIds, updateFnc, successFnc) {
    if (!successFnc) {
        successFnc = function() {return;};
    }
    if (siteIds.length > 0) {
        var idsToGet = siteIds.slice(0, Math.min(siteIds.length, 50));
        updateFnc('Retrieving site ID data');
        $.ajax({
            url : Config.STATION_ENDPOINT + '/search',
            type : 'GET',
            data : 'siteid=' + encodeURIComponent(idsToGet.join(';')),
            success : function(data, textStatus, jqXHR) {
                var detailHtml = '';
                var orgEls = $(data).find('Organization');

                if (siteIds.length > 50) {
                    detailHtml += 'Retrieved ' + siteIds.length + ' sites, only showing 50<br />';
                }

                orgEls.each(function() {
                   var orgId = $(this).find('OrganizationIdentifier').text();
                   var orgName = $(this).find('OrganizationFormalName').text();

                   $(this).find('MonitoringLocation').each(function() {
                    detailHtml += '<br />';
                    detailHtml += '<table>';
                    detailHtml += '<tr><th>Station ID: </th><td class="details-site-id">' + $(this).find('MonitoringLocationIdentifier').text() + '</td></tr>';
                    detailHtml += '<tr><th>Name: </th><td>' + $(this).find('MonitoringLocationName').text() + '</td></tr>';
                    detailHtml += '<tr><th>Type: </th><td>' + $(this).find('MonitoringLocationTypeName').text() + '</td></tr>';
                    detailHtml += '<tr><th>HUC 8: </th><td>' + $(this).find('HUCEightDigitCode').text() + '</td></tr>';
                    detailHtml += '<tr><th>Org ID: </th><td>' + orgId + '</td></tr>';
                    detailHtml += '<tr><th>Org Name: </th><td>' + orgName + '</td></tr>';
                    detailHtml += '</table>';
                   });
                });

                updateFnc(detailHtml);
                successFnc();
            },
            error : function(jqXHR, textStatus, error) {
                updateFnc('Unable to retrieve site information');
            }
        });
    }
    else {
        updateFnc('No sites at selection point');
    }
};




