import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import schema from 'libs/state';
import createReactClass from 'create-react-class';
import { Loader } from 'components';
import s from './future-rides.css';

const model = {
    tree: {
        rides: {},
    },
};

export const FutureRides = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        services: PropTypes.shape({
            getRidesListService: PropTypes.func.isRequired,
        }).isRequired,
        history: PropTypes.shape({}).isRequired,
        setUserType: PropTypes.func.isRequired,
    },

    async componentWillMount() {
        const { tree, services } = this.props;
        const { getRidesListService } = services;

        await getRidesListService(tree.rides, { limit: 4 });
    },

    onSeeAllRidesClick() {
        const { history, setUserType } = this.props;

        setUserType('passenger');
        history.push('/search');
    },

    onFutureRideClick(ridePk) {
        const { history, setUserType } = this.props;

        setUserType('passenger');
        history.push(`/app/ride/${ridePk}`);
    },

    renderItem({ pk, priceWithFee, cityFrom, cityTo }, index) {
        return (
            <div
                key={index}
                className={s.futureRideItem}
                onClick={() => this.onFutureRideClick(pk)}
            >
                <div className={s.futureRideItemTitle}>
                    {`${cityFrom.name}, ${cityFrom.state.shortName}`}
                    {' - '}
                    {`${cityTo.name}, ${cityTo.state.shortName}`}
                </div>
                <div className={s.futureRideItemPrice}>
                    {priceWithFee}$
                </div>
            </div>
        );
    },

    render() {
        const { data, status } = this.props.tree.rides.get();
        const isLoaded = status === 'Succeed';

        return (
            <Loader isLoaded={isLoaded}>
                {isLoaded ? (
                    <div className={s.futureRidesWrapper}>
                        <div className={s.futureRides}>
                            <div
                                className={s.futureRidesHeader}
                                onClick={this.onSeeAllRidesClick}
                            >
                                <div>
                                    Future rides
                                </div>
                                <div
                                    className={classNames(s.futureRidesHeaderLink, s.futureRidesSeeAllLink)}
                                >
                                    See all rides
                                </div>
                            </div>
                            {data.results.length ? (
                                <div className={s.futureRideItems}>
                                    {_.map(data.results, this.renderItem)}
                                </div>
                            ) : (
                                <div className={s.futureRidesEmpty}>
                                    For the moment, there are no actual rides.
                                </div>
                            )}
                            <div
                                className={classNames(s.futureRidesBottomLink, s.futureRidesSeeAllLink)}
                                onClick={this.onSeeAllRidesClick}
                            >
                                See all rides
                            </div>
                        </div>
                    </div>
                ) : null}
            </Loader>
        );
    }
}));
