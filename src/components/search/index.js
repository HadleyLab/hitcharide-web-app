import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Icon } from 'antd-mobile';
import { Input } from 'components';
import s from './search.css';

export class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.currentValue || {
                name: '',
                pk: null,
            },
            loading: false,
            focused: false,
        };
        this.onChangetimeout = null;
        this.onBlurTimeout = null;

        this.onItemClick = this.onItemClick.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    getInitialState() {
        const { currentValue } = this.props;

        return {
            value: currentValue || {
                name: '',
                pk: null,
            },
            loading: false,
            focused: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.currentValue, this.props.currentValue)) {
            this.updateValueFromProps();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.onChangetimeout);
        clearTimeout(this.onBlurTimeout);
        this.resetCities();
    }

    updateValueFromProps() {
        const { currentValue } = this.props;
        const value = currentValue || {
            name: '',
            pk: null,
        };

        this.setState({ value });
    }

    resetCities() {
        const { citiesCursor } = this.props;

        citiesCursor.set({});
        this.setState({ focused: false });
    }

    onChange(city) {
        const { citiesCursor, service } = this.props;

        clearTimeout(this.onChangetimeout);
        this.setState({ loading: true });
        this.selectValue(city);

        this.onChangetimeout = setTimeout(async () => {
            const cityName = _.split(city.name, ',')[0];
            const result = await service(citiesCursor, { search: cityName });

            if (result.status === 'Succeed') {
                this.setState({ loading: false });
            }
        }, 400);
    }

    selectValue(city) {
        this.setState({ value: city });
        this.props.onChange(city);
    }

    displayItem({ name, state }) {
        if (state) {
            return `${name}, ${state.name}`;
        }

        return name;
    }

    getInputProps() {
        return _.omit(this.props, [
            'citiesCursor', 'service', 'children',
            'className', 'resultsClassName', 'resultItemClassName',
            'onChange', 'currentValue', 'showLoader',
        ]);
    }

    onItemClick(item) {
        this.selectValue(item);
        this.onBlurTimeout = setTimeout(() => {
            this.resetCities();
        }, 200);
    }

    onFocus() {
        const { value } = this.state;

        if (value.name) {
            this.onChange(value);
        }

        this.setState({ focused: true });
    }

    onBlur() {
        this.onBlurTimeout = setTimeout(() => {
            this.resetCities();
        }, 200);
    }

    render() {
        const { value, loading, focused } = this.state;
        const {
            citiesCursor, className, children, showLoader,
            resultsClassName, resultItemClassName,
        } = this.props;
        const results = citiesCursor.get();
        const showResults = focused && !_.isEmpty(results) && results.data;
        const isLoading = loading || (!_.isEmpty(results) && results.status === 'Loading');
        const inputProps = this.getInputProps();

        return (
            <Input
                className={classNames(s.container, className)}
                {...inputProps}
                type="text"
                value={this.displayItem(value)}
                onFocus={this.onFocus}
                onChange={(e) => this.onChange({ name: e.target.value, pk: null })}
                onBlur={() => this.onBlur()}
            >
                {children}
                {showLoader && focused && isLoading ? (
                    <div className={s.loader}>
                        <Icon type="loading" size="md" />
                    </div>
                ) : null}
                {showResults ? (
                    <div className={classNames(s.items, resultsClassName)}>
                        {results.data.length > 0
                            ? _.map(results.data, (item, index) => (
                                <div
                                    key={`search-results-${index}`}
                                    className={classNames(s.item, resultItemClassName)}
                                    onClick={() => this.onItemClick(item)}
                                >
                                    {this.displayItem(item)}
                                </div>
                            ))
                            : (
                                <div className={s.item}>
                                    No results found
                                </div>
                            )}
                    </div>
                ) : null}
            </Input>
        );
    }
}

Search.propTypes = {
    citiesCursor: BaobabPropTypes.cursor.isRequired,
    service: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    resultsClassName: PropTypes.string,
    resultItemClassName: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    currentValue: PropTypes.shape({}),
    showLoader: PropTypes.bool,
};

Search.defaultProps = {
    className: null,
    resultsClassName: null,
    resultItemClassName: null,
    children: null,
    showLoader: false,
    currentValue: {
        name: '',
        pk: null,
    },
};
