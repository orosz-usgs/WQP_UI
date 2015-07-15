var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.downloadProgressDialog = function(el) {

    var that = {};

    // constants for the two different download statuses
    var DIALOG = {
        map : {
            title : 'Map Sites Status',
            continueMessage : 'map the sites',
            cancelDownload : function(sitesCount) {
                var intSiteCount = parseInt(sitesCount.split(',').join(''));
                return (intSiteCount > 250000);
            },
            cancelMessage : 'Your query is returning more than 250,000 sites and can not be mapped.'
        },
        download : {
            title : 'Download Status',
            continueMessage : 'download the data',
            cancelDownload : function(counts, fileFormat) {
                 return (fileFormat === 'xlsx') &&  (parseInt(counts.split(',').join('')) > 1048575);
            },
            cancelMessage : 'Your query is returning more than 1,048,575 results which exceeds Excel\'s limit.'
        }
    };

    var continueFnc;
    var opKind;

    var buttonHtml = function(id, label) {
        return '<button id="' + id + '" type="button" class="btn btn-default">' + label + '</button>';
    };

    that.show = function(thisOpKind, thisContinueFnc) {
        continueFnc = thisContinueFnc;
        opKind = thisOpKind;

        el.find('.modal-body').html('Validating query ... Please wait.');
        el.find('.modal-header h4').html(DIALOG[opKind].title);
        el.modal('show');
    };

    that.hide = function() {
        el.modal('hide');
    };

    that.updateProgress = function(options) {
        if('totalCounts' in options) {
            if (DIALOG[opKind].cancelDownload(options.totalCounts, options.fileFormat)) {
                el.find('.modal-body').html(options.message + DIALOG[opKind].cancelMessage);
                el.find('.modal-footer').html(buttonHtml('progress-ok-btn', 'Ok'));
                $('#progress-ok-btn').click(function() {
                    el.modal('hide');
                });
            }
            else {
                el.find('.modal-body').html(options.message + '<p>Click Continue to ' + DIALOG[opKind].continueMessage);
                el.find('.modal-footer').html(buttonHtml('progress-cancel-btn', 'Cancel') +
                        buttonHtml('progress-continue-btn', 'Continue'));
                $('#progress-cancel-btn').click(function() {
                    el.modal('hide');
                });
                $('#progress-continue-btn').click(function() {
                    el.modal('hide');
                    continueFnc(options.totalCounts);
                });
            }
        }
        else {
            el.find('.modal-body').html('Request canceled: <br>' + options.message);
            el.find('.modal-footer').html(buttonHtml('progress-ok-btn', 'Ok'));
            $('#progress-ok-btn').click(function() {
                el.modal('hide');
            });
        }
    };

    return that;

}


