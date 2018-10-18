import React from 'react';
import createReactClass from 'create-react-class';
import BaobabPropTypes from 'baobab-prop-types';
import PropTypes from 'prop-types';
import schema from 'libs/state';
import { Loader } from 'components';

const model = {
    content: null,
};

export default schema(model)(createReactClass({
    displayName: 'FlatBlock',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        service: PropTypes.func.isRequired,
        slug: PropTypes.string.isRequired,
    },

    componentDidMount() {
        const { service, slug, tree } = this.props;

        service(tree.content, slug);
    },

    componentWillUnmount() {
        this.props.tree.content.set(null);
    },

    render() {
        const content = this.props.tree.content.get();
        const isLoaded = content && content.status === 'Succeed';

        return (
            <Loader isLoaded={isLoaded}>
                {isLoaded ? (
                    <div dangerouslySetInnerHTML={{ __html: content.data.content }} /> // eslint-disable-line
                ) : null }
            </Loader>
        );
    },
}));
