/**
 * Created by Jeff on 1/17/14.
 */
'use strict';
var i18n = require('./lib/i18n');
i18n.init();
console.log(i18n.translate('Howdy', {locale: 'de'}));