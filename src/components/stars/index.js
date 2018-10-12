import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { StarIcon } from 'components/icons';
import s from './stars.css';

export const Stars = createReactClass({
    propTypes: {},

    render() {
        const rate = 4.6;
        const starsWidth = 90;

        return (
            <div className={s.container}>
                <div className={classNames(s.stars, s._blank)}>
                    {_.map(_.range(0, 5), (star, index) => (
                        <div className={s.star} key={`star-${index}`}>
                            <StarIcon />
                        </div>
                    ))}
                </div>
                <div
                    className={classNames(s.stars, s._filled)}
                    style={{ width: `${rate / 5 * starsWidth}px` }}
                >
                    {_.map(_.range(0, 5), (star, index) => (
                        <div className={s.star} key={`star-${index}`}>
                            <StarIcon color="#007AFF" />
                        </div>
                    ))}
                </div>
            </div>
        );
    },
});

export const ClickableStars = createReactClass({
    propTypes: {
        rating: PropTypes.number,
        onChange: PropTypes.func,
        clickable: PropTypes.bool,
    },

    getDefaultProps() {
        return {
            rating: 0,
            onChange: null,
            clickable: false,
        };
    },

    getInitialState() {
        return {
            value: this.props.rating,
            starsWidth: 160,
        };
    },

    componentDidMount() {
        this.checkWindowSize();
        window.addEventListener('resize', this.checkWindowSize, false);
    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkWindowSize);
    },

    checkWindowSize() {
        if (window.outerWidth <= 320) {
            this.setState({ starsWidth: 120 });
        } else {
            this.setState({ starsWidth: 160 });
        }
    },

    onStarClick(index) {
        const value = index + 1;
        const { clickable } = this.props;

        if (!clickable) {
            return;
        }

        this.setState({ value });
        this.props.onChange(value);
    },

    render() {
        const { value, starsWidth } = this.state;

        return (
            <div className={s.container}>
                <div className={classNames(s.stars, s._big, s._blank)}>
                    {_.map(_.range(0, 5), (star, index) => (
                        <div
                            className={s.star}
                            key={`star-blank-${index}`}
                            onClick={() => this.onStarClick(index)}
                        >
                            <StarIcon color={index === 0 ? '#CADEF3' : '#e5eff9'} />
                        </div>
                    ))}
                </div>
                <div
                    className={classNames(s.stars, s._big, s._filled)}
                    style={{ width: `${value / 5 * starsWidth}px` }}
                >
                    {_.map(_.range(0, 5), (star, index) => (
                        <div
                            className={s.star}
                            key={`star-${index}`}
                            onClick={() => this.onStarClick(index)}
                        >
                            <StarIcon color="#4263CA" />
                        </div>
                    ))}
                </div>
            </div>
        );
    },
});
