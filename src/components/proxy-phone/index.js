import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Button, Modal, Icon } from 'antd-mobile';

import s from './proxy-phone.css';

const model = {
    data: {},
    error: {},
    status: 'NotAsked',
};

class ProxyPhone extends React.Component {
    constructor(props) {
        super(props);

        this.onShowPhoneClick = this.onShowPhoneClick.bind(this);
    }

    async onShowPhoneClick() {
        const { service } = this.props;

        await service(this.props.tree);

        const error = this.props.tree.error.get();
        if (error) {
            Modal.alert("Error", "Can not request phone number. Please contact us for help", [
                {
                    text: 'Ok',
                    onPress: () => null
                },
            ]);
        }
    }

    render() {
        const status = this.props.tree.status.get();
        if (status === 'Loading') {
            return (
                <Icon type="loading" size="md" />
            );
        }

        if (status === 'Succeed') {
            const data = this.props.tree.data.get();

            return (
                <div>
                    <a
                        href={`tel:${data.proxyPhone}`}
                        className={s.link}
                    >
                        {data.proxyPhone}
                    </a>
                </div>
            );
        }

        return (
            <Button
                type="primary"
                size="small"
                inline
                style={{
                    backgroundColor: '#4263CA',
                    borderColor: '#4263CA',
                }}
                onClick={this.onShowPhoneClick}
            >
                Show phone
            </Button>
        );
    }
}

ProxyPhone.propTypes = {
    tree: BaobabPropTypes.cursor.isRequired,
    service: PropTypes.func.isRequired,
};

const WrapperProxyPhone = schema(model)(ProxyPhone);

export {
    WrapperProxyPhone as ProxyPhone,
};
