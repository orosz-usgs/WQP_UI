function IdentifyDialog(dialogDivId, downloadUrlFunc /* function returns url string for resultType parameter */) {
	// Object attributes
	this.dialogEl = $('#' + dialogDivId);
	this._downloadButtonEl = this.dialogEl.find('#download-map-info-button');
	this._detailDivEl = this.dialogEl.find('#map-info-details-div');

	this.portalDataMap = null;
	/* Will be assigned when create is called */

	// Set up click handler for the download
	this._downloadButtonEl.click($.proxy(function () {
		var dialogFormEl = this.dialogEl.find('form');
		var resultType = this.dialogEl.find('input[name="resultType"]:checked').val();
		var url = downloadUrlFunc(resultType);
		var $biosamplesRadio = this.dialogEl.find('#dialog-biosamples');

		dialogFormEl.attr('action', url);

		// Add/remove the dataProfile input based in the dialog-biosamples radio
		if ($biosamplesRadio.prop('checked')) {
			if (dialogFormEl.find('input[name="dataProfile"]').length === 0) {
				dialogFormEl.append('<input type="hidden" name="dataProfile" value="biological" />');
			}
		} else {
			this.dialogEl.find('input[name="dataProfile"]').remove();
		}

		_gaq.push(['_trackEvent', 'Portal Page', 'IdentifyDownload' + resultType, url + '?' + dialogFormEl.serialize()]);
		dialogFormEl.submit();
	}, this));

	this.create = function (portalDataMap) {
		/* This method should be called once and must be called before the remaining
		 * methods for this object
		 */
		this.portalDataMap = portalDataMap;
		this.dialogEl.dialog({
			autoOpen: false,
			modal: false,
			title: 'Detailed site information',
			width: 450,
			height: 400,
			close: $.proxy(function (event, ui) {
				this.portalDataMap.cancelIdentifyOp();
			}, this)
		});
	};

	this.updateAndShowDialog = function (siteIds /* array of site ids*/,
										 bbox /* OpenLayers.Bounds in degree */,
										 formParams) {
		var that = this;
		var updateFnc = function (html) {
			that._detailDivEl.html(html);
		};
		var successFnc = function () {
			var formHtml = '';
			var i;
			that.dialogEl.find('#map-id-hidden-input-div input[type="hidden"]').remove();

			if (siteIds.length > 50) {
				// Download data using bbox and formParams
				formHtml += '<input type="hidden" name="bBox" value="' + bbox.toBBOX() + '" />';
				for (i = 0; i < formParams.length; i++) {
					if (formParams[i].name !== 'bBox') {
						formHtml += '<input type="hidden" name="' + formParams[i].name + '" value="' + formParams[i].value + '" />';
					}
				}
			}
			else {
				formHtml += '<input type="hidden" name="siteid" value="' + siteIds.join(';') + '" />';
			}
			that.dialogEl.find('#map-id-hidden-input-div').append(formHtml);

			that._downloadButtonEl.removeAttr('disabled');
		};

		// Disable the download button. It is only enabled once valid data has been retrieved.
		this._downloadButtonEl.attr('disabled', 'disabled');
		this.dialogEl.dialog('open');

		PORTAL.CONTROLLER.retrieveSiteIdInfo(siteIds, updateFnc, successFnc);
	};
}

