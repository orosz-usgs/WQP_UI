
from flask_assets import Environment, Bundle

from . import app

bundles = {
    'nwis_qw_custom_less' : Bundle(
        'portal_ui/less/usgs_theme/custom.less',
        depends=[
            'portal_ui/less/variables.less',
            'portal_ui/less/page_content.less',
            'portal_ui/less/portal_form.less',
            'portal_ui/less/site_nav.less',
            'portal_ui/less/sites.less',
            'portal_ui/less/public_srsnames.less',
            'portal_ui/less/usgs_theme/variables.less',
            'portal_ui/less/usgs_theme/header_footer.less'
        ],
        filters='less,cssmin',
        output='gen/nwis_qw_custom.css'),
    'custom_less' : Bundle(
        'portal_ui/less/wqp_theme/custom.less',
        depends=[
            'portal_ui/less/variables.less',
            'portal_ui/less/coverage.less',
            'portal_ui/less/index.less',
            'portal_ui/less/page_content.less',
            'portal_ui/less/portal_form.less',
            'portal_ui/less/site_nav.less',
            'portal_ui/less/sites.less',
            'portal_ui/less/public_srsnames.less',
            'portal_ui/less/wqp_theme/footer.less',
            'portal_ui/less/wqp_theme/header.less',
            'portal_ui/less/wqp_theme/variables.less',
            ],
        filters='less,cssmin', 
        output='gen/custom.css'),
    'portal_vendor_css': Bundle(
        'vendor/css/select2.css',
        'vendor/css/select2-bootstrap.css',
        'vendor/css/easy-button.css',
        'vendor/css/MarkerCluster.css',
        'vendor/css/MarkerCluster.Default.css',
        filters='cssmin',
        output='gen/portal.css'
    ),
    'common_js' : Bundle(
        'vendor/js/jquery.js',
        'vendor/js/bootstrap.js',
        'vendor/js/loglevel.js',
        filters='jsmin',
        output='gen/common_js_dependencies.js'
    ),
    'portal_js' : Bundle(
        Bundle(
            'vendor/js/underscore.js',
            'vendor/js/select2.full.js',
            'vendor/js/jquery-ui.js',
            'vendor/js/numeral.js',
            'vendor/js/handlebars.js',
            'vendor/js/leaflet.js',
            'vendor/js/leaflet-providers.js',
            'vendor/js/esri-leaflet.js',
            'vendor/js/easy-button.js',
            'vendor/js/leaflet.markercluster.js',
            'vendor/js/leaflet.draw.js'
        ),
        Bundle(
            'portal_ui/js/queryService.js',
            'portal_ui/js/utils.js',
            'portal_ui/js/identifyDialog.js',
            'portal_ui/js/MapConfig.js',
            'portal_ui/js/leafletControls/FeatureSourceSelectControl.js',
            'portal_ui/js/leafletControls/SearchControl.js',
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
            'portal_ui/js/views/nldiNavPopupView.js',
            'portal_ui/js/views/arcGisOnlineHelpView.js',
            'portal_ui/js/portalHelp.js',
            'portal_ui/js/stateFIPS.js',
            'portal_ui/js/dateValidator.js',
            'portal_ui/js/downloadProgressDialog.js',
            'portal_ui/js/views/inputValidationView.js',
            'portal_ui/js/portalValidators.js',
            'portal_ui/js/downloadFormController.js',
            'portal_ui/js/hucValidator.js'
        ),
        filters='jsmin',
        output='gen/portal.js'),
    'coverage_js' : Bundle(
        Bundle(
            'vendor/js/underscore.js',
            'vendor/js/leaflet.js',
            'vendor/js/leaflet-providers.js',
            'vendor/js/esri-leaflet.js',
            'vendor/js/handlebars.js',
            'vendor/js/numeral.js'
        ),
        Bundle(
            'portal_ui/js/LeafletMixins/SingleClickEventHandlerMixin.js',
            'portal_ui/js/leafletLayers/CoverageLayer.js',
            'portal_ui/js/coverage/coverageMap.js',
            'portal_ui/js/coverage/coverageOnReady.js'
        ),
        filters='jsmin',
        output='gen/coverage.js'),
    'site_css' : Bundle(
        'vendor/css/MarkerCluster.Default.css',
        'vendor/css/MarkerCluster.css',
        filters='less,cssmin',
        output='gen/site.css'
    ),
    'sites_map': Bundle(
        Bundle(
            'vendor/js/underscore.js',
            'vendor/js/leaflet.js',
            'vendor/js/leaflet-providers.js',
            'vendor/js/leaflet.markercluster.js',
            'vendor/js/esri-leaflet.js'
        ),
        Bundle(
            'portal_ui/js/generalMapping.js',
            'portal_ui/js/providerSitesMap.js',
            'portal_ui/js/providerSitesMapOnReady.js'
        ),
        filters='jsmin',
        output='gen/sitesMap.js'),
    'site_map': Bundle(
        Bundle(
            'vendor/js/leaflet.js',
            'vendor/js/leaflet-providers.js',
            'vendor/js/leaflet.markercluster.js',
            'vendor/js/esri-leaflet.js'
        ),
        Bundle(
            'portal_ui/js/generalMapping.js',
            'portal_ui/js/providerSiteMap.js',
            'portal_ui/js/nldiMapping.js',
            'portal_ui/js/providerSiteMapOnReady.js'
        ),
        filters='jsmin',
        output='gen/siteMap.js')
}
    
assets = Environment(app)
assets.versions = 'hash'
assets.register(bundles)

