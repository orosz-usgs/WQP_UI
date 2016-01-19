
from flask.ext.assets import Environment, Bundle

from . import app

bundles = {
    'custom_less' : Bundle(
        'less/custom.less',
        depends=[
            'less/coverage.less',
            'less/footer.less',
            'less/header.less',
            'less/index.less',
            'less/page_content.less',
            'less/portal_form.less',
            'less/site_nav.less',
            'less/variables.less'],
        filters='less,cssmin', 
        output='gen/custom.css'),
    'portal_js' : Bundle(
        'js/queryService.js',
        'js/map_utils.js',
        'js/utils.js',
        'js/IdentifyDialog.js',
        'js/WQPGetFeature.js',
        'js/SitesLayer.js',
        'js/SiteImportWPSUtils.js',
        'js/PortalDataMap.js',
        'js/portalViews.js',
        'js/onReady.js',
        'js/providers.js',
        'js/portalModels.js',
        'js/DataSourceUtils.js',
        'js/placeInputView.js',
        'js/portalHelp.js',
        'js/stateFIPS.js',
        'js/dateValidator.js',
        'js/downloadProgressDialog.js',
        'js/siteIdController.js',
        'js/inputValidationView.js',
        'js/portalValidators.js',
        'js/downloadFormController.js',
        'js/hucValidator.js',
        filters='jsmin',
        output='gen/portal.js'),
    'coverage_js' : Bundle(
        'js/map_utils.js',
        'js/coverage_map_config.js',
        'js/coverage_map.js',
        filters='jsmin',
        output='gen/coverage.js')
}
    
assets = Environment(app)
#app.config['ASSETS_DEBUG'] = app.config['DEBUG']
assets.register(bundles)
