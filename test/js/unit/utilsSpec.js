describe('Test utils package', function() {
   
    describe('Test getFormValues', function() {
        beforeEach(function() {
            $('body').append('<form></form>'); 
        });
        
        afterEach(function() {
            $('form').remove(); 
        });
        
        it('Expects an empty array if the form is empty', function() {
            expect(getFormValues($('form'))).toEqual([]);
        });
        
        it('Expects all form inputs to be returned if they have none empty values', function() {
            var input1 = '<input type="hidden" name="P1" value="one">';
            var input2 = '<input type="hidden" name="P2" value="two">';
            var input3 = '<input type="hidden" name="P3" value="three">';
            var input4 = '<select name="P4" multiple>' + 
                    '<option value="four" selected="selected">P4</option>' +
                    '<option value="second_four" selected="selected">P5</select>';
           $('form').append(input1 + input2 + input3 + input4);
           
           expect(getFormValues($('form'))).toEqual([{'name': 'P1', 'value' : 'one'},
                                                     {'name': 'P2', 'value' : 'two'},
                                                     {'name': 'P3', 'value' : 'three'},
                                                     {'name': 'P4', 'value' : 'four'},
                                                     {'name' : 'P4', 'value' : 'second_four'}]);
        });
        it('Expects only non-empty form inputs to be returned', function() {
            var input1 = '<input type="hidden" name="P1" value="one">';
            var input2 = '<input type="hidden" name="P2" >';
            var input3 = '<input type="hidden" name="P3" value="three">';
            var input4 = '<select name="P4" multiple>' + 
                    '<option value="four">P4</option>' +
                    '<option value="second_four">P5</select>';
           $('form').append(input1 + input2 + input3 + input4);
           
           expect(getFormValues($('form'))).toEqual([{'name': 'P1', 'value' : 'one'},
                                                     {'name': 'P3', 'value' : 'three'}]);
        });
         it('Expects ignored values to be excluded from returned list', function() {
            var input1 = '<input type="hidden" name="P1" value="one">';
            var input2 = '<input type="hidden" name="P2" value="two">';
            var input3 = '<input type="hidden" name="P3" value="three">';
            var input4 = '<select name="P4" multiple>' + 
                    '<option value="four" selected="selected">P4</option>' +
                    '<option value="second_four" selected="selected">P5</select>';
           $('form').append(input1 + input2 + input3  + input4);
           
           expect(getFormValues($('form'), ['P1', 'P2', 'P4'])).toEqual([{'name': 'P3', 'value' : 'three'}]);
        });

    });
    
    describe('Test getFormQuery', function() {
        beforeEach(function() {
            $('body').append('<form></form>'); 
        });
        
        afterEach(function() {
            $('form').remove(); 
        });
        
        it('Expects an empty string if the form is empty', function() {
            expect(getFormQuery($('form'))).toEqual('');
        });
        
        it('Expects all form inputs to be returned if they have none empty values', function() {
            var input1 = '<input type="hidden" name="P1" value="one">';
            var input2 = '<input type="hidden" name="P2" value="two">';
            var input3 = '<input type="hidden" name="P3" value="three">';
            var input4 = '<select name="P4" multiple>' + 
                    '<option value="four" selected="selected">P4</option>' +
                    '<option value="second_four" selected="selected">P5</select>';
           $('form').append(input1 + input2 + input3 + input4);
           
           expect(getFormQuery($('form'))).toEqual('P1=one&P2=two&P3=three&P4=four&P4=second_four');
        });
        it('Expects only non-empty form inputs to be returned', function() {
            var input1 = '<input type="hidden" name="P1" value="one">';
            var input2 = '<input type="hidden" name="P2" >';
            var input3 = '<input type="hidden" name="P3" value="three">';
            var input4 = '<select name="P4" multiple>' + 
                    '<option value="four">P4</option>' +
                    '<option value="second_four">P5</select>';
           $('form').append(input1 + input2 + input3 + input4);
           
           expect(getFormQuery($('form'))).toEqual('P1=one&P3=three');
        });
         it('Expects ignored values to be excluded from returned list', function() {
            var input1 = '<input type="hidden" name="P1" value="one">';
            var input2 = '<input type="hidden" name="P2" value="two">';
            var input3 = '<input type="hidden" name="P3" value="three">';
            var input4 = '<select name="P4" multiple>' + 
                    '<option value="four" selected="selected">P4</option>' +
                    '<option value="second_four" selected="selected">P5</select>';
           $('form').append(input1 + input2 + input3  + input4);
           
           expect(getFormQuery($('form'), ['P1', 'P2', 'P4'])).toEqual('P3=three');
        });               
    });
    
    describe('Test toggleShowHideSections', function() {
        beforeEach(function() {
            buttonHtml = '<button id="show-hide-toggle" title="Show content">' +
                    '<img src="img/expand.png" alt="show" /></button>';
            $('body').append('<div id="test-div">' + buttonHtml + '<div id="content-div" style="display:none;">Here\'s the content</div></div>');
        });
        
        afterEach(function() {
            $('#test-div').remove();
        });
        
        it('Expects when toggleShowHideSections is called content is hidden', function() {
            var isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
            expect(isVisible).toBe(true);
            expect($('#show-hide-toggle').attr('title')).toContain('Hide');
            expect($('#show-hide-toggle img').attr('alt')).toEqual('hide');
        });
        
        it('Expects when toggleShowHideSections is called twice, the content is shown', function() {
            var isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
            isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
            
            expect(isVisible).toBe(false);
            expect($('#show-hide-toggle').attr('title')).toContain('Show');
            expect($('#show-hide-toggle img').attr('alt')).toEqual('show');
        });
    });
});
