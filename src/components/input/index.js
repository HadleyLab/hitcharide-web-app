import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import warningIcon from 'components/icons/warning.svg';
import eyeIcon from 'components/icons/eye.svg';
import s from './input.css';

export const Input = createReactClass({
    displayName: 'Input',

    propTypes: {
        onChange: PropTypes.func,
        className: PropTypes.string,
        children: PropTypes.node,
        error: PropTypes.bool,
        onErrorClick: PropTypes.func,
        disabled: PropTypes.bool,
        type: PropTypes.string,
    },

    getDefaultProps() {
        return {
            onChange: () => {},
            className: null,
            children: '',
            error: false,
            onErrorClick: () => null,
            disabled: false,
            type: 'text',
        };
    },

    getInitialState() {
        return {
            showPassword: false,
            value: '',
        };
    },

    showPassword() {
        this.setState({ showPassword: true });
    },

    hidePassword() {
        this.setState({ showPassword: false });
    },

    onChange(e) {
        const { onChange } = this.props;

        if (onChange) {
            onChange(e);
        }

        this.setState({ value: e.target.value });
    },

    render() {
        const { showPassword, value } = this.state;
        const {
            className, children, error, onErrorClick, disabled, type: defaultType,
        } = this.props;
        const isPassword = defaultType === 'password';
        const type = showPassword ? 'text' : defaultType;

        return (
            <div
                className={classNames(s.container, className, {
                    [s._error]: error,
                    [s._disabled]: disabled,
                })}
            >
                {children}
                <div className={s.touchableArea} onClick={() => this.input.focus()} />
                <input
                    {..._.omit(this.props, ['className', 'children', 'error', 'onErrorClick'])}
                    type={type}
                    onChange={this.onChange}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    ref={(ref) => { this.input = ref; }}
                />
                {isPassword && value ? (
                    <div
                        className={classNames(s.icon, {
                            [s._active]: showPassword,
                        })}
                        style={{ backgroundImage: `url(${eyeIcon})` }}
                        onTouchStart={this.showPassword}
                        onMouseDown={this.showPassword}
                        onTouchEnd={this.hidePassword}
                        onMouseUp={this.hidePassword}
                        onMouseLeave={this.hidePassword}
                    />
                ) : null}
                {error
                    ? (
                        <div
                            className={s.icon}
                            style={{ backgroundImage: `url(${warningIcon})` }}
                            onClick={onErrorClick}
                        />
                    ) : null}
            </div>
        );
    },
});
