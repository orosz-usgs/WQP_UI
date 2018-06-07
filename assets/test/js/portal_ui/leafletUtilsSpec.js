describe('leafletUtils', function() {
    describe('Tests for toBBoxString', function() {

        it('Expects toBBoxString to return an formatted string representing the bounds', function() {
            expect(WQP.L.Util.toBBoxString(L.latLngBounds(L.latLng(42, -99), L.latLng(43, -98)))).toEqual('42,-99,43,-98');
        });
    });
});
