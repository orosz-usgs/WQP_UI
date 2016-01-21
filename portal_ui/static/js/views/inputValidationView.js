var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};
//
// @params spec has the following properties
//      inputEl - Inputs whose value needs to be validated
//      validationFnc - function takes value. Returns an object with two properties
//          isValid property indicates whether the validation passed and errorMessage
//          contains the errorMessage is the validation did not pass.
//      updateFnc - optional function takes value and returns the formated value. This function
//          can assume that isValid has already been called and value is a valid entry.
PORTAL.VIEWS.inputValidation = function (spec) {
    spec.inputEl.change(function () {
        var inputValue = $(this).val();
        var result = spec.validationFnc(inputValue);
        var parent = $(this).parent();

        parent.find('.error-message').remove();
        if (result.isValid) {
            parent.removeClass('alert alert-danger');
            if (spec.updateFnc) {
                $(this).val(spec.updateFnc(inputValue));
            }
        }
        else {
            parent.addClass('alert alert-danger');
            parent.append('<div class="error-message">' + result.errorMessage + '</div>');
        }
    });
};

