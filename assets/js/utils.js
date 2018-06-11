import each from 'lodash/collection/each';
import find from 'lodash/collection/find';
import includes from 'lodash/collection/includes';
import reject from 'lodash/collection/reject';


const COLLAPSE_IMG = Config.STATIC_ENDPOINT + 'img/collapse.png';
const EXPAND_IMG = Config.STATIC_ENDPOINT + 'img/expand.png';


/*
 * Returns a query string suitable for use as a URL query string with parameters on the ignoreList
 * removed.
 * @param {Array of Object} queryParamArray - Each object has a string name property, a value property that can be an
 *         an array or a string and a boolean multiple property (not used in this function).
 * @param {Array of String} ignoreList - Names to be removed from paramArray before serializing
 * @param {Boolean} multiSelectDelimited - if True, values that are arrays are serialized as a single param with ';' separated values
 * @return {String} - String suitable for use as a URL query string.
 */
export const getQueryString = function(queryParamArray, ignoreList, multiSelectDelimited) {
    var thisIgnoreList = ignoreList ? ignoreList : [];
    var resultArray = reject(queryParamArray, function (param) {
        return includes(thisIgnoreList, param.name);
    });

    var paramArray = [];

    each(resultArray, function(param) {
        // If not string than it is assumed to be an array
        if (typeof param.value === 'string') {
            paramArray.push(param);
        } else if (multiSelectDelimited) {
            paramArray.push({
                name: param.name,
                value: param.value.join(';')
            });
        } else {
            each(param.value, function(val) {
                paramArray.push({
                    name: param.name,
                    value: val
                });
            });
        }
    });

    return $.param(paramArray);
};

/*
 * @param {Array of Object containing string name, value (string or array) and multiple properties} queryParamArray
 * @returns {Object} where the properties are the name property from queryParamArray. If an object contains a true
 * multiple property and the value property is a string then the value is split into an array using the string in
 * the multiple property.
 */
export const getQueryParamJson = function(queryParamArray) {
    var result = {};
    each(queryParamArray, function(param) {
        if (typeof param.value === 'string' && param.multiple) {
            result[param.name] = param.value.split(';');
        } else {
            result[param.name] = param.value;
        }
    });
    return result;
};

export const isExtraSmallBrowser = function() {
    return $('body').width() < 750;
};

/*
 * Add/Remove the disabled attribute for $els and make the element appear enabled/disabled.
 * @param {Array of jquery input elements} $els
 * @param {Boolean} isEnabled
 */
export const setEnabled = function($els, isEnabled /* Boolean */) {
    $els.prop('disabled', !isEnabled);
    $els.each(function() {
        var $label = $('label[for="' + $(this).attr('id') + '"]');
        if (isEnabled) {
            $label.removeClass('disabled');
        } else {
            $label.addClass('disabled');
        }
    });
};

/*
 * @param {Jquery element} $button - The show/hide toggle button jquery element
 * @param {Jquery element} $contentDiv - The content div that is controlled by buttonEl.
 * @return {Boolean} - true if contentDivEl is now visible, false otherwise.
 */
export const toggleShowHideSections = function($button, $contentDiv) {
    var $buttonImg = $button.find('img');
    if ($buttonImg.attr('alt') === 'show') {
        $button.attr('title', $button.attr('title').replace('Show', 'Hide'));
        $buttonImg.attr('alt', 'hide').attr('src', COLLAPSE_IMG);
        $contentDiv.slideDown();
        return true;
    } else {
        $button.attr('title', $button.attr('title').replace('Hide', 'Show'));
        $buttonImg.attr('alt', 'show').attr('src', EXPAND_IMG);
        $contentDiv.slideUp();
        return false;
    }
};

/*
 * Cookie utils
 */
export const Cookie = {
    /*
     * @param String name
     * @return String containing the cookie value for name or the empty string if none exists.
     */
    getByName: function(cname) {
        var name = cname + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }
};

/*
 * @return {Object} containing the headers that should be used for service calls to WQP services.
 */
export const getHeaders = function() {
    var accessToken = Cookie.getByName('access_token');
    var headers = {};
    if (accessToken) {
        headers.Authorization = 'Bearer ' + accessToken;
    }
    return headers;
};

/*
 * @param {String} param
 * @return {Array} containing the values of the query parameter that is currently in the anchor part of the url
 */
export const getQueryValues = function(param) {
    const queryParams = window.location.hash.split('&').split('='); // Array of Arrays[name, value]
    return queryParams
        .filter((nameValuePair) => {
            return nameValuePair[0] === param
        })
        .map((nameValuePair) => {
            return nameValuePair[1];
        });
};

