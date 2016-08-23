/**
 * Created by Omnius on 20/08/2016.
 */
'use strict';

exports.isHexString = (value) => {

    const invalid = ['boolean', 'number', 'object'];

    if (invalid.indexOf(typeof (value)) > -1) {
        return false;
    }

    const pattern = '^[a-fA-F0-9]+$';
    const regex = new RegExp(pattern);

    return (Boolean(value.length) && (value.length % 16 === 0) && regex.test(value));
};
