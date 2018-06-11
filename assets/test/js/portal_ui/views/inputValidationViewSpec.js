import InputValidation from '../../../../js/views/inputValidationView';


describe('Tests for InputValidation', function () {
    var validationFnc;
    beforeEach(function () {
        validationFnc = function (value) {
            if (value === 'Val1') {
                return {isValid: true};
            } else {
                return {
                    isValid: false,
                    errorMessage: 'Value must be Val1'
                };
            }
        };
        $('body').append('<div id="test-div">' +
            '<div id="input-parent1"><input id="test-input1" type="text" value=""/>' +
            '<button>?</button></div>' +
            '<div id="input-parent2"><input id="test-input2" type="text" value=""/>' +
            '<button>?</button></div>' +
            '</div>'
        );

    });

    afterEach(function () {
        $('#test-div').remove();
    });

    describe('Tests for InputValidation without an updateFnc', function () {
        beforeEach(function () {
            new InputValidation({
                inputEl: $('input[type="text"]'),
                validationFnc: validationFnc
            });
        });

        it('Expects a failed validation to all alert classes and display error messages', function () {
            $('#test-input1').val('Val2').change();
            expect($('#input-parent1').attr('class')).toEqual('alert alert-danger');
            expect($('#input-parent1').find('.error-message').html()).toEqual('Value must be Val1');
            expect($('#input-parent2').attr('class')).not.toBeDefined();
            expect($('#input-parent2').find('.error-message').length).toBe(0);
        });
        it('Expects a failed validation followed by a successful one to clear the error indicator', function () {
            $('#test-input2').val('Val2').change();
            $('#test-input2').val('Val1').change();
            expect($('#input-parent2').attr('class')).not.toContain('alert alert-danger');
            expect($('#input-parent2').find('.error-message').length).toBe(0);
        });
        it('Expects an initial successful validation to not change anything', function () {
            $('#test-input1').val('Val1').change();
            expect($('#input-parent1').attr('class')).not.toBeDefined();
            expect($('#input-parent1').find('.error-message').length).toBe(0);
        });

        it('Expects two failed validations to show only one message', function () {
            $('#test-input1').val('Val2').change();
            $('#test-input1').val('Val3').change();
            expect($('#input-parent1').find('.error-message').length).toBe(1);

        });
    });

    describe('Tests for InputValidation that specified an event other than change', function() {
        beforeEach(function () {
            new InputValidation({
                inputEl: $('input[type="text"]'),
                validationFnc: validationFnc,
                event: 'dummy-event'
            });
        });

        it('Expects a failed validation to show the error message when the dummy-event is triggered, not when change is triggered', function() {
            $('#test-input1').val('Val2').change();
            expect($('#input-parent1').attr('class')).not.toContain('alert alert-danger');
            expect($('#input-parent1').find('.error-message').length).toBe(0);

            $('#test-input1').trigger('dummy-event');
            expect($('#input-parent1').attr('class')).toEqual('alert alert-danger');
            expect($('#input-parent1').find('.error-message').html()).toEqual('Value must be Val1');
        });
    });

    describe('Tests for InputValidation with an updateFnc', function () {
        var fnc;

        beforeEach(function () {
            fnc = {
                updateFnc: function (value) {
                    return value.toUpperCase();
                }
            };

            spyOn(fnc, 'updateFnc').and.callThrough();

            new InputValidation({
                inputEl: $('input[type="text"]'),
                validationFnc: validationFnc,
                updateFnc: fnc.updateFnc
            });
        });

        it('Expects successful validation to call updateFnc and update the value', function () {
            $('#test-input1').val('Val1').change();
            expect(fnc.updateFnc).toHaveBeenCalledWith('Val1');
            expect($('#test-input1').val()).toEqual('VAL1');
        });

        it('Expects invalid validation to not call updateFnc', function () {
            $('#test-input1').val('xxx').change();
            expect(fnc.updateFnc).not.toHaveBeenCalled();
        });
    });
});
