import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { CreateRideForm } from './create-ride';
import { SuggestRideForm } from './suggest-ride';

export const NewRidePage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        userType: PropTypes.string.isRequired,
    },

    render() {
        const isDriver = this.props.userType === 'driver';

        if (isDriver) {
            return <CreateRideForm {...this.props} tree={this.props.tree.select('createRide')} />;
        }

        return <SuggestRideForm {...this.props} tree={this.props.tree.select('suggestRide')} />;
    },
});
