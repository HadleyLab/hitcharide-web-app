import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import s from './input.css';

export const Input = createReactClass({
    displayName: 'Input',

    propTypes: {
        className: PropTypes.string,
        children: PropTypes.any, // eslint-disable-line
    },

    getDefaultProps() {
        return {
            className: null,
        };
    },

    render() {
        const { className, children } = this.props;

        return (
            <div
                className={classNames(s.container, className)}
            >
                {children}
                <div className={s.touchableArea} onClick={() => this.input.focus()} />
                <input
                    {..._.omit(this.props, ['className', 'children'])}
                    ref={(ref) => { this.input = ref; }}
                />
            </div>
        );
    },
});
