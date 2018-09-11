import {
    buildGetService, defaultHeaders, dehydrateBundle, paramsToString,
} from './base';

export function getStatesService(cursor, params) {
    const _service = buildGetService(
        `/places/state/${paramsToString(params)}`,
        dehydrateBundle,
        defaultHeaders
    );

    return _service(cursor);
}

export function getCitiesService(cursor, params) {
    const _service = buildGetService(
        `/places/city/${paramsToString(params)}`,
        dehydrateBundle,
        defaultHeaders,
    );

    return _service(cursor);
}
