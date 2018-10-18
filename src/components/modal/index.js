import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Portal from 'components/portal';
import s from './modal.css';

export default createReactClass({
    displayName: 'Modal',

    propTypes: {
        closeModal: PropTypes.func.isRequired,
        header: PropTypes.node.isRequired,
        children: PropTypes.node.isRequired,
    },

    componentDidMount() {
        this.originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    },

    componentWillUnmount() {
        document.body.style.overflow = this.originalBodyOverflow;
    },

    originalBodyOverflow: null,

    render() {
        const { closeModal, header, children } = this.props;

        return (
            <Portal>
                <div className={s.modal}>
                    <div className={s.wrapper}>
                        <div className={s.inner}>
                            <div
                                className={s.bg}
                                onClick={closeModal}
                            />
                            <div className={s.content}>
                                <div className={s.header}>
                                    {header}
                                    <div
                                        className={s.close}
                                        onClick={closeModal}
                                    />
                                </div>
                                <div className={s.body}>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        );
    },
});
