var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the biological sampling parameter inputs are contained
 *      @prop {PORTAL.MODELS.cachedCodes} assemblageModel
 * @return {Object}
 *      @func initialize
 */
export default class BiologicalSamplingInputView {
    constructor({$container, assemblageModel}) {
        this.$container = $container;
        this.assemblageModel = assemblageModel;
    }

    initialize() {
        var $assemblage = this.$container.find('#assemblage');
        var $taxonomicName = this.$container.find('#subject-taxonomic-name');

        var fetchAssemblageModel = this.assemblageModel.fetch();
        var fetchComplete = $.when(fetchAssemblageModel);

        fetchAssemblageModel.done(() => {
            PORTAL.VIEWS.createCodeSelect($assemblage, {model : this.assemblageModel});
        });
        PORTAL.VIEWS.createPagedCodeSelect($taxonomicName, {codes: 'subjecttaxonomicname'},
            {closeOnSelect : false}
        );

        return fetchComplete;
    }
}
