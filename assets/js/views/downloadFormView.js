import downloadFormController from '../downloadFormController';
import BiologicalSamplingInputView from './biologicalSamplingInputView';
import BoundingBoxInputView from './boundingBoxInputView';
import DataDetailsView from './dataDetailsView';
import NldiView from './nldiView';
import PlaceInputView from './placeInputView';
import PointLocationInputView from './pointLocationInputView';
import { StaticSelect2 } from './portalViews';
import SamplingParameterInputView from './samplingParameterInputView';
import SiteParameterInputView from './siteParameterInputView';
import portalHelp from '../portalHelp';
import { CachedCodes, CodesWithKeys } from '../portalModels';
import providers from '../providers';
import queryService from '../queryService';
import { toggleShowHideSections, getQueryString } from '../utils';

/*
 * Initializes the download form and provides methods to get information from the form
 * @param {Object} options
 *      @prop {Jquery element} $form - The form which contains all of the query parameters
 *      @prop {DownloadProgressDialog} downloadProgressDialog
 * @return {Object}
 *      @func initialize
 *      @func getQueryParams
 */
export default class DownloadFormView {
    constructor({$form, downloadProgressDialog}) {
        this.$form = $form;
        this.downloadProgressDialog = downloadProgressDialog;
    }

    /*
     * @return {PlaceInputView}
     */
    getPlaceInputView() {
        // Initialize Place inputs
        var getCountryFromState = function(id) {
            return id ? id.split(':')[0] : '';
        };
        var getStateFromCounty = function(id) {
            var ids = id.split(':');
            return ids.length > 1 ? ids[0] + ':' + ids[1] : '';
        };

        var countryModel = new CachedCodes({
            codes : 'countrycode'
        });
        var stateModel = new CodesWithKeys({
            codes : 'statecode',
            keyParameter : 'countrycode',
            parseKey : getCountryFromState
        });
        var countyModel = new CodesWithKeys({
            codes : 'countycode',
            keyParameter : 'statecode',
            parseKey : getStateFromCounty
        });
        return new PlaceInputView({
            $container : $('#place'),
            countryModel : countryModel,
            stateModel : stateModel,
            countyModel : countyModel
        });
    }

    /*
     * Initializes the form and sets up the DOM event handlers
     * @return jquery promise
     *      @resolve - if all initialization including successful fetches are complete
     *      @reject - if any fetches failed.
     */
    initialize() {
        var placeInputView = this.getPlaceInputView();
        var pointLocationInputView = new PointLocationInputView({
            $container : this.$form.find('#point-location')
        });
        var boundingBoxInputView = new BoundingBoxInputView({
            $container : this.$form.find('#bounding-box')
        });
        var siteParameterInputView = new SiteParameterInputView({
            $container : this.$form.find('#site-params'),
            siteTypeModel : new CachedCodes({codes : 'sitetype'}),
            organizationModel : new CachedCodes({codes : 'organization'})
        });
        var nldiView = new NldiView({
            insetMapDivId : 'nldi-inset-map',
            mapDivId : 'nldi-map',
            $inputContainer : this.$form.find('#nldi-param-container')
        });
        var samplingParametersInputView = new SamplingParameterInputView({
            $container : this.$form.find('#sampling'),
            sampleMediaModel : new CachedCodes({codes: 'samplemedia'}),
            characteristicTypeModel : new CachedCodes({codes: 'characteristictype'})
        });
        var biologicalSamplingInputView = new BiologicalSamplingInputView({
            $container : this.$form.find('#biological'),
            assemblageModel : new CachedCodes({codes: 'assemblage'})
        });
        var dataDetailsView = new DataDetailsView({
            $container : this.$form.find('#download-box-input-div'),
            updateResultTypeAction : (resultType) => {
                this.$form.attr('action', queryService.getFormUrl(resultType));
            }
        });

        // fetch the providers and initialize the providers select
        var initializeProviders = providers.fetch()
            .done(() => {
                new StaticSelect2(this.$form.find('#providers-select'),
                    providers.getIds());
            });

        // Initialize form sub view
        var initPlaceInputView = placeInputView.initialize();
        var initSiteParameterInputView = siteParameterInputView.initialize();
        var initSamplingParametersInputView = samplingParametersInputView.initialize();
        var initBiologicalSamplingInputInputView = biologicalSamplingInputView.initialize();
        var initComplete = $.when(
            initBiologicalSamplingInputInputView,
            initializeProviders,
            initPlaceInputView,
            initSamplingParametersInputView,
            initSiteParameterInputView);

        dataDetailsView.initialize();
        pointLocationInputView.initialize();
        boundingBoxInputView.initialize();
        if (Config.NLDI_ENABLED) {
            nldiView.initialize();
        } else {
            this.$form.find('#nldi-container').hide();
            this.$form.find('#nldi-inset-map').hide();
            this.$form.find('#nldi-map').hide();
        }

        // Create help popovers which close when you click anywhere else other than another popover trigger.
        $('html').click(function () {
            $('.popover-help').popover('hide');
        });
        this.$form.find('.popover-help').each(function () {
            var options = $.extend({}, portalHelp[$(this).data('help')], {
                html: true,
                trigger: 'manual'
            });
            $(this).popover(options).click(function (e) {
                $(this).popover('toggle');
                e.stopPropagation();
            });
        });

        // Add Click handler for form show/hide/button
        this.$form.find('.panel-heading .show-hide-toggle').click(function () {
            toggleShowHideSections($(this), $(this).parents('.panel').find('.panel-body'));
        });

        this.$form.find('.subpanel-heading .show-hide-toggle').click(function () {
            toggleShowHideSections($(this), $(this).parents('.subpanel').find('.subpanel-body'));
        });

        // Set up the Download button
        this.$form.find('#main-button').click((event) => {
            var fileFormat = dataDetailsView.getMimeType();
            var resultType = dataDetailsView.getResultType();
            var queryParamArray = this.getQueryParamArray();
            var queryString = decodeURIComponent(getQueryString(queryParamArray));

            var startDownload = (totalCount) => {
                window._gaq.push([
                    '_trackEvent',
                    'Portal Page',
                    dataDetailsView.getResultType() + 'Download',
                    queryString,
                    parseInt(totalCount)]);

                this.$form.submit();
            };

            event.preventDefault();

            if (!downloadFormController.validateDownloadForm(this.$form)) {
                return;
            }

            window._gaq.push([
                '_trackEvent',
                'Portal Page',
                resultType + 'Count',
                queryString
            ]);

            this.downloadProgressDialog.show('download');
            queryService.fetchQueryCounts(resultType, queryParamArray, providers.getIds())
                .done((counts) => {
                    this.downloadProgressDialog.updateProgress(counts, resultType, fileFormat, startDownload);
                })
                .fail((message) => {
                    this.downloadProgressDialog.cancelProgress(message);
                });
        });

        return initComplete;
    }

    /*
     * Validate the form and return true if it is valid, false otherwise
     * @return {Boolean}
     */
    validateDownloadForm() {
        return downloadFormController.validateDownloadForm(this.$form);
    }

    /*
     * Return an array of Objects with name, value, and data-multiple attributes representing the current state
     * of the form. Empty
     * values are removed from the array. For selects that can have multiple values value will be an array, otherwise
     * it will be a string.
     * @return {Array of Objects with name, value, and multiple properties}
     */
    getQueryParamArray() {
        // Need to eliminate form parameters within the mapping-div
        var $formInputs = this.$form.find(':input').not('#mapping-div :input, #nldi-inset-map :input, #nldi-map :input');

        var result = [];
        $formInputs.each(function() {
            if ($(this).attr('type') !== 'radio' || $(this).prop('checked')) {
                var value = $(this).val();
                var valueIsNotEmpty = typeof value === 'string' ? value : value.length > 0;
                var name = $(this).attr('name');
                if (valueIsNotEmpty && name) {
                    result.push({
                        name: name,
                        value: value,
                        multiple: $(this).data('multiple') ? true : false
                    });
                }
            }
        });
        return result;
    }
}
