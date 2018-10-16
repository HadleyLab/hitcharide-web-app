import _ from 'lodash';
import moment from 'moment';
import { Toast } from 'antd-mobile';

/* Form validation */

function formatErrors(errors) {
    let result = {};

    _.forEach(errors, ({ path, message }) => {
        result[path] = message;
    });

    return result;
}

export async function validateForm(schema, data) {
    const result = await schema.validate(data, { abortEarly: false })
        .then((value) => ({
            value,
            isDataValid: true,
        }))
        .catch((errors) => ({
            errors: formatErrors(errors.inner),
            isDataValid: false,
        }));

    return result;
}

export function checkInputError(name, errors) {
    const hasError = _.has(errors, name) && !_.isEmpty(errors[name]);

    return {
        error: hasError,
        onErrorClick: () => {
            if (hasError) {
                Toast.info(_.isArray(errors[name]) ? _.join(errors[name], ' ') : errors[name]);
            }
        },
    };
}

export function checkUnhandledFormErrors(form, errors) {
    return _.join(_.map(errors, (error, key) => {
        if (_.has(form, key)) {
            return null;
        }

        return error;
    }), ' ');
}

/* Token */

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function getToken() {
    return localStorage.getItem('token');
}

export function removeToken() {
    localStorage.removeItem('token');
}

/* Save/read user type to/from localStorage */

export function setUserType(type) {
    localStorage.setItem('userType', type);
}

export function getUserType() {
    return localStorage.getItem('userType');
}

/* */

export function checkIfValueEmpty(value) {
    if (_.isArray(value) || _.isObject(value)) {
        if (_.isEmpty(value)) {
            return true;
        }
    }

    if (_.isNull(value)) {
        return true;
    }

    return false;
}

export function checkIfRideStarted(date) {
    return moment().utc().isSameOrAfter(moment(date).utc(), 'minute');
}
