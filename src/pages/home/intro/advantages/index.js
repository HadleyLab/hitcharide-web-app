import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import s from './advantages.css';
import boxIcon from './images/box.svg';

export const Advantages = createReactClass({
    propTypes: {

    },

    render() {
        const descriptions = [
            {
                title: 'Simple',
                content: 'Select who you want to travel with.',
            },
            {
                title: 'Smart',
                content: 'With access to millions of journeys, you can quickly find people nearby travelling your way.',
            },
            {
                title: 'Seamless',
                content: 'Get to your exact destination, without the hassle. Carpooling cuts out transfers, queues and the waiting around the station time.',
            },
        ];

        const advantages = [
            {
                title: 'Choice.',
                content: 'We go everywhere. Literally thousands of destinations. No station required.',
            },
            {
                title: 'Community.',
                content: 'We take the time to get to know our members. All profiles and ratings are checked.',
            },
            {
                title: 'Covered.',
                content: 'Really? Free as in nothing to pay? You’ve got it. We partner with AXA.',
            },
        ];

        return (
            <div className={s.advantagesWrapper}>
                <div className={s.advantages}>
                    <div className={s.advantagesTitle}>
                        Go literally anywhere.<br />
                        From anywhere.
                    </div>

                    <div className={s.advantagesList}>
                        {_.map(descriptions, ({ title, content }, index) => (
                            <div key={index} className={s.advantagesItem}>
                                <div className={s.advantagesItemTitle}>
                                    {title}
                                </div>
                                <div className={s.advantagesItemContent}>
                                    {content}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={s.advantagesSpacer} />
                    <div className={s.advantagesTitle}>
                        3 things you'll love about Hitcharide
                    </div>

                    <div className={classNames(s.advantagesList, s._center)}>
                        {_.map(advantages, ({ title, content }, index) => (
                            <div key={index} className={s.advantagesItem}>
                                <div
                                    className={s.advantagesItemIcon}
                                >
                                    <img src={boxIcon} />
                                </div>
                                <div className={classNames(s.advantagesItemTitle, s._center)}>
                                    {title}
                                </div>
                                <div className={classNames(s.advantagesItemContent, s._center)}>
                                    {content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
});
