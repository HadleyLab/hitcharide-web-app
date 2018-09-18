import React from 'react';
import PropTypes from 'prop-types';

export const DriverIcon = ({ color }) => (
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d={'M17.9996 0C8.07483 0 0 8.07609 0 17.9996C0 27.9239 8.07483 36 17.9996 36C27.9239 36 36 27.9239 '
                + '36 17.9996C36 8.07483 27.9239 0 17.9996 0ZM3.38098 13.4744C5.38741 6.97301 11.2355 2.63371 '
                + '17.9467 2.63371C24.6642 2.63371 30.5127 6.97301 32.5066 13.4333C32.5653 13.6519 32.9505 '
                + '15.2505 31.959 16.2466C31.4811 16.7257 30.8102 16.9808 30.0193 16.9808C29.3312 16.9808 '
                + '28.5629 16.7845 27.7943 16.4144C26.9731 16.0175 26.0446 15.4103 25.0636 14.7667C22.946 '
                + '13.3766 20.3056 11.6492 17.945 11.6236C15.5908 11.6492 13.0628 13.3053 10.8319 14.7638C9.85049 '
                + '15.4091 8.9228 16.0175 8.1 16.4144C6.45063 17.2124 4.82769 17.1462 3.93692 16.2483C2.94797 '
                + '15.2505 3.33231 13.6523 3.38098 13.4744ZM16.9435 33.0155C16.7681 33.1708 16.5428 33.2543 16.312 '
                + '33.2543C16.2764 33.2543 16.2394 33.2513 16.2034 33.2488C9.47455 32.4625 3.98685 27.2543 2.85566 '
                + '20.5846C2.81077 20.3106 2.88545 20.0257 3.06503 19.8113C3.24587 19.6015 3.51063 19.4794 3.78965 '
                + '19.4794C11.0908 19.4794 17.2603 25.3544 17.2603 32.3089C17.2586 32.5762 17.1432 32.8343 16.9435 '
                + '33.0155ZM15.4225 17.9996C15.4225 16.5797 16.5797 15.4225 17.9996 15.4225C19.4199 15.4225 20.5762 '
                + '16.5797 20.5762 17.9996C20.5762 19.4169 19.4199 20.5762 17.9996 20.5762C16.5797 20.5762 15.4225 '
                + '19.4169 15.4225 17.9996ZM19.7975 33.2492C19.7614 33.2517 19.7241 33.2547 19.6892 33.2547C19.4589 '
                + '33.2547 19.2323 33.1712 19.0569 33.0159C18.8559 32.8347 18.7418 32.5766 18.7418 32.3073C18.7418 '
                + '25.354 24.9113 19.479 32.212 19.479C32.4898 19.479 32.7558 19.6011 32.9366 19.8122C33.1158 20.0249 '
                + '33.193 20.3102 33.1464 20.5855C32.0144 27.2543 26.5263 32.4625 19.7975 33.2492Z'}
            fill={color}
        />
    </svg>
);

DriverIcon.propTypes = {
    color: PropTypes.string,
};

DriverIcon.defaultProps = {
    color: 'white',
};
