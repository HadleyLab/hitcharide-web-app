import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import createReactClass from 'create-react-class';
import s from './footer.css';

const links = [
    [
        {
            slug: 'how-it-works',
            title: 'How it works',
        },
        {
            slug: 'faq',
            title: 'FAQ',
        },
    ],
    [
        {
            slug: 'terms-and-conditions',
            title: 'Terms & Conditions',
        },
        {
            slug: 'contact',
            title: 'Contact',
        },
    ],
];

export const HomeFooter = createReactClass({
    render() {
        return (
            <div className={s.container}>
                <div className={s.footer}>
                    <div className={s.links}>
                        {_.map(links, (row, index) => (
                            <div key={`row-${index}`} className={s.col}>
                                {_.map(row, (link, linkIndex) => (
                                    <Link
                                        key={`row-link-${linkIndex}`}
                                        className={s.link}
                                        to={`/page/${link.slug}`}
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className={s.copyright}>Hitcharide, 2018 ©</div>
                </div>
            </div>
        );
    },
});
