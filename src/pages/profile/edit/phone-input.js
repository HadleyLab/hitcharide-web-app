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
        this.state = {
            focused: false,
        };
    }

    onFocus(e) {
        const { onFocus } = this.props;

        if (onFocus) {
            onFocus(e);
        }

        this.setState({
            focused: true,
        });
    }

    onBlur(e) {
        const { onBlur } = this.props;

        if (onBlur) {
            onBlur(e);
        }

        this.setState({
            focused: false,
        });
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
    children: null,
    phoneValue: '',
};
