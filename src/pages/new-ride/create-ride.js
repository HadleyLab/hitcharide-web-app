import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { BaseCreateRideForm } from './base-create-ride';

export const CreateRideForm = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        searchForm: PropTypes.shape({}),
    },

    render() {
        const searchForm = this.props.searchForm;

        return (
            <BaseCreateRideForm
                {...this.props}
                initData={_.pickBy(searchForm, (x) => x)}
            />
        );
    },
});
