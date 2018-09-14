import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import plusIcon from 'components/icons/plus-circle-empty.svg';
import minusIcon from 'components/icons/minus-circle-empty.svg';
import s from './stepper-input.css';

export class StepperInput extends React.Component {
    constructor(props) {
        super(props);
        this.inc = this.inc.bind(this);
        this.dec = this.dec.bind(this);
    }

    dec() {
        const { minValue, cursor } = this.props;
        const value = cursor.get();

        if (value <= minValue) {
            return;
        }

        cursor.set(value - 1);
    }

    inc() {
        const { maxValue, cursor } = this.props;
        const value = cursor.get();

        if (value >= maxValue) {
            return;
        }

        cursor.set(value + 1);
    }

    render() {
        const {
            title, cursor, minValue, maxValue,
        } = this.props;
        const value = cursor.get();

        return (
            <div className={s.container}>
                <div className={s.title}>{title}</div>
                <div className={s.content}>
                    <div
                        className={classNames(s.button, {
                            [s._disabled]: value === minValue,
                        })}
                        style={{ backgroundImage: `url(${minusIcon})` }}
                        onClick={this.dec}
                    />
                    {value}
                    <div
                        className={classNames(s.button, {
                            [s._disabled]: value === maxValue,
                        })}
                        style={{ backgroundImage: `url(${plusIcon})` }}
                        onClick={this.inc}
                    />
                </div>
            </div>
        );
    }
}

StepperInput.propTypes = {
    title: PropTypes.string.isRequired,
    cursor: BaobabPropTypes.cursor.isRequired,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
};

StepperInput.defaultProps = {};
