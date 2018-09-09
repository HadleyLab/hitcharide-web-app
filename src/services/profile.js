import _ from 'lodash';
import { getToken } from 'components/utils';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function getMyProfileService(cursor) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildGetService(
        '/accounts/my/',
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor);
}

function hydrateData(profile) {
    let data = new FormData();

    _.forEach(profile, (field, key) => data.append(key, field));

    return data;
}

export function updateProfileService(cursor, data) {
    const headers = {
        // 'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildPostService(
        '/accounts/my/',
        'PUT',
        JSON.stringify,
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor, data);
}
