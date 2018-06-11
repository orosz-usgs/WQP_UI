import log from 'loglevel';

import InputValidation from './inputValidationView';
import { realNumberValidator } from '../portalValidators';


/*
 * Creates a pointLocationInputView object
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the point location inputs are contained
 * @returns
 *      @func initialize;
 */
export default class PointLocationInputView {
    constructor({$container}) {
        this.$container = $container;
    }

    // GeoLocation easter egg.
    updateMyLocation($lat, $lon) {
        var updateInputs = function(position) {
            $lat.val(position.coords.latitude);
            $lon.val(position.coords.longitude);
        };

        var displayError = function(err) {
            log.error('ERROR(' + err.code + '): ' + err.message);
            //TODO: Add call to show alert
        };

        window.navigator.geolocation.getCurrentPosition(updateInputs, displayError, {
            timeout: 8000,
            maximumAge: 60000
        });

        return false;
    }

    /*
     * Initializes all widgets and DOM event handlers
     */
    initialize() {
        new InputValidation({
            inputEl: this.$container.find('input[type="text"]'),
            validationFnc: realNumberValidator
        });

        // only give user the option if their browser supports geolocation
        if (window.navigator.geolocation && window.navigator.geolocation.getCurrentPosition) {
            var $useMyLocationDiv = this.$container.find('#useMyLocation');
            var $lat = this.$container.find('#lat');
            var $lon = this.$container.find('#long');

            $useMyLocationDiv.html('<button class="btn btn-info" type="button">Use my location</button>');
            $useMyLocationDiv.find('button').click(() => {
                this.updateMyLocation($lat, $lon);
            });
        }
    }
}
