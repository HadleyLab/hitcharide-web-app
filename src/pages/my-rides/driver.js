import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { RideItem } from 'components';
import schema from 'libs/state';
import { Button, Icon } from 'antd-mobile';
import s from './my-rides.css';

const paginationParams = {
    limit: 20,
    offset: 0,
};

const model = {
    tree: {
        rides: {},
        params: paginationParams,
    },
};

export const MyRidesList = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getMyRidesListService: PropTypes.func.isRequired,
        }),
    },

    componentDidMount() {
        const { history } = this.props;
        const rides = this.props.tree.rides.get();

        if (history.action === 'POP' && !_.isEmpty(rides)) {
            return;
        }

        this.props.tree.params.set(paginationParams);
        this.loadRides(paginationParams);
    },

    async loadRides(params, dehydrateParams) {
        const { getMyRidesListService } = this.context.services;

        const cursor = this.props.tree.rides;
        await getMyRidesListService(cursor, params, dehydrateParams);
    },

    async loadMore() {
        const cursor = this.props.tree.rides;
        const { limit, offset: prevOffset } = this.props.tree.params.get();
        const offset = prevOffset + limit;

        await this.props.tree.params.offset.set(offset);

        this.loadRides(
            { limit, offset },
            {
                toMerge: true,
                previousResults: cursor.data.get('results'),
            }
        );
    },

    renderRides() {
        const cursor = this.props.tree.rides;
        const ridesData = cursor.get() || {};
        const { data, status } = ridesData;

        if (_.isEmpty(ridesData) || !data || status !== 'Succeed') {
            return null;
        }

        const { results: rides, next } = data;

        if (rides.length === 0) {
            return (
                <div className={s.noResults}>
                    No rides found
                </div>
            );
        }

        return (
            <div
                className={classNames(s.rides, {
                    [s._withLast]: !next,
                })}
            >
                {_.map(rides, (ride, index) => (
                    <RideItem
                        key={`ride-${index}`}
                        data={ride}
                        history={this.props.history}
                    />
                ))}
            </div>
        );
    },

    renderFooter() {
        const rides = this.props.tree.rides.get();
        const ridesData = rides || {};

        if (_.isEmpty(ridesData)) {
            return null;
        }

        const { data, status } = ridesData;

        if (!data || status !== 'Succeed') {
            return (
                <div className={s.footer}>
                    <Icon type="loading" size="md" />
                </div>
            );
        }

        const { next } = data;

        if (next) {
            return (
                <div className={s.footer}>
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.loadMore}
                    >
                        Load more
                    </Button>
                </div>
            );
        }

        return null;
    },

    render() {
        return (
            <div className={s.container}>
                {this.renderRides()}
                {this.renderFooter()}
            </div>
        );
    },
}));
