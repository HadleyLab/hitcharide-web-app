import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { checkUnhandledFormErrors } from 'components/utils';
import s from './error.css';

export class Error extends React.Component {
    render() {
        const {
            form, errors, style, className,
        } = this.props;
        const error = checkUnhandledFormErrors(form, errors);

        if (_.trim(error)) {
            return (
                <div
                    className={classNames(s.error, className)}
                    style={style}
                >
                    {error}
                </div>
            );
        }

        return null;
    }
}

Error.propTypes = {
    form: PropTypes.shape(),
    errors: PropTypes.shape(),
    className: PropTypes.string,
    style: PropTypes.shape(),
};

Error.defaultProps = {
    form: {},
    errors: {},
    className: '',
    style: {},
};
