import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import createReactClass from 'create-react-class';
import moment from 'moment';
import { Search, DateTimePicker } from 'components';
import { MarkerIcon, ClockIcon } from 'components/icons';
import themeImage from './intro.jpg';
import { Button } from '../button';
import s from './intro.css';

const model = {
    tree: {
        cities: {},
        searchForm: {
            cityFrom: null,
            cityTo: null,
            dateTime: null,
        },
    },
};

export const HomeIntroSection = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        token: PropTypes.string,
        services: PropTypes.shape({
            getFlatpageService: PropTypes.func.isRequired,
            getCitiesService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getDefaultProps() {
        return {
            token: null,
        };
    },

    renderIntro() {
        return (
            <div className={s.introMobile} style={{ backgroundImage: `url(${themeImage})` }}>
                <div className={s.introContent}>
                    <div className={s.introTitle}>
                        Where are you going?
                    </div>
                    <div className={s.introSubTitle}>
                        Roadtrips are more fun with company!
                    </div>
                </div>
            </div>
        );
    },

    renderSearchForm() {
        const { token, services, tree } = this.props;
        const { getCitiesService } = services;
        const citiesCursor = tree.cities;
        const formCursor = tree.searchForm;

        return (
            <div className={s.searchWrapper}>
                <div className={s.search}>
                    <Search
                        className={s.field}
                        resultsClassName={s.fieldResult}
                        citiesCursor={citiesCursor}
                        service={getCitiesService}
                        currentValue={formCursor.cityFrom.get()}
                        onChange={(v) => formCursor.cityFrom.set(v)}
                    >
                        <div className={s.icon}>
                            <MarkerIcon color="#6FA6F8" />
                        </div>
                        <div className={s.text}>From </div>
                    </Search>
                    <Search
                        className={s.field}
                        resultsClassName={s.fieldResult}
                        citiesCursor={citiesCursor}
                        service={getCitiesService}
                        currentValue={formCursor.cityTo.get()}
                        onChange={(v) => formCursor.cityTo.set(v)}
                    >
                        <div className={s.icon}>
                            <MarkerIcon color="#97B725" />
                        </div>
                        <div className={s.text}>To </div>
                    </Search>
                    <DateTimePicker
                        className={s.datePicker}
                        value={formCursor.dateTime.get()}
                        onChange={(date) => formCursor.dateTime.set(date)}
                    >
                        <div className={s.dateField}>
                            <div className={s.icon}>
                                <ClockIcon />
                            </div>
                            <div className={s.text}>When </div>
                        </div>
                    </DateTimePicker>
                    <Button to={token ? '/app' : '/search'} className={s.button}>Search a ride</Button>
                </div>
            </div>
        );
    },

    render() {
        return (
            <div className={s.introDesktop} style={{ backgroundImage: `url(${themeImage})` }}>
                {this.renderIntro()}
                {this.renderSearchForm()}
            </div>
        );
    },
}));
