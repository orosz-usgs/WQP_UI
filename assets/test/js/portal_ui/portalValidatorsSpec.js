import * as validators from '../../../js/portalValidators';


describe('Tests for portalValidators', function () {
    'use strict';

    describe('Tests for validators.siteIdValidator', function () {
        it('Expects null value to return isValid true', function () {
            expect(validators.siteIdValidator('')).toEqual({isValid: true});
        });
        it('Expects value with format x-y to be valid', function () {
            expect(validators.siteIdValidator('XX-YYY')).toEqual({isValid: true});
        });
        it('Expects value without a dash to be invalid', function () {
            var valid = validators.siteIdValidator('XXYYY');
            expect(valid.isValid).toBe(false);
            expect(valid.errorMessage).toBeDefined();
        });
        it('Expects value starting with a dash to be invalid', function () {
            var valid = validators.siteIdValidator('-XXYYY');
            expect(valid.isValid).toBe(false);
            expect(valid.errorMessage).toBeDefined();
        });
        it('Expects value ending with a dash to be invalid', function () {
            var valid = validators.siteIdValidator('XXYYY-');
            expect(valid.isValid).toBe(false);
            expect(valid.errorMessage).toBeDefined();
        });
    });

    describe('Tests for validators.realNumberValidator', function () {
        it('Expects a null value to be valid', function () {
            expect(validators.realNumberValidator('')).toEqual({isValid: true});
        });
        it('Expects a value containing digits to be valid or ', function () {
            expect(validators.realNumberValidator('30')).toEqual({isValid: true});
        });
        it('Expects valid floating points numbers to be valid', function () {
            expect(validators.realNumberValidator('30.')).toEqual({isValid: true});
            expect(validators.realNumberValidator('-30.1')).toEqual({isValid: true});
            expect(validators.realNumberValidator('.31')).toEqual({isValid: true});
            expect(validators.realNumberValidator('-0.31')).toEqual({isValid: true});
        });
        it('Expects value containing anything other the numbers, a single optional dash and a single decimal to be invalid', function () {
            var valid = validators.realNumberValidator('12A');
            expect(valid.isValid).toBe(false);
            expect(valid.errorMessage).toBeDefined();

            valid = validators.realNumberValidator('12:30');
            expect(valid.isValid).toBe(false);
            expect(valid.errorMessage).toBeDefined();

            valid = validators.realNumberValidator('12.30.60');
            expect(valid.isValid).toBe(false);
            expect(valid.errorMessage).toBeDefined();
        });
    });

    describe('Tests for validators.positiveIntValidator', function() {
        it('Expects a null value to be valid', function() {
            expect(validators.positiveIntValidator('').isValid).toBe(true);
        });

        it('Expects a zero value to be invalid', function() {
            expect(validators.positiveIntValidator('0').isValid).toBe(false);
        });

        it('Expects a negative value to be invalid', function() {
            expect(validators.positiveIntValidator('-12').isValid).toBe(false);
        });

        it('Expects real numbers to be invalid', function() {
            expect(validators.positiveIntValidator('23.3').isValid).toBe(false);
        });

        it('Expects that strings containing anything other the numbers is invalid', function() {
            expect(validators.positiveIntValidator('A123').isValid).toBe(false);
        });

        it('Expects positive integers to be valid', function() {
            expect(validators.positiveIntValidator('435681690').isValid).toBe(true);
        });
    });

});
