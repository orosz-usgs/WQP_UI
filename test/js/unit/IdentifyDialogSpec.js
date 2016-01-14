var _gaq = [];

describe('Test IdentifyDialog', function () {

	var dialogId;

	var identifyDialog;

	var dialogFormEl;

	var thePortalDataMap;

	beforeEach(function () {
		Config = {
			CODES_ENDPOINT: 'http:fakecodesservice/codes',
			QUERY_URLS: {
				Station: 'http://fakestationservice'
			}
		};
		dialogId = 'map-info-dialog';
		// Create base HTML
		var resultTypeRadioHtml = '<input checked="checked" type="radio" name="resultType" id="dialog-sites" value="Station"><input type="radio" name="resultType" id="dialog-samples" value="Result">' +
			'<input type="radio" name="resultType" id="dialog-biosamples" value="Bio Result">';
		var formHtml = '<form method="get">' +
			'<input type="radio" checked="checked" name="mimeType" id="csv" value="csv">' +
			'<input type="radio" name="mimeType" id="tsv" value="tab">' +
			'<input type="radio" name="mimeType" id="xlsx" value="xlsx">' +
			'<div id="map-id-hidden-input-div"></div>' +
			'</form/>';

		var downloadButton = '<button id="download-map-info-button">Download Data</button>';
		var tableOneHtml = '<table><tr><th>Station ID: </th><td class="details-site-id">Site1</td></tr></table>';
		var tableTwoHtml = '<table><tr><th>Station ID: </th><td class="details-site-id">Site2</td></tr></table>';

		var detailDivHtml = '<div id="map-info-details-div">' + tableOneHtml + tableTwoHtml + '</div>';

		$('body').append('<div id="' + dialogId + '">' +
			resultTypeRadioHtml +
			formHtml +
			downloadButton +
			detailDivHtml +
			'</div>');

		identifyDialog = new IdentifyDialog(dialogId, function (resultType) {
			if (resultType === 'Station') {
				return 'Station/search';
			}
			else {
				return 'Result/search';
			}
		});

		dialogFormEl = identifyDialog.dialogEl.find('form');

		thePortalDataMap = jasmine.createSpyObj('thePortalDataMap', ['cancelIdentifyOp']);
	});

	afterEach(function () {
		$('#' + dialogId).remove();
	});

	it('It should create expected properties representing jquery elements', function () {
		expect(identifyDialog.dialogEl).toBeDefined();
		expect(identifyDialog.dialogEl).not.toBeNull();
		expect(identifyDialog.portalDataMap).toBeDefined();
		expect(identifyDialog.portalDataMap).toBeNull();
	});

	it('Expect method create to initialize portalDataMap property and initialize the jquery ui dialog', function () {
		identifyDialog.create(thePortalDataMap);
		expect(identifyDialog.portalDataMap).toBe(thePortalDataMap);
		expect(identifyDialog.dialogEl.dialog('isOpen')).toBeFalsy();
	});

	it('Expect method create to set up close handler', function () {
		identifyDialog.create(thePortalDataMap);
		identifyDialog.dialogEl.dialog('open');
		identifyDialog.dialogEl.dialog('close');
		expect(thePortalDataMap.cancelIdentifyOp).toHaveBeenCalled();
	});

	describe('Test IdentifyDialog.updateAndShowDialog method', function () {
		var xhr;
		var requests;
		var bbox;
		var formParams;

		beforeEach(function () {
			bbox = new OpenLayers.Bounds(-90, 43, -89, 44);
			formParams = [
				{name: 'param1', value: 'P1'},
				{name: 'param2', value: 'P2'},
				{name: 'param3', value: 'P3'}
			];

			xhr = sinon.useFakeXMLHttpRequest();
			requests = [];
			xhr.onCreate = function (req) {
				requests.push(req);
			};

			identifyDialog.create(thePortalDataMap);
		});

		afterEach(function () {
			xhr.restore();
		});

		it('Expects the download button to be disabled until successful ajax call and the dialog to be opened', function () {
			var sites = [];
			identifyDialog.updateAndShowDialog(sites, bbox, formParams);
			expect(identifyDialog.dialogEl.dialog('isOpen')).toBeTruthy();
			expect(identifyDialog._downloadButtonEl.attr('disabled')).toEqual('disabled');
		});

		it('Expects updated details, and enabled download button if successful response', function () {
			var sites = ['NewSite1', 'NewSite2'];
			identifyDialog.updateAndShowDialog(sites, bbox, formParams);

			var xml = '<WQX><Organization><MonitoringLocation><MonitoringLocationIdentifier>NewSite1</MonitoringLocationIdentifier></MonitoringLocation></Organization><Organization><MonitoringLocation><MonitoringLocationIdentifier>NewSite1</MonitoringLocationIdentifier></MonitoringLocation></Organization><Organization><MonitoringLocationIdentifier>NewSite2</MonitoringLocationIdentifier></Organization></WQX>';
			requests[0].respond(200, {'Content-Type': 'text/xml'}, xml);

			expect(identifyDialog._detailDivEl.html()).toContain('<table>');
			expect(identifyDialog.dialogEl.find('input[name="siteid"]').val()).toEqual('NewSite1;NewSite2');
			expect(identifyDialog._downloadButtonEl.attr('disabled')).not.toBeDefined();

		});

		it('Expects the number of sites retrieved to be limited to 50 sites and set form params', function () {
			var sites = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10',
				'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20',
				'S21', 'S22', 'S23', 'S24', 'S25', 'S26', 'S27', 'S28', 'S29', 'S30',
				'S31', 'S32', 'S33', 'S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40',
				'S41', 'S42', 'S43', 'S44', 'S45', 'S46', 'S47', 'S48', 'S49', 'S50', 'S51'
			];
			identifyDialog.updateAndShowDialog(sites, bbox, formParams);
			expect(requests[0].url).toContain('siteid=' + encodeURIComponent(sites.slice(0, 50).join(';')));

			var xml = '<WQX><Organization><MonitoringLocationIdentifier>NewSite1</MonitoringLocationIdentifier></Organization></WQX>';
			requests[0].respond(200, {'Content-Type': 'text/xml'}, xml);

			expect(identifyDialog.dialogEl.find('input[name="bBox"]').val()).toEqual('-90,43,-89,44');
			expect(identifyDialog.dialogEl.find('input[name="param1"]').val()).toEqual('P1');
			expect(identifyDialog.dialogEl.find('input[name="param2"]').val()).toEqual('P2');
			expect(identifyDialog.dialogEl.find('input[name="param3"]').val()).toEqual('P3');
		});

		describe('Test set up and execution of the download', function () {
			var submitSpy;

			beforeEach(function () {
				submitSpy = spyOn($.fn, 'submit');

				var sites = ['NewSite1', 'NewSite2', 'NewSite3'];
				identifyDialog.updateAndShowDialog(sites, bbox, formParams);

				var xml = '<WQX><Organization><MonitoringLocation><MonitoringLocationIdentifier>NewSite1</MonitoringLocationIdentifier></MonitoringLocation></Organization><Organization><MonitoringLocation><MonitoringLocationIdentifier>NewSite2</MonitoringLocationIdentifier></MonitoringLocation></Organization><Organization><MonitoringLocation><MonitoringLocationIdentifier>NewSite3</MonitoringLocationIdentifier></MonitoringLocation></Organization></WQX>';

				requests[0].respond(200, {'Content-Type': 'text/xml'}, xml);
			});

			it('Expect site ids to be added to the dialog\'s download form', function () {
				identifyDialog._downloadButtonEl.click();
				expect(identifyDialog.dialogEl.find('input[name="siteid"]').val()).toEqual('NewSite1;NewSite2;NewSite3');

			});
			it('Expect form action to reflect radio input value', function () {
				identifyDialog.dialogEl.find('#dialog-sites').click();
				identifyDialog._downloadButtonEl.click();
				expect(identifyDialog.dialogEl.find('form').attr('action'), 'Station/search');

				identifyDialog.dialogEl.find('#dialog-samples').click();
				identifyDialog._downloadButtonEl.click();
				expect(identifyDialog.dialogEl.find('form').attr('action'), 'Result/search');

				identifyDialog.dialogEl.find('#dialog-biosamples').click();
				identifyDialog._downloadButtonEl.click();
				expect(identifyDialog.dialogEl.find('form').attr('action'), 'Result/search');
				expect(identifyDialog.dialogEl.find('form input[name="dataProfile"]').length).toBe(1);

				identifyDialog.dialogEl.find('#dialog-samples').click();
				identifyDialog._downloadButtonEl.click();
				expect(identifyDialog.dialogEl.find('form').attr('action'), 'Result/search');
				expect(identifyDialog.dialogEl.find('form input[name="dataProfile"]').length).toBe(0);

			});
			it('Expect download form submitted when download button is clicked', function () {
				identifyDialog._downloadButtonEl.click();
				expect(submitSpy).toHaveBeenCalled();
			});
		});
	});
});

