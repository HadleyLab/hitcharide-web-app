import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import warningIcon from 'components/icons/warning.svg';
import s from './input.css';

export const Input = createReactClass({
    displayName: 'Input',

    propTypes: {
        className: PropTypes.string,
        error: PropTypes.bool,
        onErrorClick: PropTypes.func,
        children: PropTypes.any, // eslint-disable-line
    },

    getDefaultProps() {
        return {
            className: null,
            error: false,
            onErrorClick: () => null,
        };
    },

    render() {
        const {
            className, children, error, onErrorClick,
        } = this.props;

        return (
            <div
                className={classNames(s.container, className, {
                    [s._error]: error,
                })}
            >
                {children}
                <div className={s.touchableArea} onClick={() => this.input.focus()} />
                <input
                    {..._.omit(this.props, ['className', 'children', 'error', 'onErrorClick'])}
                    ref={(ref) => { this.input = ref; }}
                />
                {error
                    ? (
                        <div
                            className={s.warning}
                            style={{ backgroundImage: `url(${warningIcon})` }}
                            onClick={onErrorClick}
                        />
                    ) : null}
            </div>
        );
    },
});
