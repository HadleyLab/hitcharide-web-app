import _ from 'lodash';

export function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    return response.json().then((data) => {
        const error = new Error(response.statusText);
        error.response = response;
        error.data = data;
        throw error;
    });
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
};

export const url = 'http://192.168.11.254:8000';

export function buildGetService(
    path,
    dehydrate = _.identity,
    headers = defaultHeaders
) {
    return async (cursor) => {
        cursor.set('status', 'Loading');
        let result = {};

        try {
            let response = await fetch(`${url}${path}`,
                { headers }).then(checkStatus);
            const data = await response.json();
            const dehydratedData = await dehydrate(data);
            result = {
                data: dehydratedData,
                status: 'Succeed',
            };
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
        }
        cursor.set(result);
        return result;
    };
}

export function buildPostService(
    path,
    method = 'POST',
    hydrate = JSON.stringify,
    dehydrate = _.identity,
    headers = defaultHeaders
) {
    return async (cursor, data) => {
        cursor.set('status', 'Loading');
        let result = {};

        const body = await hydrate(data);
        const payload = {
            body,
            method,
            headers,
        };

        try {
            let response = await fetch(`${url}${path}`, payload).then(checkStatus);
            let dehydratedData = cursor.get('data');
            if (response.status !== 204) {
                const respData = await response.json();
                dehydratedData = await dehydrate(respData);
            }
            result = {
                status: 'Succeed',
                data: dehydratedData,
            };
            cursor.set(result);
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
            cursor.set('error', result.error);
            cursor.set('status', result.status);
        }
        return result;
    };
}

export function wrapItemsAsRemoteData(items) {
    return _.map(items, (data) => ({
        data,
        status: 'Succeed',
    }));
}

export function dehydrateBundle(bundle) {
    return bundle.results;
}

export function paramsToString(params) {
    let paramsRow = '?';

    _.forEach(params, (value, key) => {
        paramsRow += `${key}=${value}`;
    });

    return paramsRow;
}
