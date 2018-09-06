import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Input } from 'components';
import s from './search.css';

export const Search = createReactClass({
    displayName: 'Search',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        service: PropTypes.func.isRequired,
        valueCursor: BaobabPropTypes.cursor.isRequired,
        onItemSelect: PropTypes.func.isRequired,
        displayItem: PropTypes.func.isRequired,
        className: PropTypes.string,
        itemClassName: PropTypes.string,
        selectedValue: PropTypes.object, // eslint-disable-line
        children: PropTypes.any, // eslint-disable-line
    },

    getDefaultProps() {
        return {
            className: null,
            itemClassName: null,
        };
    },

    getInitialState() {
        return {
            value: '',
            focused: false,
            preventBlur: false,
        };
    },

    componentDidUpdate(prevProps, prevState) {
        const { preventBlur } = this.state;
        const { selectedValue, displayItem } = this.props;
        // const selectedValue = valueCursor.get();
        const value = !_.isEmpty(selectedValue) ? displayItem(selectedValue) : selectedValue;

        if (!_.isEqual(prevProps.selectedValue, selectedValue) && !_.isEmpty(selectedValue)) {
            this.setState({ value });
        }

        if (prevState.preventBlur === true && prevState.preventBlur !== preventBlur) {
            this.closeResults();
        }
    },

    timeout: null,

    onChange(e) {
        const { value } = e.target;
        const { cursor, service, valueCursor } = this.props;

        this.setState({ value });
        valueCursor.set(null);

        clearTimeout(this.timeout);

        this.timeout = setTimeout(async () => {
            await service(cursor, { search: value });
        }, 400);
    },

    closeResults() {
        const { preventBlur } = this.state;
        const { cursor } = this.props;

        if (preventBlur) {
            return;
        }

        this.setState({ focused: false });
        cursor.set({});
    },

    onSelect(item) {
        const { onItemSelect } = this.props;

        onItemSelect(item);
        // this.setState({ preventBlur: false, focused: false });
        this.setState({ focused: false, preventBlur: false });
    },

    getInputProps() {
        return _.omit(this.props, [
            'cursor', 'service', 'onItemSelect', 'displayItem',
            'className', 'selectedValue', 'valueCursor', 'children', 'itemClassName',
        ]);
    },

    render() {
        const { focused, value } = this.state;
        const {
            cursor, className, children, displayItem, itemClassName,
        } = this.props;
        const results = cursor.get();
        const showResults = focused && !_.isEmpty(results) && results.status === 'Succeed';
        const inputProps = this.getInputProps();
        console.log('data', cursor.get());

        return (
            <Input
                className={classNames(s.container, className, {
                    [s._focused]: focused,
                })}
                {...inputProps}
                type="text"
                value={value}
                onChange={this.onChange}
                onFocus={() => this.setState({ focused: true })}
                onBlur={this.closeResults}
                ref={(ref) => { this.input = ref; }}
            >
                {children}
                {showResults ? (
                    <div className={s.items}>
                        {results.data.length > 0 ?
                            _.map(results.data, (item, index) => (
                                    <div
                                        key={`search-results-${index}`}
                                        className={classNames(s.item, itemClassName)}
                                        onTouchStart={() => this.setState({ preventBlur: true })}
                                        onMouseDown={() => this.setState({ preventBlur: true })}
                                        onTouchEnd={() => this.onSelect(item)}
                                        onMouseUp={() => this.onSelect(item)}
                                    >
                                        {displayItem(item)}
                                    </div>
                            ))
                        :
                            <div className={s.item}>
                                No results found
                            </div>
                        }
                    </div>
                ) : null}
            </Input>
        );
    },
});
