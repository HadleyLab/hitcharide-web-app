import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Title, Loader } from 'components';
import createReactClass from 'create-react-class';
import s from './flatpage.css';

const model = {
    tree: {
        data: {
            content: null,
        },
        status: 'Loading',
    },
};

export const FlatPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        services: PropTypes.shape({
            getFlatpageService: PropTypes.func.isRequired,
        }).isRequired,
    },

    componentDidMount() {
        const { getFlatpageService } = this.props.services;

        const { tree, match } = this.props;
        const { params } = match;
        const { slug } = params;

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
                    <div className={s.container}>
                        <div className={s.content}>
                            <div dangerouslySetInnerHTML={{ __html: data.content }} />
                        </div>
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
