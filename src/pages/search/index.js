import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { WingBlank, WhiteSpace, Flex, List, DatePicker, Picker, Button, NavBar } from 'antd-mobile';
import s from './search.css';

export const SearchPage = createReactClass({
    getInitialState() {
        return {
            date: new Date(),
        };
    },

    render() {
        return (
            <div>
                <NavBar
                    mode="dark"
                    leftContent="Hitcharide"
                    rightContent={(<div style={{ whiteSpace: 'nowrap', fontSize: '14px' }}>+ Create a ride</div>)}
                    // rightContent={(<Button size="small">+ Create a ride</Button>)}
                />
                <List className={s.form} renderHeader={() => 'Search for a ride'}>
                    <Picker data={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]} cols={1}>
                        <List.Item arrow="horizontal">Where?</List.Item>
                    </Picker>
                    <Picker data={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]} cols={1}>
                        <List.Item arrow="horizontal">To?</List.Item>
                    </Picker>
                    <DatePicker
                        className="dateTime"
                        value={this.state.date}
                        onChange={(date) => this.setState({ date })}
                    >
                        <List.Item arrow="horizontal">Date & Time</List.Item>
                    </DatePicker>
                </List>
                <WhiteSpace />
                <WingBlank>
                    <Flex justify="end">
                        <Button type="primary" size="small" inline>Search for a ride</Button>
                    </Flex>
                </WingBlank>
            </div>
        );
    },
});
