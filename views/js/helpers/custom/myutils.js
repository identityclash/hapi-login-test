/**
 * Created by Omnius on 6/25/16.
 *
 * Taken from: http://www.w3schools.com/js/js_cookies.asp
 */
const MyUtils = {
    getCookie: function getCookie(cname) {

        const name = cname + '=';
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];

            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }
};
