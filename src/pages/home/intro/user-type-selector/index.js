import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import { DriverIcon, TravelerIcon } from 'components/icons';
import s from './user-type-selector.css';

export const UserTypeSelector = createReactClass({
    propTypes: {
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
    },

    render() {
        const { onChange, value: currentValue, className } = this.props;

        const options = [
            {
                value: 'passenger',
                IconComponent: TravelerIcon,
            },
            {
                value: 'driver',
                IconComponent: DriverIcon,
            },
        ];

        return (
            <div className={classNames(s.container, className)}>
                {_.map(options, ({ value, IconComponent }) => {
                    const isActive = value === currentValue;

                    return (
                        <div
                            key={value}
                            className={classNames(s.button, { [s._active]: isActive })}
                            onClick={() => onChange(value)}
                        >
                            <div className={s.userIcon}>
                                <IconComponent
                                    color={isActive ? '#FFF' : '#BFBFBF'}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    },
});
