import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import schema from 'libs/state';
import createReactClass from 'create-react-class';
import moment from 'moment';
import { Search, DateTimePicker } from 'components';
import { MarkerIcon, ClockIcon } from 'components/icons';
import themeImage from './intro.png';
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
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
        }).isRequired,
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
        const { getCitiesService } = this.props.services;
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.searchForm;

        return (
            <div className={s.searchWrapper}>
                <div className={s.search}>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('cityFrom')}
                        valueCursor={formCursor.cityFrom}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => formCursor.cityFrom.set(v)}
                        className={s.field}
                        itemsClassName={s.fieldResult}
                    >
                        <div className={s.icon}>
                            <MarkerIcon color="#6FA6F8" />
                        </div>
                        <div className={s.text}>From </div>
                    </Search>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('cityTo')}
                        valueCursor={formCursor.cityTo}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => formCursor.cityTo.set(v)}
                        className={s.field}
                        itemsClassName={s.fieldResult}
                    >
                        <div className={s.icon}>
                            <MarkerIcon color="#97B725" />
                        </div>
                        <div className={s.text}>To </div>
                    </Search>
                    <DateTimePicker
                        className={s.datePicker}
                        value={formCursor.dateTime.get()}
                        onChange={(date) => formCursor.dateTime.set(moment(date).toDate())}
                    >
                        <div className={s.dateField}>
                            <div className={s.icon}>
                                <ClockIcon />
                            </div>
                            <div className={s.text}>When </div>
                        </div>
                    </DateTimePicker>
                    <div className={classNames(s.button, s._full)}>Search a ride</div>
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
