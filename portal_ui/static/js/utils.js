function setCheckboxState(elements /* jquery elements */, state /* boolean */) {
    /* Set the checked state of the jquery elements to state
     * */

    if (state){
        elements.prop('checked', true);
    }
    else {
        elements.prop('checked', false);

    }
}

function setCheckboxTriState (elements /* jquery elements */, is_indeterminate /* boolean */, state /* boolean */) {
    /*If indeterminate is true, set the indeterminate property, otherwise set the checkbox checked state to state
    */
    if (is_indeterminate) {
        elements.prop('indeterminate', true);
    }
    else {
        elements.prop('indeterminate', false);
        setCheckboxState(elements, state);
    }
}

function getCheckBoxHtml(id, className, value) {
    /* Return the Html for a checkbox with the value, class and id followed by a label.
     * */
    var checkBox = '<input type="checkbox" id="' + id +
        '" class="' + className +
        '" value="' + value + '"/>';
    var label = '<label for="' + id + '">' + value + '</label>';
    return checkBox + label;
}

function getFormValues(formEl /* form jquery element */, ignoreList /* String array of form parameters */) {
    /* Return an array of objects representing the form elements, where each object is 'name' and 'value'
     * multi selects are combined into a single string separated by ';' */
    //TODO: consider if there is a better way of handling this
    var pushValue = function(arr, input) {
        arr.push(input.value);
        return arr;
    };

	var allInputs = formEl.serializeArray();
    var allMultiSelects = _.map(formEl.find('select[multiple]'), function(el) {
        return el.name;
    });
    var result = _.reject(allInputs, function(input) {
        return _.contains(allMultiSelects, input.name);
    });

    _.each(allMultiSelects, function(name) {
        var theseInputs = _.filter(allInputs, function(input) {
            return (input.name === name);
        });

        var mergedInputValue = _.reduce(theseInputs, pushValue, []).join(';');
        result.push({name : name, value : mergedInputValue});
    });

    return _.reject(result, function(input) {
        return _.contains(ignoreList, input.name);
    });
}

function getFormQuery(formEl /* form jquery element */,  ignoreList /* String array of form parameters */) {
    return $.param(getFormValues(formEl, ignoreList));
}

function setEnabled(els /* jquery elements */, isEnabled /* Boolean */) {
    /* If isEnabled is true, remove the disabled attribute and class from els.
     * If false, add the attribute and class to els. For any of the els which have
     *  associated labels, remove/add the disabled class as appropriate.
     */
    els.prop('disabled', !isEnabled);
    if (isEnabled) {
        els.each(function(){
                $('label[for="' + $(this).attr('id') + '"]').removeClass('disabled');
        });
    }
    else {
        els.each(function(){
                $('label[for="' + $(this).attr('id') + '"]').addClass('disabled');
        });
    }

};
/*
 * @param buttonEl - The show/hide toggle button jquery element
 * @param contentDivEl - The content div that is controlled by buttonEl.
 *
 * return true if contentDivEl is now visible, false otherwise.
 */
function toggleShowHideSections(buttonEl, contentDivEl) {
    var buttonImgEl = buttonEl.find('img');
    if (buttonImgEl.attr('alt') === 'show') {
        buttonEl.attr('title', buttonEl.attr('title').replace('Show', 'Hide'));
        buttonImgEl.attr('alt', 'hide').attr('src', Config.STATIC_ENDPOINT + 'img/collapse.png');
        contentDivEl.slideDown();
        return true;
    }
    else {
        buttonEl.attr('title', buttonEl.attr('title').replace('Hide', 'Show'));
        buttonImgEl.attr('alt', 'show').attr('src', Config.STATIC_ENDPOINT + 'img/expand.png');
        contentDivEl.slideUp();
        return false;
    }
}