import _ from 'lodash';
import {
    buildGetService, buildPostService, defaultHeaders, paramsToString,
} from './base';

export function addReviewService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/reviews/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function getReviewsListService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, params) => {
        const service = buildGetService(
            `/reviews/${paramsToString(params)}`,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}
