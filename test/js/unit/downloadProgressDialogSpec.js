describe('Tests for PORTAl.VIEWS.downloadProgressDialog', function() {
    var thisDialog;
    var continueSpy;

    beforeEach(function() {
        $('body').append('<div id=progress-dialog class="modal">' +
                '<div class="modal-content">' +
                '<div class="modal-dialog">' +
                '<div class="modal-header"><h4></h4></div>' +
                '<div class="modal-body"></div>' +
                '<div class="modal-footer"></div>' +
                '</div></div></div>');

        thisDialog = PORTAL.VIEWS.downloadProgressDialog($('#progress-dialog'));
        continueSpy = jasmine.createSpy('continueSpy');
    });
    afterEach(function() {
        $('#progress-dialog').remove();
    });

    it('Expects the dialog to be visible with appropriate content and header when show is called', function() {
        thisDialog.show('map', continueSpy);
        expect($('#progress-dialog').is(':visible')).toBe(true);
        expect($('.modal-header h4').html()).toContain('Map Sites');
        expect($('.modal-body').html()).toContain('Please wait');

        thisDialog.show('download', continueSpy);
        expect($('#progress-dialog').is(':visible')).toBe(true);
        expect($('.modal-header h4').html()).toContain('Download');
        expect($('.modal-body').html()).toContain('Please wait');
    });

    it('Expects the dialog to be hidden after calling hide', function() {
        thisDialog.show('map', continueSpy);
        thisDialog.hide();
        expect($('#progress-dialog').is(':visible')).toEqual(false);
    });

    it('Expects the dialog to be updated the second time show is called', function() {
        thisDialog.show('map', continueSpy);
        thisDialog.hide();
        thisDialog.show('download', continueSpy);
        expect($('#progress-dialog').is(':visible')).toBe(true);
        expect($('.modal-header h4').html()).toContain('Download');
        expect($('.modal-body').html()).toContain('Please wait');
    });

    it('When updateProgress is call, expects the status to be updated if no counts with an Ok button which closes the dialog', function() {
        thisDialog.show('map', continueSpy);
        thisDialog.updateProgress({
            message : 'Can\'t contact the server'
        });
        expect($('.modal-body').html()).toContain('Can\'t contact the server');
        expect($('#progress-ok-btn').length).toEqual(1);
        expect($('#progress-cancel-btn').length).toEqual(0);
        expect($('#progress-continue-btn').length).toEqual(0);

        $('#progress-ok-btn').click();
        expect($('#progress-dialog').is(':visible')).toBe(false);
    });

    describe('Tests for updateProgress when dialog is for map', function() {
        beforeEach(function() {
            thisDialog.show('map', continueSpy);
        });

        it('Expects when totalCounts exceed limit that download is canceled', function() {
            thisDialog.updateProgress({
                totalCounts : '250,001',
                message: 'Counts messages'
            });

            expect($('.modal-body').html()).toContain('Counts messages');
            expect($('.modal-body').html()).toContain('query is returning more than 250,000 sites');
            expect($('#progress-ok-btn').length).toEqual(1);
            expect($('#progress-cancel-btn').length).toEqual(0);
            expect($('#progress-continue-btn').length).toEqual(0);

            $('#progress-ok-btn').click();
            expect($('#progress-dialog').is(':visible')).toBe(false);
            expect(continueSpy).not.toHaveBeenCalled();
        });

        it('Expects when totalCounts is under limit, that the status message is updated to allow the action', function() {
            thisDialog.updateProgress({
                totalCounts : '249,999',
                message: 'Counts messages'
            });

            expect($('.modal-body').html()).toContain('Counts messages');
            expect($('.modal-body').html()).toContain('map the sites');
            expect($('#progress-ok-btn').length).toEqual(0);
            expect($('#progress-cancel-btn').length).toEqual(1);
            expect($('#progress-continue-btn').length).toEqual(1);

            $('#progress-cancel-btn').click();
            expect($('#progress-dialog').is(':visible')).toBe(false);
            expect(continueSpy).not.toHaveBeenCalled();

            thisDialog.show('map', continueSpy);
            thisDialog.updateProgress({
                totalCounts : '249,999',
                message: 'Counts messages'
            });

            $('#progress-continue-btn').click();
            expect(continueSpy).toHaveBeenCalledWith('249,999');
            expect($('#progress-dialog').is(':visible')).toBe(false);
        });
    });

    describe('Tests for updateProgress when dialog is for download', function(){
        beforeEach(function() {
            thisDialog.show('download', continueSpy);
        });

        it('Expects when the dialog is for downloads and the fileFormat is not xlsx, that the download is always allowed', function() {
            thisDialog.updateProgress({
                totalCounts : '250,001',
                message : 'Counts messages',
                fileFormat : 'csv'
            });

            expect($('.modal-body').html()).toContain('Counts messages');
            expect($('.modal-body').html()).toContain('download the data');
            expect($('#progress-cancel-btn').length).toEqual(1);
            expect($('#progress-continue-btn').length).toEqual(1);
            expect($('#progress-ok-btn').length).toEqual(0);

            $('#progress-continue-btn').click();
            expect($('#progress-dialog').is(':visible')).toBe(false);
            expect(continueSpy).toHaveBeenCalledWith('250,001');

            thisDialog.show('download', continueSpy);
            thisDialog.updateProgress({
                totalCounts : '2,000,000',
                message : 'Counts messages',
                fileFormat : 'tsv'
            });
            expect($('.modal-body').html()).toContain('Counts messages');
            expect($('.modal-body').html()).toContain('download the data');
            expect($('#progress-ok-btn').length).toEqual(0);
            expect($('#progress-cancel-btn').length).toEqual(1);
            expect($('#progress-continue-btn').length).toEqual(1);

            $('#progress-continue-btn').click();

            expect($('#progress-dialog').is(':visible')).toBe(false);
            expect(continueSpy).toHaveBeenCalledWith('2,000,000');
        });

        it('Expects when the dialog is for downloads and the fileFormat is xlsx, that the download is allowed if counts are less than or equal to 1,048,575', function() {
            thisDialog.updateProgress({
                totalCounts : '1,048,575',
                message : 'Counts messages',
                fileFormat : 'xlsx'
            });
            expect($('.modal-body').html()).toContain('Counts messages');
            expect($('.modal-body').html()).toContain('download the data');
            expect($('#progress-ok-btn').length).toEqual(0);
            expect($('#progress-cancel-btn').length).toEqual(1);
            expect($('#progress-continue-btn').length).toEqual(1);

            $('#progress-continue-btn').click();
            expect($('#progress-dialog').is(':visible')).toBe(false);
            expect(continueSpy).toHaveBeenCalledWith('1,048,575');
        });

        it('Expects when the dialog is for downloads and the fileFormat is xlsx, the donwload is not allowed if counts are greater than 1048575', function() {
            thisDialog.updateProgress({
                totalCounts : '1,048,576',
                message : 'Counts messages',
                fileFormat : 'xlsx'
            });

            expect($('.modal-body').html()).toContain('more than 1,048,575');
            expect($('#progress-ok-btn').length).toEqual(1);
            expect($('#progress-cancel-btn').length).toEqual(0);
            expect($('#progress-continue-btn').length).toEqual(0);

            $('#progress-ok-btn').click();
            expect($('#progress-dialog').is(':visible')).toBe(false);
            expect(continueSpy).not.toHaveBeenCalled();
        });
    });
});