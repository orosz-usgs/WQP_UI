import filter from 'lodash/collection/filter';
import includes from 'lodash/collection/includes';
import log from 'loglevel';

import { getHeaders } from './utils';


class Providers {
    constructor() {
        this.ids = [];
    }

    /*
     * @return {$.Deferred.promise} which is resolved if the fetch of providers is a success and rejected with the errors
     * message if the request fails.
     */
    fetch() {
        var deferred = $.Deferred();
        $.ajax({
            url: Config.CODES_ENDPOINT + '/providers',
            data: {mimeType: 'json'},
            headers: getHeaders(),
            type: 'GET',
            success: (data) => {
                this.ids = [];
                $.each(data.codes, (index, code) => {
                    this.ids.push(code.value);
                });
                deferred.resolve();
            },
            error: (jqXHR, textStatus, error) => {
                this.ids = [];
                let msg = '';
                log.error('Unable to retrieve provider list with error: ' + error);
                deferred.reject(jqXHR, error);
            }
        });
        return deferred.promise();
    }

    /*
     * @return {Array of String} of provider id strings
     */
    getIds() {
        return this.ids;
    }

    /*
     * Parses availableProviders, removes providers that are not in the model. If the string contains all of the ids
     * in the model, then return 'all' otherwise return a comma separated list of the valid providers.
     * @param {String} availableProviders - Space separated list of providers
     * @return {String}
     */
    formatAvailableProviders(availableProviders /* String containing space separated list of providers */) {
        var isValidId = (id) => {
            return includes(this.ids, id);
        };
        var availableList = availableProviders.split(' ');
        var resultList = filter(availableList, isValidId);

        if (resultList.length === this.ids.length) {
            return 'all';
        } else {
            return resultList.join(', ');
        }
    }
}


export default new Providers();
