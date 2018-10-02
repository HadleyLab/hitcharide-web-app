import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import moment from 'moment';

export const Timer = createReactClass({
    propTypes: {
        onTimeExpired: PropTypes.func.isRequired,
        date: PropTypes.string.isRequired,
        intervalInMinutes: PropTypes.number.isRequired,
    },

    getInitialState() {
        return {
            seconds: this.getSeconds(),
        };
    },

    componentDidMount() {
        this.startTimer();
    },

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },

    timer: null,

    getSeconds() {
        const { date, intervalInMinutes } = this.props;
        const seconds = intervalInMinutes * 60;
        const expiration = moment(date).utc().add(seconds, 'seconds');

        return moment(expiration).utc().diff(moment().utc(), 'seconds');
    },

    startTimer() {
        this.timer = setInterval(() => {
            const { seconds } = this.state;

            if (seconds !== 0) {
                this.setState({ seconds: seconds - 1 });
            } else {
                this.props.onTimeExpired();
            }
        }, 1000);
    },

    displayTime(seconds) {
        const mod = seconds % 60;

        return `${Math.floor(seconds / 60)}:${mod < 10 ? `0${mod}` : mod}`;
    },

    render() {
        const { seconds } = this.state;

        return this.displayTime(seconds);
    },
});
