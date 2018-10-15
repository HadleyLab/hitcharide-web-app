import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { StarIcon } from 'components/icons';
import s from './stars.css';

export const Stars = createReactClass({
    propTypes: {
        rating: PropTypes.number,
        className: PropTypes.string,
        onChange: PropTypes.func,
        clickable: PropTypes.bool,
        small: PropTypes.bool,
        blankColor: PropTypes.string,
        fillColor: PropTypes.string,
    },

    getDefaultProps() {
        return {
            rating: 0,
            className: null,
            onChange: null,
            clickable: false,
            small: false,
            blankColor: '#e5eff9',
            fillColor: '#4263CA',
        };
    },

    getInitialState() {
        return {
            value: this.props.rating,
            starsWidth: this.props.small ? 90 : 160,
        };
    },

    componentDidMount() {
        const { small } = this.props;

        if (small) {
            return;
        }

        this.checkWindowSize();
        window.addEventListener('resize', this.checkWindowSize, false);
    },

    componentWillUnmount() {
        const { small } = this.props;

        if (small) {
            return;
        }

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

    getBlankColor(index) {
        const { small, blankColor } = this.props;

        if (!small && index === 0) {
            return '#CADEF3';
        }

        return blankColor;
    },

    render() {
        const { value, starsWidth } = this.state;
        const { className, small, fillColor } = this.props;

        return (
            <div
                className={classNames(s.container, className, {
                    [s._big]: !small,
                })}
            >
                <div className={classNames(s.stars, s._blank)}>
                    {_.map(_.range(0, 5), (star, index) => (
                        <div
                            className={s.star}
                            key={`star-blank-${index}`}
                            onClick={() => this.onStarClick(index)}
                        >
                            <StarIcon color={this.getBlankColor(index)} />
                        </div>
                    ))}
                </div>
                <div
                    className={classNames(s.stars, s._filled)}
                    style={{ width: `${value / 5 * starsWidth}px` }}
                >
                    {_.map(_.range(0, 5), (star, index) => (
                        <div
                            className={s.star}
                            key={`star-${index}`}
                            onClick={() => this.onStarClick(index)}
                        >
                            <StarIcon color={fillColor} />
                        </div>
                    ))}
                </div>
            </div>
        );
    },
});
