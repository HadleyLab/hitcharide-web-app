import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { FlatBlock } from 'components';
import s from './flatpage.css';

export const FlatPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        services: PropTypes.shape({
            getFlatpageService: PropTypes.func.isRequired,
        }).isRequired,
        match: PropTypes.shape({}),
    },

    render() {
        const { tree, match, services } = this.props;
        const { params } = match;
        const { slug } = params;
        return (
            <div className={s.container}>
                <div className={s.content}>
                    <FlatBlock
                        services={services}
                        tree={tree}
                        slug={slug}
                    />
                </div>
            </div>
        );
    },
});
