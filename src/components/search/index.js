import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Icon } from 'antd-mobile';
import { MarkerIcon, SearchIcon, SearchDeleteIcon, SearchArrowIcon } from 'components/icons';
import { Input } from 'components';
import { hexToRGB, displayCity, displayPlace, displayCityPlace } from 'components/utils';
import s from './search.css';
import airportImage from './images/airport.svg';
import trainImage from './images/train.svg';
import busImage from './images/bus.svg';
import educationalPlaceImage from './images/educational-place.svg';
import cityImage from './images/city.svg';

const model = {
    tree: {
        results: {
            data: [],
            status: 'NotAsked',
        },
    },
};

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.currentValue || {
                city: null,
                place: null,
            },
            inputValue: '',
            focused: false,
        };
        this.onInputChangetimeout = null;
        this.input = null;
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.currentValue, this.props.currentValue)) {
            this.updateValueFromProps();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.onInputChangetimeout);
    }

    updateValueFromProps() {
        const { currentValue } = this.props;

        const value = currentValue || {
            city: null,
            place: null,
        };
        this.setState({ value });
    }

    selectPlace(place) {
        const { value } = this.state;
        const newValue = _.merge({}, value, {
            place,
        });
        this.setState({ value: newValue });
        this.onInputChange('', newValue);
    }

    selectCity(city) {
        // TODO: think about a better place for this line
        this.props.tree.results.set({ data: [], status: 'Loading' });

        const newValue = {
            city,
            place: null,
        };
        this.setState({ value: newValue });
        this.onInputChange('', newValue);
    }

    getPlaceImage({ category }) {
        return {
            ep: educationalPlaceImage,
            bs: busImage,
            ts: trainImage,
            a: airportImage,
        }[category];
    }

    getInputProps() {
        return _.omit(this.props, [
            'tree', 'services', 'children',
            'className', 'resultsClassName', 'resultItemClassName',
            'onChange', 'currentValue', 'color', 'label',
        ]);
    }

    onInputChange(inputValue, value) {
        clearTimeout(this.onInputChangetimeout);
        this.setState({ inputValue });
        this.input.focus();

        if (value.city && value.place) {
            return;
        }

        const { services } = this.props;
        const resultsCursor = this.props.tree.results;

        this.onInputChangetimeout = setTimeout(async () => {
            const service = value.city ? services.getPlacesService : services.getCitiesService;
            const searchParams = _.merge(
                {
                    search: inputValue,
                },
                value.city ? { city: value.city.pk } : {},
            );
            await service(resultsCursor, searchParams);
        }, 400);
    }

    onFocus(event) {
        const { onFocus } = this.props;
        if (onFocus) {
            onFocus(event);
        }
        this.showResults();
    }

    onKeyDown(event, value) {
        if (event.which === 13 || event.keyCode === 13) {
            this.syncAndHideResults();
        }

        if (event.which === 8 || event.keyCode === 8) {
            if (event.target.value === '') {
                if (value.place) {
                    this.selectPlace(null);
                } else {
                    this.selectCity(null);
                }
            }
        }
    }

    showResults() {
        this.setState({ focused: true });
    }

    syncAndHideResults() {
        const { onChange } = this.props;
        const { value } = this.state;

        this.setState({ focused: false });
        this.props.tree.set(model.tree);

        onChange(value);
    }

    renderLabel() {
        const { value } = this.state;

        return _.concat(
            this.props.children,
            [(
                <div key="value" className={s.valueContainer}>
                    <div className={s.value}>
                        <div className={s.valueText}>
                            {displayCityPlace(value.city, value.place)}
                        </div>
                    </div>
                </div>
            )]
        );
    }

    renderFocusedLabel() {
        const { value } = this.state;
        const { color } = this.props;
        const results = this.props.tree.results.get();
        const isLoading = results.status === 'Loading';

        const tagStyle = {
            color,
            borderColor: color,
            backgroundColor: hexToRGB(color, 0.1),
        };

        return [
            isLoading ? (
                <div key="icon" className={s.loaderIcon}>
                    <Icon type="loading" size="md" />
                </div>
            ) : (
                <div key="icon" className={s.icon}>
                    <SearchIcon color={color} />
                </div>
            ),
            (
                <div key="value" className={s.tagsContainer}>
                    {value.city ? (
                        <div className={s.tag} style={tagStyle}>
                            <div className={s.tagText}>
                                {displayCity(value.city)}
                            </div>
                            {value.place ? (
                                <div className={s.tagIcon}>
                                    <SearchArrowIcon color={color} />
                                </div>
                            ) : (
                                <div
                                    className={s.tagIcon}
                                    onClick={() => this.selectCity(null)}
                                >
                                    <SearchDeleteIcon color={color}
                                    />
                                </div>
                            )}
                        </div>
                    ) : null}

                    {value.place ? (
                        <div className={s.tag} style={tagStyle}>
                            <div className={s.tagText}>
                                {displayPlace(value.place)}
                            </div>
                            <div
                                className={s.tagIcon}
                                onClick={() => this.selectPlace(null)}
                            >
                                <SearchDeleteIcon color={color}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            ),
        ];
    }

    renderPlaceItem(place) {
        return [
            (
                <div key="icon" className={s.itemIcon}>
                    <img className={s.itemIconImage} src={this.getPlaceImage(place)} />
                </div>
            ),
            (
                <div key="text" className={s.itemTextWrapper}>
                    <div className={s.itemText}>
                        {displayPlace(place)}
                    </div>
                </div>
            ),
        ];
    }

    renderCityItem(city) {
        return [
            (
                <div key="icon" className={s.itemIcon}>
                    <img className={s.itemIconImage} src={cityImage} />
                </div>
            ),
            (
                <div key="text" className={s.itemTextWrapper}>
                    <div className={s.itemText}>
                        {displayCity(city)}
                    </div>
                </div>
            ),
        ];
    }

    renderResults() {
        const { value, focused } = this.state;
        const { resultsClassName, resultItemClassName } = this.props;
        const results = this.props.tree.results.get();

        const isLoading = results.status === 'Loading';
        const isLoaded = results.status === 'Succeed';
        const isSearchResultsShown = (isLoading && results.data.length) || isLoaded;

        if (!focused) {
            return;
        }

        return (
            <div className={classNames(s.items, resultsClassName)}>
                {value.city ? (
                    <div
                        key="selected-city"
                        className={classNames(s.item, resultItemClassName)}
                        onClick={() => this.syncAndHideResults()}
                    >
                        {this.renderCityItem(value.city)}
                        <div
                            className={s.itemRightIcon}
                            onClick={(event) => {
                                event.stopPropagation();
                                this.selectCity(null);
                            }}
                        >
                            <SearchDeleteIcon color="#C7C7CC" size="big" />
                        </div>
                    </div>
                ) : null}
                {value.place ? (
                    <div
                        key="selected-place"
                        className={classNames(s.item, resultItemClassName)}
                        onClick={() => this.syncAndHideResults()}
                    >
                        {this.renderPlaceItem(value.place)}
                        <div
                            className={s.itemRightIcon}
                            onClick={(event) => {
                                event.stopPropagation();
                                this.selectPlace(null)
                            }}
                        >
                            <SearchDeleteIcon color="#C7C7CC" size="big" />
                        </div>
                    </div>
                ) : null}
                {!(value.city && value.place) && isSearchResultsShown ? (
                    <div>
                        {results.data.length > 0
                            ? _.map(results.data, (item, index) => (
                                <div
                                    key={`search-results-${index}`}
                                    className={classNames(s.item, resultItemClassName)}
                                    onClick={() => value.city ? this.selectPlace(item) : this.selectCity(item)}
                                >
                                    {value.city ? this.renderPlaceItem(item) : this.renderCityItem(item)}
                                    <div className={s.itemRightIcon}>
                                        <SearchArrowIcon color="#C7C7CC" size="big" />
                                    </div>
                                </div>
                            ))
                            : (
                                <div className={s.item}>
                                    {isLoaded ? (
                                        <div>
                                            No results found
                                        </div>
                                    ) : null}
                                </div>
                            )}
                    </div>
                ): null}
            </div>
        );
    }

    render() {
        const { value, focused } = this.state;
        const { className } = this.props;

        const inputProps = this.getInputProps();

        return (
            <div>
                {focused ? (
                    <div
                        className={s.mask}
                        onClick={() => this.syncAndHideResults()}
                    />
                ) : null}
                <Input
                    className={classNames(
                        s.container,
                        className,
                        {
                            [s._focused]: focused,
                        })
                    }
                    {...inputProps}
                    visible={focused}
                    type="text"
                    value={this.state.inputValue}
                    onFocus={(event) => this.onFocus(event)}
                    onChange={(event) => this.onInputChange(event.target.value, value)}
                    onKeyDown={(event) => this.onKeyDown(event, value)}
                    ref={(ref) => { this.input = ref; }}
                >
                    {focused ? this.renderFocusedLabel() : this.renderLabel()}
                    {this.renderResults()}
                </Input>
            </div>
        );
    }
}

Search.propTypes = {
    tree: BaobabPropTypes.cursor.isRequired,
    services: PropTypes.shape({
        getCitiesService: PropTypes.func.isRequired,
        getPlacesService: PropTypes.func.isRequired,
    }).isRequired,
    color: PropTypes.string.isRequired,
    className: PropTypes.string,
    resultsClassName: PropTypes.string,
    resultItemClassName: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    currentValue: PropTypes.shape({}),
};

Search.defaultProps = {
    className: null,
    resultsClassName: null,
    resultItemClassName: null,
    children: null,
    currentValue: {
        city: null,
        place: null
    },
};

const WrappedSearch = schema(model)(Search);

export { WrappedSearch as Search };
