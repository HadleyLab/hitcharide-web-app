import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Input } from 'components';
import s from './edit.css';

export class PhoneInput extends React.Component {
    constructor(props) {
        super(props);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onFocus(e) {
        if (!e.target.value.length) {
            this.syncValue('1');
        }

        const { onFocus } = this.props;

        if (onFocus) {
            onFocus(e);
        }
    }

    onBlur(e) {
        if (!e.target.value.length) {
            this.syncValue('');
        }

        const { onBlur } = this.props;

        if (onBlur) {
            onBlur(e);
        }
    }

    onChange(e) {
        const value = this.transformValue(e.target.value);

        this.syncValue(value);
    }

    onKeyPress(e) {
        const value = e.target.value;
        const isString = e.which < 48 || e.which > 57;
        const isFull = value && value.length >= 10;

        if (isString || isFull) {
            e.preventDefault();
        }
    }

    syncValue(value) {
        const { onChange } = this.props;

        if (onChange) {
            onChange({ target: { value } });
        }
    }

    transformValue(value) {
        return '1' + value;
    }

    transformDisplay(value) {
        return value ? value.slice(1) : '';
    }

    render() {
        const { defaultValue, children } = this.props;
        const value = this.transformDisplay(defaultValue);

        return (
            <Input
                {..._.omit(this.props, 'defaultValue')}
                className={classNames(s.phoneInput, {
                    [s._focused]: defaultValue,
                })}
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onKeyPress={this.onKeyPress}
                value={value}
            >
                {defaultValue ? <span className={s.plus}>+1</span> : null}
                {children}
            </Input>
        );
    }
}

PhoneInput.propTypes = {
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    children: PropTypes.node,
    defaultValue: PropTypes.string,
};

PhoneInput.defaultProps = {
    onFocus: () => {},
    onBlur: () => {},
    onChange: () => {},
    children: null,
    defaultValue: '',
};
