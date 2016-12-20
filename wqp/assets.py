
from flask_assets import Environment, Bundle

from . import app

bundles = {
    'custom_less' : Bundle(
        'portal_ui/less/custom.less',
        depends=[
            'portal_ui/less/coverage.less',
            'portal_ui/less/footer.less',
            'portal_ui/less/header.less',
            'portal_ui/less/index.less',
            'portal_ui/less/page_content.less',
            'portal_ui/less/portal_form.less',
            'portal_ui/less/site_nav.less',
            'portal_ui/less/variables.less',
            'portal_ui/less/sites.less'],
        filters='less,cssmin', 
        output='gen/custom.css'),
    'portal_js' : Bundle(
        'portal_ui/js/queryService.js',
        'portal_ui/js/utils.js',
        'portal_ui/js/identifyDialog.js',
        'portal_ui/js/MapConfig.js',
        'portal_ui/js/leafletControls/NldiControl.js',
        'portal_ui/js/leafletControls/SearchControl.js',
        'portal_ui/js/leafletControls/QuerySelectControl.js',
        'portal_ui/js/LeafletMixins/SingleClickEventHandlerMixin.js',
        'portal_ui/js/leafletLayers/WQPSitesLayer.js',
        'portal_ui/js/leafletUtils.js',
        'portal_ui/js/siteMap.js',
        'portal_ui/js/views/portalViews.js',
        'portal_ui/js/portalOnReady.js',
        'portal_ui/js/providers.js',
        'portal_ui/js/portalModels.js',
        'portal_ui/js/nldiModel.js',
        'portal_ui/js/views/downloadFormView.js',
        'portal_ui/js/views/siteMapView.js',
        'portal_ui/js/views/placeInputView.js',
        'portal_ui/js/views/pointLocationInputView.js',
        'portal_ui/js/views/boundingBoxInputView.js',
        'portal_ui/js/views/siteParameterInputView.js',
        'portal_ui/js/views/samplingParameterInputView.js',
        'portal_ui/js/views/biologicalSamplingInputView.js',
        'portal_ui/js/views/dataDetailsView.js',
        'portal_ui/js/views/showAPIView.js',
        'portal_ui/js/views/nldiView.js',
        'portal_ui/js/portalHelp.js',
        'portal_ui/js/stateFIPS.js',
        'portal_ui/js/dateValidator.js',
        'portal_ui/js/downloadProgressDialog.js',
        'portal_ui/js/views/inputValidationView.js',
        'portal_ui/js/portalValidators.js',
        'portal_ui/js/downloadFormController.js',
        'portal_ui/js/hucValidator.js',
        filters='jsmin',
        output='gen/portal.js'),
    'coverage_js' : Bundle(
        'portal_ui/js/LeafletMixins/SingleClickEventHandlerMixin.js',
        'portal_ui/js/leafletLayers/CoverageLayer.js',
        'portal_ui/js/coverage/coverageMap.js',
        'portal_ui/js/coverage/coverageOnReady.js',
        filters='jsmin',
        output='gen/coverage.js'),
    'sites_map': Bundle(
        'portal_ui/js/providerSitesMap.js',
        'portal_ui/js/providerSitesMapOnReady.js',
        filters='jsmin',
        output='gen/sitesMap.js'),
    'site_map': Bundle(
        'portal_ui/js/providerSiteMap.js',
        'portal_ui/js/providerSiteMapOnReady.js',
        filters='jsmin',
        output='gen/siteMap.js')
}
    
assets = Environment(app)
assets.versions = 'hash'
assets.register(bundles)

