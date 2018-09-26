import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Tabs } from 'antd-mobile';
import { Calendar } from 'components';
import { MyRidesList } from './driver';
import { MyBookingsList } from './passenger';
import s from './my-rides.css';

const tabs = [
    { title: 'List', sub: '0' },
    { title: 'Calendar', sub: '1' },
];

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
            <Tabs
                tabs={tabs}
                initialPage={0}
                renderTab={(tab) => <span>{tab.title}</span>}
            >
                <div className={s.tab}>
                    {this.renderRides()}
                </div>
                <div className={s.tab}>
                    <Calendar />
                </div>
            </Tabs>
        );
    },
});
