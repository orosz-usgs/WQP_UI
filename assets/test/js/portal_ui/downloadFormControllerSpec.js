import { validatePointLocation, validateBoundingBox, validateDateRange } from '../../../js/downloadFormController';


describe('Tests for validatePointLocation', function () {
    var fields;
    beforeEach(function () {
        var pointLocationHtml = '<div id="test-div">' +
            '<input id="within-input" value="" />' +
            '<input id="lat-input" value="" />' +
            '<input id="lon-input" value="" />' +
            '</div>';
        $('body').append(pointLocationHtml);

        fields = {
            withinEl: $('#within-input'),
            latEl: $('#lat-input'),
            lonEl: $('#lon-input')
        };
    });

    afterEach(function () {
        $('#test-div').remove();
    });

    it('Expects all blank inputs to be valid', function () {
        expect(validatePointLocation(fields)).toEqual({isValid: true});
    });

    it('Expects all filled in inputs to be valid', function () {
        fields.withinEl.val('2');
        fields.latEl.val('12.0');
        fields.lonEl.val('16.0');
        expect(validatePointLocation(fields)).toEqual({isValid: true});
    });

    it('Expects if one or two fields are blank that it is invalid', function () {
        var result;

        fields.withinEl.val('2');
        fields.latEl.val('12.0');
        result = validatePointLocation(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.latEl.val('');
        result = validatePointLocation(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.withinEl.val('');
        fields.latEl.val('12.0');
        result = validatePointLocation(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.lonEl.val('16.0');
        result = validatePointLocation(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.withinEl.val('2.0');
        fields.latEl.val('');
        result = validatePointLocation(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
    });
});

describe('Tests for validateBoundingBox', function () {
    var fields;

    beforeEach(function () {
        var inputHtml = '<div id="test-div">' +
            '<input id="north-input" value=""/>' +
            '<input id="south-input" value=""/>' +
            '<input id="east-input" value=""/>' +
            '<input id="west-input" value=""/>' +
            '</div>';
        $('body').append(inputHtml);

        fields = {
            northEl: $('#north-input'),
            southEl: $('#south-input'),
            eastEl: $('#east-input'),
            westEl: $('#west-input')
        };
    });

    afterEach(function () {
        $('#test-div').remove();
    });

    it('Expects all blank fields to be valid', function () {
        expect(validateBoundingBox(fields).isValid).toBe(true);
    });

    it('Expects all filled in fields to be valid if north is greater than south and east is greater than west', function () {
        fields.northEl.val('15.0');
        fields.southEl.val('14.0');
        fields.eastEl.val('-13.0');
        fields.westEl.val('-14.0');
        expect(validateBoundingBox(fields).isValid).toBe(true);
    });

    it('Expects the result to be invalid if north is less than south', function () {
        var result;
        fields.northEl.val('13.0');
        fields.southEl.val('14.0');
        fields.eastEl.val('-13.0');
        fields.westEl.val('-14.0');
        result = validateBoundingBox(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
    });

    it('Expects the result to be invalid if east is less than west', function () {
        var result;
        fields.northEl.val('15.0');
        fields.southEl.val('14.0');
        fields.eastEl.val('-13.0');
        fields.westEl.val('-12.0');
        result = validateBoundingBox(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
    });

    it('Expects the results to be invalid if some fields are blank and others have values', function () {
        var result;
        fields.northEl.val('15.0');
        fields.southEl.val('14.0');
        fields.eastEl.val('-13.0');
        result = validateBoundingBox(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.eastEl.val('');
        fields.westEl.val('-14.0');
        result = validateBoundingBox(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.southEl.val('');
        fields.eastEl.val('-13.0');
        result = validateBoundingBox(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();

        fields.northEl.val('');
        fields.southEl.val('14.0');
        result = validateBoundingBox(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
    });

});

describe('Tests for validateDateRange', function () {
    var fields;

    beforeEach(function () {
        var inputHtml = '<div id="test-div">' +
            '<input id="from-input" value="" />' +
            '<input id="to-input" value="" />' +
            '</div>';
        $('body').append(inputHtml);

        fields = {
            fromDateEl: $('#from-input'),
            toDateEl: $('#to-input')
        };
    });

    afterEach(function () {
        $('#test-div').remove();
    });

    it('Expects a valid result if both fields are blank', function () {
        expect(validateDateRange(fields).isValid).toBe(true);
    });

    it('Expects a valid result if only one field is blank', function () {
        fields.toDateEl.val('01-01-2000');
        expect(validateDateRange(fields).isValid).toBe(true);

        fields.toDateEl.val('');
        fields.fromDateEl.val('01-01-2000');
        expect(validateDateRange(fields).isValid).toBe(true);
    });

    it('Expects a from date less than a to date to be valid', function () {
        fields.fromDateEl.val('01-01-2000');
        fields.toDateEl.val('01-01-2001');
        expect(validateDateRange(fields).isValid).toBe(true);
    });

    it('Expects a from date greater than a to date to be invalid', function () {
        fields.fromDateEl.val('01-01-2000');
        fields.toDateEl.val('12-31-1999');
        var result = validateDateRange(fields);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
    });

});
