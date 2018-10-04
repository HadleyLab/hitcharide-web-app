import React from 'react';
import createReactClass from 'create-react-class';
import { ServiceContext } from 'components';
import { HomeHeader } from './header';
import { HomeIntroSection } from './intro';
import s from './home.css';

export const HomePageContent = createReactClass({
    propTypes: {},

    render() {
        return (
            <div className={s.container}>
                <HomeHeader {...this.props} />
                <HomeIntroSection {...this.props} />
            </div>
        );
    },
});

export function HomePage(props) {
    return (
        <ServiceContext.Consumer>
            {(services) => <HomePageContent {...props} services={services} />}
        </ServiceContext.Consumer>
    );
}
