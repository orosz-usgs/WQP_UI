import { CodeSelect, PagedCodeSelect } from './portalViews';
import { getAnchorQueryValues} from '../utils';

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the biological sampling parameter inputs are contained
 *      @prop {CachedCodes} assemblageModel
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
            new CodeSelect(
                $assemblage,
                {
                    model : this.assemblageModel
                },
                {},
                getAnchorQueryValues($assemblage.attr('name'))
            );
        });
        new PagedCodeSelect(
            $taxonomicName,
            {
                codes: 'subjecttaxonomicname'
            },
            {
                closeOnSelect : false
            },
            null,
            null,
            getAnchorQueryValues($taxonomicName.attr('name'))
        );

        return fetchComplete;
    }

    resetContainer() {
        let $inputs = this.$container.find(':input[name]');
        $inputs.val('');
        $inputs.trigger('change');
    }
}
