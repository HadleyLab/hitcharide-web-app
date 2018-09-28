import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Calendar } from 'components';
import { MyRidesList } from './driver';
import { MyBookingsList } from './passenger';

export const MyRidesPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        userType: PropTypes.string.isRequired,
    },

    renderRides() {
        const isDriver = this.props.userType === 'driver';

        if (isDriver) {
            return <MyRidesList {...this.props} tree={this.props.tree.select('createRide')} />;
        }

        return <MyBookingsList {...this.props} tree={this.props.tree.select('suggestRide')} />;
    },

    render() {
        return (
            <div>
                <Calendar />
                {this.renderRides()}
            </div>
        );
    },
});
