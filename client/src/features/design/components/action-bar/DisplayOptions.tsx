import PropTypes from 'prop-types';
import useStore from '../../../../store/useStore';

const DisplayOptions = ({ level, isNestedLevel2 = false, levelOneNest }) => {

    const { designAttributes } = useStore();

    if (!designAttributes) {
        return;
    }

    const hasSelectedOption = (attribute) => {
        if (!attribute.options) return false;

        // Check if the current attribute has a selected option that meets the condition
        if (attribute.selectedOption && attribute.options[attribute.selectedOption]?.selectedOption) {
            return true;
        }

        // Check all nested options
        for (const key in attribute.options) {
            const option = attribute.options[key];
            if (typeof option === 'object' && option.selectedOption) {
                if (option.selectedOption) {
                    return true;
                }
            } else if (Array.isArray(attribute.options)) {
                for (const opt of attribute.options) {
                    if (opt.selectedOption) {
                        return true;
                    }
                }
            }
        }

        return false;
    };


    if (level === 0) {
        // Render level 0 options
        if (isNestedLevel2) {
            return Object.entries(designAttributes).map(([attribute, value]) => {
                if (hasSelectedOption(value)) {
                    return (
                        <option key={attribute} value={attribute}>
                            {attribute}
                        </option>
                    );
                }
                return null;
            });
        }

        return Object.entries(designAttributes).map(([attribute, value]) => {
            if (value.selectedOption) {
                return (
                    <option key={attribute} value={attribute}>
                        {attribute}
                    </option>
                );
            }
            return null;
        });

    } else if (level === 1 && levelOneNest) {
        // Render level 1 options
        const parent = designAttributes[levelOneNest];
        if (parent?.options) {
            return Object.entries(parent.options).map(([attribute, value]) => {
                if (value?.selectedOption) {
                    return (
                        <option key={attribute} value={attribute}>
                            {attribute}
                        </option>
                    );
                }
                return null;
            });
        }
    }
    return null;
};

DisplayOptions.propTypes = {
    level: PropTypes.number.isRequired,
    isNestedLevel2: PropTypes.bool,
    levelOneNest: PropTypes.string,
};

export default DisplayOptions;
