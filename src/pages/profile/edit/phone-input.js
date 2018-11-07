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
        this.state = {
            focused: false,
        };
    }

    onFocus(e) {
        if (e.target.value.length < 1) {
            e.target.value = '1';
            this.onChange(e);
        }

        const { onFocus } = this.props;

        if (onFocus) {
            onFocus(e);
        }

        this.setState({
            focused: true,
        });
    }

    onBlur(e) {
        if (e.target.value.length === 1) {
            e.target.value = '';
            this.onChange(e);
        }

        const { onBlur } = this.props;

        if (onBlur) {
            onBlur(e);
        }

        this.setState({
            focused: false,
        });
    }

    onChange(e) {
        const { onChange } = this.props;

        if (onChange) {
            onChange(e);
        }
    }

    getValue() {
        const { defaultValue } = this.props;

        return defaultValue;
    }

    render() {
        const { focused } = this.state;
        const { phoneValue, children } = this.props;

        return (
            <Input
                {..._.omit(this.props, 'phoneValue')}
                className={classNames(s.phoneInput, {
                    [s._focused]: focused || phoneValue,
                })}
                onChange={this.onChange}
                defaultValue={this.getValue()}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
            >
                {focused || phoneValue ? <span className={s.plus}>+</span> : null}
                {children}
            </Input>
        );
    }
}

PhoneInput.propTypes = {
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    children: PropTypes.node,
    phoneValue: PropTypes.string,
};

PhoneInput.defaultProps = {
    onFocus: () => {},
    onBlur: () => {},
    onChange: () => {},
    children: null,
    phoneValue: '',
};
