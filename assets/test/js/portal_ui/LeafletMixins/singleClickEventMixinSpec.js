import  '../../../../js/LeafletMixins/SingleClickEventHandlerMixin'; // Needed in order to include in the bundle for the test

describe('Test L.singleClickEventMixin', function () {
    describe('Mixins do not share state', function() {

        it('Expects successive invocations of the function to produce non-identical objects', function() {
            var mixin1 = L.singleClickEventMixin();
            var mixin2 = L.singleClickEventMixin();
            expect(mixin1).not.toBe(mixin2);
        });
        it('Expects mixins not to share state via added properties', function(){
            var additionalPropertyName = '80cb4067f8c1b534b4a59bcdf08dbf50'; //this can be any unlikely property name

            var mixin1 = L.singleClickEventMixin();
            var mixin2 = L.singleClickEventMixin();

            mixin1[additionalPropertyName] = 'test';
            expect(mixin2[additionalPropertyName]).toBeUndefined();

            mixin2[additionalPropertyName] = 'other';

            expect(mixin1[additionalPropertyName]).not.toBe(mixin2[additionalPropertyName]);

        });

        it('Expects mixins not to share state via existing properties', function(){
            var mixin1 = L.singleClickEventMixin();
            mixin1.dblclickInterval = 999;
            var mixin2 = L.singleClickEventMixin();
            mixin2.dblclickInterval = 0;
            expect(mixin1.dblclickInterval).not.toBe(mixin2.dblclickInterval);

        });

        it('Expects mixins not to share state when using stateful methods', function(){
            var mixin1 = L.singleClickEventMixin();
            var mixin2 = L.singleClickEventMixin();

            //expect both are initially empty
            expect(mixin1._singleClickHandlers.length).toBe(0);
            expect(mixin2._singleClickHandlers.length).toBe(0);

            //change one mixin's state
            var mockHandler = function() {
                return 'hola';
            };
            mixin1.addSingleClickHandler(mockHandler);
            expect(mixin1._singleClickHandlers.length).toBe(1);

            //expect that the other mixin did not change state;
            expect(mixin2._singleClickHandlers.length).toBe(0);
        });
    });
});
