import map from 'lodash/collection/map';

import countsHbTemplate from './hbTemplates/counts.hbs';


var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.downloadProgressDialog = function (el) {
    var that = {};

    var totalCountProp = {
        'Station': 'sites',
        'Result': 'results',
        'Activity': 'activities'
    };

    // constants for the two different download statuses
    var DIALOG = {
        map: {
            title: 'Map Sites Status',
            continueMessage: 'map the sites',
            cancelDownload: function (sitesCount) {
                var intSiteCount = parseInt(sitesCount.split(',').join(''));
                return intSiteCount > 250000;
            },
            cancelMessage: 'Your query is returning more than 250,000 sites and can not be mapped.'
        },
        download: {
            title: 'Download Status',
            continueMessage: 'download the data',
            cancelDownload: function (counts, fileFormat) {
                return counts !== 0 && fileFormat === 'xlsx' && window.parseInt(counts.split(',').join('')) > 1048575;
            },
            cancelMessage: 'Your query is returning more than 1,048,575 results which exceeds Excel\'s limit.'
        }
    };

    var buttonHtml = function (id, label) {
        return '<button id="' + id + '" type="button" class="btn btn-default">' + label + '</button>';
    };

    var opKind; // Will hold the current state of the type of download requested.

    that.show = function (thisOpKind, dialogMessage) {
        var message = dialogMessage ? dialogMessage : 'Validating query ... Please wait.';
        opKind = thisOpKind;

        el.find('.modal-footer').html('');
        el.find('.modal-body').html(message);
        el.find('.modal-header h4').html(DIALOG[opKind].title);
        el.modal('show');
    };

    that.hide = function () {
        el.modal('hide');
    };

    that.updateProgress = function (counts, resultType, fileFormat, continueFnc) {
        var totalCount = counts.total[totalCountProp[resultType]];

        var getCountMessage = function () {
            // Return a string showing the site counts, formatted to be shown in html.
            var context = {
                total: counts.total,
                showSites: resultType === 'Station' || resultType === 'Result' || resultType === 'Activity',
                isProjects: resultType === 'Project',
                isProjectMonitoringLocationWeightings: resultType === 'ProjectMonitoringLocationWeighting',
                isResults : resultType === 'Result',
                isActivities : resultType === 'Activity',
                isActivityMetrics : resultType === 'ActivityMetric',
                isResultDetection: resultType === 'ResultDetectionQuantitationLimit'
            };
            context.providers = map(PORTAL.MODELS.providers.getIds(), function (provider) {
                return {
                    id: provider,
                    counts: counts[provider]
                };
            });
            return countsHbTemplate(context);
        };


        if (totalCount === '0') {
            that.cancelProgress('Your query returned no data to download.');
        } else if (DIALOG[opKind].cancelDownload(totalCount, fileFormat)) {
            that.cancelProgress(getCountMessage() + DIALOG[opKind].cancelMessage);
        } else {
            el.find('.modal-body').html(getCountMessage() + '<p>Click Continue to ' + DIALOG[opKind].continueMessage);
            el.find('.modal-footer').html(buttonHtml('progress-cancel-btn', 'Cancel') +
                buttonHtml('progress-continue-btn', 'Continue'));
            $('#progress-cancel-btn').click(function () {
                el.modal('hide');
            });
            $('#progress-continue-btn').click(function () {
                el.modal('hide');
                continueFnc(totalCount);
            });
        }
    };

    that.cancelProgress = function (message) {
        el.find('.modal-body').html(message);
        el.find('.modal-footer').html(buttonHtml('progress-ok-btn', 'Ok'));
        $('#progress-ok-btn').click(function () {
            el.modal('hide');
        });
    };

    return that;
};


