import map from 'lodash/map';

import countsHbTemplate from './hbTemplates/counts.hbs';
import providers from './providers';


// constants for the two different download statuses
const DIALOG = {
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

const RESULT_TYPE_TO_TOTAL_COUNT_PROPERTY_MAP = {
    'Station': 'sites',
    'Result': 'results',
    'Activity': 'activities',
    'ActivityMetric': 'activitymetrics',
    'Project': 'projects',
    'ProjectMonitoringLocationWeighting': 'projectmonitoringlocationweightings',
    'ResultDetectionQuantitationLimit': 'resultdetections',
    'Organization': 'organizations',
    'BiologicalHabitatMetric': 'biologicalHabitatMetrics'
};


export default class DownloadProgressDialog {
    constructor(el) {
        this.el = el;
    }


    buttonHtml(id, label) {
        return '<button id="' + id + '" type="button" class="btn btn-default">' + label + '</button>';
    }

    show(thisOpKind, dialogMessage) {
        var message = dialogMessage ? dialogMessage : 'Validating query ... Please wait.';
        this.opKind = thisOpKind;

        this.el.find('.modal-footer').html('');
        this.el.find('.modal-body').html(message);
        this.el.find('.modal-header h4').html(DIALOG[this.opKind].title);
        this.el.modal('show');
    }

    hide() {
        this.el.modal('hide');
    }

    updateProgress(counts, resultType, fileFormat, continueFnc) {
        var totalCount = counts.total[RESULT_TYPE_TO_TOTAL_COUNT_PROPERTY_MAP[resultType]];

        var getCountMessage = function () {
            // Return a string showing the site counts, formatted to be shown in html.
            var context = {
                total: counts.total,
                showSites: resultType === 'Station' || resultType === 'Result' || resultType === 'Activity' || resultType === 'BiologicalHabitatMetric',
                isProjects: resultType === 'Project',
                isProjectMonitoringLocationWeightings: resultType === 'ProjectMonitoringLocationWeighting',
                isResults : resultType === 'Result',
                isActivities : resultType === 'Activity',
                isActivityMetrics : resultType === 'ActivityMetric',
                isResultDetection: resultType === 'ResultDetectionQuantitationLimit',
                isOrganization: resultType === 'Organization',
                isBiologicalHabitatMetric: resultType === 'BiologicalHabitatMetric'
            };
            context.providers = map(providers.getIds(), function (provider) {
                return {
                    id: provider,
                    counts: counts[provider]
                };
            });
            return countsHbTemplate(context);
        };


        if (totalCount === '0') {
            this.cancelProgress('Your query returned no data to download.');
        } else if (DIALOG[this.opKind].cancelDownload(totalCount, fileFormat)) {
            this.cancelProgress(getCountMessage() + DIALOG[this.opKind].cancelMessage);
        } else {
            this.el.find('.modal-body').html(getCountMessage() + '<p>Click Continue to ' + DIALOG[this.opKind].continueMessage);
            this.el.find('.modal-footer').html(this.buttonHtml('progress-cancel-btn', 'Cancel') +
                this.buttonHtml('progress-continue-btn', 'Continue'));
            $('#progress-cancel-btn').click(() => {
                this.el.modal('hide');
            });
            $('#progress-continue-btn').click(() => {
                this.el.modal('hide');
                continueFnc(totalCount);
            });
        }
    }

    cancelProgress(message) {
        this.el.find('.modal-body').html(message);
        this.el.find('.modal-footer').html(this.buttonHtml('progress-ok-btn', 'Ok'));
        $('#progress-ok-btn').click(() => {
            this.el.modal('hide');
        });
    }
}
