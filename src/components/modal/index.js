import React from 'react';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Portal from 'components/portal';
import ModalContext from './modal-context';
import s from './modal.css';


export default createReactClass({
    displayName: 'Modal',

    propTypes: {
        closeable: PropTypes.bool,
        closeModal: PropTypes.func.isRequired,
        header: PropTypes.any.isRequired, // eslint-disable-line
        children: PropTypes.any.isRequired, // eslint-disable-line
        footer: PropTypes.any, // eslint-disable-line
        mode: PropTypes.string,
        zIndex: PropTypes.number,
        bodyClass: PropTypes.string,
    },

    getDefaultProps() {
        return {
            closeable: true,
        };
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
        const { mode, zIndex, closeable, closeModal, header, footer, children, bodyClass } = this.props;
        const defaultBodyClass = typeof bodyClass === 'undefined' ? s.defaultBody : this.props.bodyClass;

        return (
            <Portal>
                <ModalContext
                    modal={this.modal}
                >
                    <div
                        className={classNames(s.modal, {
                            [s._full]: mode === 'full',
                            [s._middle]: mode === 'middle',
                        })}
                        style={{ zIndex }}
                        ref={(ref) => { this.modal = ref; }}
                    >
                        <div className={s.wrapper}>
                            <div className={s.inner}>
                                <div
                                    className={s.bg}
                                    onClick={closeable && closeModal}
                                />
                                <div className={s.content}>
                                    <div className={s.header}>
                                        {header}
                                        {closeable ? (
                                            <div
                                                className={s.close}
                                                onClick={closeModal}
                                            />
                                        ) : null}
                                    </div>
                                    <div className={classNames(s.body, defaultBodyClass)}>
                                        {children}
                                        {footer ? (
                                            <div className={s.footer}>
                                                {footer}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalContext>
            </Portal>
        );
    },
});
