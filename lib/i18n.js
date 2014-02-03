/**
 * Copyright (c) 2014, ACT2 Technologies, Inc.
 */
'use strict';

var _ = require('underscore'),
	_s = require('underscore.string'),
	util = require('util'),
	path = require('path'),
	EventEmitter = require('events').EventEmitter,
	fs = require('fs'),
	i18nContext = require('./i18nContext').i18nContext;

var i18n = {};
var _contexts = {};

i18n._events = new EventEmitter();

/**
 * getters and setters for default context. To get or set values on other contexts, use getAttr and setAttr methods
 *      Properties:
 *          directory - path to translation files. defaults to './locales'.
 *          fileExtension - string representing locale filename extension. defaults to '.json'.
 *          locales - (read only) array of strings, each containing locale identifier. e.g. ['en', 'es'].
 *              Automatically populated from files in directory with valid fileExtension
 *          defaultLocale - string matching one of the locales array entries.
 *              If only one locale file, this is set as default, otherwise defaults to 'en'.
 *          currentLocale - string matching one of the locales array entries. defaults to defaultLocale property.
 *          defaultTag - string representing complex definition default text tag. defaults to 'default'.
 *          pluralTag - string representing complex definition plural tag. defaults to 'plural'.
 *          pluralOneTag - string representing complex definition plural one tag. defaults to 'one'.
 *          pluralOtherTag - string representing complex definition plural one tag. defaults to 'other'.
 *          genderTag - string representing complex definition gender tag. defaults to 'gender'.
 *          genderFemaleTag - string representing complex definition gender female tag. defaults to 'female'.
 *          genderMaleTag - string representing complex definition gender male tag. defaults to 'male'.
 *          genderNeutralTag - string representing complex definition gender neutral tag. defaults to 'neutral'.
 */
Object.defineProperties(i18n, {
	directory: {
		get: function () { return _contexts['default'].directory; },
		set: function (val) { _contexts['default'].directory = val;	}
	},
	locales: {
		get: function() { return _contexts['default'].locales; }
	},
	defaultLocale: {
		get: function() { return _contexts['default'].defaultLocale; },
		set: function(val) {
			_contexts['default'].defaultLocale = val;
			// change i18n-simple error messages to match default context defaultLocale if that locale is present
			// in i18n-simple
			if (_.indexOf(_contexts['i18n-simple'].locales, val) >= 0) {
				_contexts['i18n-simple'].currentLocale = val;
			}
		}
	},
	currentLocale: {
		get: function() { return _contexts['default'].currentLocale; },
		set: function(val) { _contexts['default'].currentLocale = val; }
	},
	fileExtension: {
		get: function() { return _contexts['default'].fileExtension; },
		set: function(val) { _contexts['default'].fileExtension = val; }
	},
	defaultTag: {
		get: function() { return _contexts['default'].defaultTag; },
		set: function(val) { _contexts['default'].defaultTag = val;	}
	},
	pluralTag: {
		get: function() { return _contexts['default'].pluralTag; },
		set: function(val) { _contexts['default'].pluralTag = val; }
	},
	pluralOneTag: {
		get: function() { return _contexts['default'].pluralOneTag; },
		set: function(val) { _contexts['default'].pluralOneTag = val; }
	},
	pluralOtherTag: {
		get: function() { return _contexts['default'].pluralOtherTag; },
		set: function(val) { _contexts['default'].pluralOtherTag = val; }
	},
	genderTag: {
		get: function() { return _contexts['default'].genderTag; },
		set: function(val) { _contexts['default'].genderTag = val; }
	},
	genderFemaleTag: {
		get: function() { return _contexts['default'].genderFemaleTag; },
		set: function(val) { _contexts['default'].genderFemaleTag = val; }
	},
	genderMaleTag: {
		get: function() { return _contexts['default'].genderMaleTag; },
		set: function(val) { _contexts['default'].genderMaleTag = val; }
	},
	genderNeutralTag: {
		get: function() { return _contexts['default'].genderNeutralTag; },
		set: function(val) { _contexts['default'].genderNeutralTag = val; }
	}
});

/**
 * returns attribute from specific context
 * @param attribute
 * @param context
 * @returns {*}
 */
i18n.getAttr = function(attribute, context) {
	return _contexts[context][attribute];
};

/**
 * sets attribute for specific context
 * @param attribute
 * @param value
 * @param context
 */
i18n.setAttr = function(attribute, value, context) {
	_contexts[context][attribute] = value;
};

/**
 * Initialization routine with optional specified context and optional options.
 *
 *  ####Example:
 *      var i18n = require('i18n-simple');
 *
 *      // initialize with all default option and default context
 *      i18n.init();
 *
 *      // initialize with default options except those specified in default context
 *      i18n.init({directory: 'languages', locales: ['en', 'es', 'de', 'fr']});
 *
 * @param {string} [context] - context of this translation initialization
 * @param {Object} [options] - optional settings passed in object literal notation
 *      Options:
 *          context - context to which these options apply. defaults to 'default'.
 *          directory - path to translation files. defaults to './locales'.
 *          defaultLocale - string matching one of the locales array entries. defaults to 'en'.
 *          currentLocale - string matching one of the locales array entries. defaults to 'en'.
 *          fileExtension - string representing locale filename extension. defaults to '.json'.
 *          defaultTag - string representing complex definition default text tag. defaults to 'default'.
 *          pluralTag - string representing complex definition plural tag. defaults to 'plural'.
 *          pluralOneTag - string representing complex definition plural one tag. defaults to 'one'.
 *          pluralOtherTag - string representing complex definition plural one tag. defaults to 'other'.
 *          genderTag - string representing complex definition gender tag. defaults to 'gender'.
 *          genderFemaleTag - string representing complex definition gender female tag. defaults to 'female'.
 *          genderMaleTag - string representing complex definition gender male tag. defaults to 'male'.
 *          genderNeutralTag - string representing complex definition gender neutral tag. defaults to 'neutral'.
 */
i18n.init = function (options, context) {

	if (_.isUndefined(options)) options = {};
	if (_.isString(options)) {
		context = options;
		options = {};
	}
	if (_.isUndefined(context)) context = 'default';

	_contexts[context] = new i18nContext(context, options, handleError);

};

i18n.t = i18n.translate = function (key, options, context) {
	if (_.isUndefined(key)) handleError('errors.badParameter.missingKey');
	if (_.isString(options)) {
		context = options;
		options = {};
	}
	if (_.isUndefined(context)) context = 'default';
	return _contexts[context].translate(key, options);
}

/**
 * EventEmitter wrapper methods
 */

/**
 * Wrapper 'addListener' method for the embedded event emitter
 *
 * @param {string} event
 * @param {function} listener
 * @returns {*}
 */
i18n.addListener = function (event, listener) {
	return i18n._events.addListener(event, listener);
};

/**
 * Wrapper 'on' method for the embedded event emitter
 *
 * @param {string} event
 * @param {function} listener
 * @returns {*}
 */
i18n.on = function(event, listener) {
	return i18n._events.on(event, listener);
};

/**
 * Wrapper 'once' method for the embedded event emitter
 *
 * @param {string} event
 * @param {function} listener
 * @returns {*}
 */
i18n.once = function(event, listener) {
	return i18n._events.once(event, listener);
};

/**
 * Wrapper 'removeListener' method for the embedded event emitter
 *
 * @param {string} event
 * @param {function} listener
 * @returns {*}
 */
i18n.removeListener = function(event, listener) {
	return i18n._events.removeListener(event, listener);
};

/**
 * Wrapper 'removeAllListeners' method for the embedded event emitter
 *
 * @param {string} event
 * @returns {*}
 */
i18n.removeAllListeners = function(event) {
	return i18n._events.removeAllListeners(event);
};

/**
 * Wrapper 'setMaxListeners' method for the embedded event emitter
 *
 * @param {number} n
 * @returns {*}
 */
i18n.setMaxListeners = function(n) {
	return i18n._events.setMaxListeners(n);
};

/**
 * Wrapper 'listeners' method for the embedded event emitter
 *
 * @param {string} event
 * @returns {*}
 */
i18n.listeners = function(event) {
	return i18n._events.listeners(event);
};

/**
 * emits (EventEmitter) class error built from error string if 'error' listener is attached to i18n
 *  otherwise, throws the error
 *
 * @param {string} errorTag - i18n lookup tag
 * @param {Object} [replacements] - json object with replacement values
 */
function handleError(errorTag, replacements) {

	var error = new Error(i18n.t(errorTag, { replacements: replacements }, 'i18n-simple'));

	if (!_.isEmpty(i18n.listeners('error'))) {
		i18n._events.emit('error', error);
		return;
	}
	throw error;
}

// and my context so I can translate my own error messages
i18n.init({ directory : __dirname + '/locales' }, 'i18n-simple');

module.exports = i18n;