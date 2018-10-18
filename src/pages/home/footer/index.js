import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import FlatBlock from 'components/flatblock';
import Modal from 'components/modal';
import createReactClass from 'create-react-class';
import s from './footer.css';

const model = {
    tree: {
        flatblock: null,
    },
};

const links = [
    [
        { slug: 'how-it-works', title: 'How it works' },
        { slug: 'faq', title: 'FAQ' },
    ],
    [
        { slug: 'terms-and-conditions', title: 'Terms & Conditions' },
        { slug: 'contact', title: 'Contact' },
    ],
];

export const HomeFooter = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        services: PropTypes.shape({
            getFlatpageService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getInitialState() {
        return {
            modalOpened: false,
            activeLink: {},
        };
    },

    onLinkClick(activeLink) {
        this.setState({ modalOpened: true, activeLink });
    },

    render() {
        const { modalOpened, activeLink } = this.state;
        const { getFlatpageService } = this.props.services;

        return (
            <div className={s.container}>
                <div className={s.footer}>
                    <div className={s.links}>
                        {_.map(links, (row, index) => (
                            <div key={`row-${index}`} className={s.col}>
                                {_.map(row, (link, linkIndex) => (
                                    <div
                                        key={`row-link-${linkIndex}`}
                                        className={s.link}
                                        onClick={() => this.onLinkClick(link)}
                                    >
                                        {link.title}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className={s.copyright}>Hitcharide, 2018 ©</div>
                </div>
                {modalOpened ? (
                    <Modal
                        header={activeLink.title}
                        closeModal={() => this.setState({ modalOpened: false, activeLink: {} })}
                    >
                        <FlatBlock
                            tree={this.props.tree.flatblock}
                            service={getFlatpageService}
                            slug={activeLink.slug}
                        />
                    </Modal>
                ) : null }
            </div>
        );
    },
}));
