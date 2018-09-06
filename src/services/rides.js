import { buildPostService, defaultHeaders } from './base';

export function addRideService(token, cursor, data) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    console.log('data', data);

    const service = buildPostService(
        '/rides/ride/',
        'POST',
        _.identity,
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor, data);
}
