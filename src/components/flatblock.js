import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Loader } from 'components';
import createReactClass from 'create-react-class';

const model = {
    tree: {
        data: {
            content: null,
        },
        status: 'Loading',
    },
};

export const FlatBlock = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        services: PropTypes.shape({
            getFlatpageService: PropTypes.func.isRequired,
        }).isRequired,
        slug: PropTypes.string.isRequired,
    },

    componentWillMount() {
        const { getFlatpageService } = this.props.services;

        const { tree, slug } = this.props;

        getFlatpageService(tree, slug);
    },

    componentWillUnmount() {
        this.props.tree.content.set(null);
    },

    render() {
        const { status, data } = this.props.tree.get();
        const isLoaded = status === 'Succeed';

        return (
            <Loader isLoaded={isLoaded}>
                {isLoaded ? (
                    <div dangerouslySetInnerHTML={{ __html: data.content }} />
                ) : null}
            </Loader>
        );
    },
}));
