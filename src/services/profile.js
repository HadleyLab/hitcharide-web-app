import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function getMyProfileService(token, cursor) {
    const headers = {
        Authorization: `JWT ${token}`,
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

export function updateProfileService(token, cursor, data) {
    const headers = {
        // 'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
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
