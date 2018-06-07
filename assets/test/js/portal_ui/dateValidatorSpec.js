import * as dateValidator from '../../../js/dateValidator';


describe('dateValidator testing', function () {

    describe('Test dateValidator.validate function', function () {
        it('Expects that a null value is valid', function () {
            expect(dateValidator.validate('')).toEqual({isValid: true});
        });

        it('Expects that value with format mm/dd/yyyy or m/d/yyyy with dashes or slashes is valid', function () {
            expect(dateValidator.validate('03-04-2000')).toEqual({isValid: true});
            expect(dateValidator.validate('3/04/2000')).toEqual({isValid: true});
            expect(dateValidator.validate('03/4-2000')).toEqual({isValid: true});
        });

        it('Expects that value with format mm/yyyy with dashes or slashes is valid', function () {
            expect(dateValidator.validate('03/2000')).toEqual({isValid: true});
            expect(dateValidator.validate('03-2000')).toEqual({isValid: true});
        });

        it('Expects that value with format yyyy is valid', function () {
            expect(dateValidator.validate('1991')).toEqual({isValid: true});
        });

        it('Expects that value with any characters other than numbers, slashes, and dashes is invalid', function () {
            var r = dateValidator.validate('JUN-1991');
            expect(r.errorMessage).toBeDefined();

            r = dateValidator.validate('12-XX-1991');
            expect(r.isValid).toBe(false);
            expect(r.errorMessage).toBeDefined();

            r = dateValidator.validate('199A');
            expect(r.isValid).toBe(false);
            expect(r.errorMessage).toBeDefined();

            r = dateValidator.validate('JUN.01.1991');
            expect(r.isValid).toBe(false);
            expect(r.errorMessage).toBeDefined();
        });

        it('Expects that value with leading or trailing slash or dash is invalid', function () {
            var r = dateValidator.validate('-01-1991');
            expect(r.isValid).toBe(false);
            expect(r.errorMessage).toBeDefined();

            r = dateValidator.validate('JUN-1991/');
            expect(r.isValid).toBe(false);
            expect(r.errorMessage).toBeDefined();
        });

        it('Expects that value with more than two slashes or dashes is invalid', function () {
            var r = dateValidator.validate('01-01-01-2000');
            expect(r.isValid).toBe(false);
            expect(r.errorMessage).toBeDefined();
        });
    });

    describe('Tests for dateValidator.format', function () {
        it('Expects that blank value returns the null string', function () {
            expect(dateValidator.format('', false)).toEqual('');
            expect(dateValidator.format('', true)).toEqual('');
        });

        it('Expects dates in the format mm-dd-yyyy and mm/dd/yyyy to return mm-dd-yyyy', function () {
            expect(dateValidator.format('04-15-1990', false)).toEqual('04-15-1990');
            expect(dateValidator.format('04/15/1990', true)).toEqual('04-15-1990');
        });

        it('Expects date in the format m-d-yyyy and m/d/yyyy to return 0m-0d-yyyy', function () {
            expect(dateValidator.format('4-5-1990', false)).toEqual('04-05-1990');
            expect(dateValidator.format('4/5/1990', true)).toEqual('04-05-1990');
        });

        it('Expects date in the format mm-yyyy or 0m-yyyy with isLow true to return the first date of that month', function () {
            expect(dateValidator.format('4/1990', true)).toEqual('04-01-1990');
            expect(dateValidator.format('10-1990', true)).toEqual('10-01-1990');
        });

        it('Expects date in the format mm-yyyy or 0m-yyy with isLow false to return the last date of that month', function () {
            expect(dateValidator.format('10-1990', false)).toEqual('10-31-1990');
            expect(dateValidator.format('2/1990', false)).toEqual('02-28-1990');
        });

        it('Expects date in the format yyyy with isLow true to return the first date of the year', function () {
            expect(dateValidator.format('1990', true)).toEqual('01-01-1990');
        });

        it('Expects date in the format yyyy with isLow false to return the last date of the year', function () {
            expect(dateValidator.format('1990', false)).toEqual('12-31-1990');
        });
    });
});


