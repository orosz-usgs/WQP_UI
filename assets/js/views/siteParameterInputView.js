import InputValidation from './inputValidationView';
import { CodeSelect, PagedCodeSelect } from './portalViews';
import * as hucValidator from '../hucValidator';

/*
 * Creates a site parameter input view object
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the site parameter inputs are contained
 *      @prop {PORTAL.MODELS.cachedCodes} siteTypeModel
 *      @prop {PORTAL.MODELS.cachedCodes} organizationModel
 * @returns {Object}
 *      @func initialize;
 */
export default class SiteParameterInputView {
    constructor({$container, siteTypeModel, organizationModel}) {
        this.$container = $container;
        this.siteTypeModel = siteTypeModel;
        this.organizationModel = organizationModel;
    }

    initializeOrganizationSelect($select, model) {
        var formatData = function(data) {
            return {
                id : data.id,
                text : data.id + ' - ' + data.desc
            };
        };
        var isMatch = function(searchTerm, data) {
            var termMatcher;
            if (searchTerm) {
                termMatcher = new RegExp(searchTerm, 'i');
                return termMatcher.test(data.id) || termMatcher.test(data.desc);
            } else {
                return true;
            }
        };
        new CodeSelect($select, {
            model : model,
            formatData : formatData,
            isMatch : isMatch
        }, {
            minimumInputLength: 2,
            closeOnSelect : false
        });
    }

    initializeSiteIdSelect($select, $orgsel) {
        var formatData = function(data) {
            return data.value + ' - ' + data.desc;
        };

        var parametername = 'organizationid';

        new PagedCodeSelect($select, {
            codes: 'monitoringlocation',
            formatData: formatData
            }, {
            minimumInputLength: 2
        }, $orgsel, parametername);
    }


    /*
     * Initialize the widgets and DOM event handlers
     * @return Jquery promise
     *      @resolve - when all models have been fetched successfully
     *      @reject - if any model's fetch failed.
     */
    initialize() {
        var $siteTypeSelect = this.$container.find('#siteType');
        var $organizationSelect = this.$container.find('#organization');
        var $siteIdInput = this.$container.find('#siteid');
        var $hucInput = this.$container.find('#huc');
        var $minActivitiesInput = this.$container.find('#min-activities');

        var fetchSiteType = this.siteTypeModel.fetch();
        var fetchOrganization = this.organizationModel.fetch();
        var fetchComplete = $.when(fetchSiteType, fetchOrganization);

        this.initializeSiteIdSelect($siteIdInput, $organizationSelect);

        fetchSiteType.done(() => {
            new CodeSelect($siteTypeSelect, {model : this.siteTypeModel});
        });

        fetchOrganization.done(() => {
            this.initializeOrganizationSelect($organizationSelect, this.organizationModel);
        });

        // Add event handlers
        new InputValidation({
            inputEl: $hucInput,
            validationFnc: hucValidator.validate,
            updateFnc: hucValidator.format
        });
        new InputValidation({
            inputEl : $minActivitiesInput,
            validationFnc : PORTAL.validators.positiveIntValidator
        });

        return fetchComplete;
    }
}
