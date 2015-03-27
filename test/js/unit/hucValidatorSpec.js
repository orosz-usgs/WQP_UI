describe('Tests PORTAL.hucValidator', function() {
    describe('Tests for PORTAL.hucValidator.validate', function() {
        it('Expects an empty string to be valid', function() {
            expect(PORTAL.hucValidator.validate('').isValid).toBe(true);
        });

        it('Expects huc value with more than 8 characters to be invalid', function() {
            var result = PORTAL.hucValidator.validate('123456789');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('12345678*');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();
        });

        it('Expects huc value to be 2, 4, 6, or 8 digits', function() {
            var result = PORTAL.hucValidator.validate('123');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('123*');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('1');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('12345');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('1234567*');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

        });

        it('Expects huc value which contains non numerical characters to be invalid', function() {
           var result = PORTAL.hucValidator.validate('A12345');
           expect(result.isValid).toBe(false);
           expect(result.errorMessage).toBeDefined();

           result = PORTAL.hucValidator.validate('1234-567');
           expect(result.isValid).toBe(false);
           expect(result.errorMessage).toBeDefined();
        });

        it('Expects huc value with "*" at the end of the value to be valid', function() {
            expect(PORTAL.hucValidator.validate('123456*').isValid).toBe(true);
        });

        it('Expects huc value with "*" anywhere but the end to be invalid', function() {
            var result = PORTAL.hucValidator.validate('12*4500');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();
        });

        it('Expects multiple huc values to be separated by semi-colons', function() {
            var result = PORTAL.hucValidator.validate('12;34;45');
            expect(result.isValid).toBe(true);

            result = PORTAL.hucValidator.validate('12*;34;');
            expect(result.isValid).toBe(true);

        });

        it('Expects each huc value to be valid or the whole string is invalid', function() {
            var result = PORTAL.hucValidator.validate('12A;34;56');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('12*1;34;56');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();

            result = PORTAL.hucValidator.validate('12;123456789;56');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();
        });
    });

    describe('Tests for PORTAL.hucValidator.format', function() {
        it('Expects null string to be returned without change', function() {
            expect(PORTAL.hucValidator.format('')).toEqual('');
        });

        it('Expects hucs of length 8 to be returned as is', function() {
            expect(PORTAL.hucValidator.format('01234567')).toEqual('01234567');
            expect(PORTAL.hucValidator.format('01010101;02020202'));
        });

        it('Expects hucs that end with a wildcard to be returned as is', function() {
            expect(PORTAL.hucValidator.format('0123*')).toEqual('0123*');
            expect(PORTAL.hucValidator.format('01*;01234567;0202*')).toEqual('01*;01234567;0202*');
            expect(PORTAL.hucValidator.format('010203*')).toEqual('010203*');
        });

        it('Expects hucs that are less than 8 chars but don\'t end with a "*" to have the wildcard added', function() {
            expect(PORTAL.hucValidator.format('0123')).toEqual('0123*');
            expect(PORTAL.hucValidator.format('01;020506;12345678')).toEqual('01*;020506*;12345678');
        });

        it('Expects that trailing semi-colons will be removed', function() {
            expect(PORTAL.hucValidator.format('01;0203;')).toEqual('01*;0203*');
            expect(PORTAL.hucValidator.format('01;;0203')).toEqual('01*;0203*');
        });

    });
});