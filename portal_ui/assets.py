
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
        'js/utils.js',
        'js/identifyDialog.js',
        'js/MapConfig.js',
        'js/ol3Utils/mapUtils.js',
        'js/map/BoxIdentifyControl.js',
        'js/map/siteLayer.js',
        'js/map/siteMap.js',
        'js/views/portalViews.js',
        'js/portalOnReady.js',
        'js/providers.js',
        'js/portalModels.js',
        'js/DataSourceUtils.js',
        'js/views/downloadFormView.js',
        'js/views/siteMapView.js',
        'js/views/placeInputView.js',
        'js/views/pointLocationInputView.js',
        'js/views/boundingBoxInputView.js',
        'js/views/siteParameterInputView.js',
        'js/views/samplingParameterInputView.js',
        'js/views/biologicalSamplingInputView.js',
        'js/views/dataDetailsView.js',
        'js/portalHelp.js',
        'js/stateFIPS.js',
        'js/dateValidator.js',
        'js/downloadProgressDialog.js',
        'js/views/inputValidationView.js',
        'js/portalValidators.js',
        'js/downloadFormController.js',
        'js/hucValidator.js',
        filters='jsmin',
        output='gen/portal.js'),
    'coverage_js' : Bundle(
        'js/MapConfig.js',
        'js/map_utils.js',
        'js/coverage_map_config.js',
        'js/coverage_map.js',
        filters='jsmin',
        output='gen/coverage.js')
}
    
assets = Environment(app)
#app.config['ASSETS_DEBUG'] = app.config['DEBUG']
assets.register(bundles)
