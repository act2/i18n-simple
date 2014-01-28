/**
 * Copyright (c) 2014, ACT2 Technologies, Inc.
 */
'use strict';

var _ = require('underscore'),
	_s = require('underscore.string'),
	util = require('util'),
	path = require('path'),
	EventEmitter = require('events').EventEmitter,
	fs = require('fs');

var i18n = {};
var _translationFiles;
var _options;

// Internal properties so I can translate my own error messages
var _myLocalesDirectory = __dirname + '/locales';
var _myLocales = [];
var _myTranslationFiles = {};

i18n._events = new EventEmitter();

/**
 * getters and setters for class properties
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
		get: function () { return _options.directory; },
		set: function (val) {
			var dir = path.resolve(val);
			if (! fs.existsSync(dir)){
				return handleError('errors.badLocalesDir', { dir: dir });
			}
			_options.directory = dir;

			// force reloading of locale files since directory changed
			if (!_.isUndefined(_options.locales)) initLocaleList();
		}
	},
	locales: {
		get: function() { return _options.locales; }
	},
	defaultLocale: {
		get: function() { return _options.defaultLocale; },
		set: function(val) {
			if (_.indexOf(_options.locales, val) === -1) return handleError('errors.badDefaultLocale', { locale: val });
			_options.defaultLocale = val;
		}
	},
	currentLocale: {
		get: function() { return _options.currentLocale; },
		set: function(val) {
			if (_.indexOf(_options.locales, val) === -1) return handleError('errors.badCurrentLocale', { locale: val });
			_options.currentLocale = val;
			if (_.indexOf(_translationFiles, val) === -1) {
				_translationFiles[val] = loadTranslationFile(path.join(_options.directory, _options.currentLocale + _options.fileExtension));
			}
		}
	},
	fileExtension: {
		get: function() { return _options.fileExtension; },
		set: function(val) {
			_options.fileExtension = _s.trim(val);
			if (_options.fileExtension.charAt(0) != '.') _options.fileExtension = '.' + _options.fileExtension;
		}
	},
	defaultTag: {
		get: function() { return _options.defaultTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.defaultTag = val;
		}
	},
	pluralTag: {
		get: function() { return _options.pluralTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.pluralTag = val;
		}
	},
	pluralOneTag: {
		get: function() { return _options.pluralOneTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.pluralOneTag = val;
		}
	},
	pluralOtherTag: {
		get: function() { return _options.pluralOtherTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.pluralOtherTag = val;
		}
	},
	genderTag: {
		get: function() { return _options.genderTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.genderTag = val;
		}
	},
	genderFemaleTag: {
		get: function() { return _options.genderFemaleTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.genderFemaleTag = val;
		}
	},
	genderMaleTag: {
		get: function() { return _options.genderMaleTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.genderMaleTag = val;
		}
	},
	genderNeutralTag: {
		get: function() { return _options.genderNeutralTag; },
		set: function(val) {
			if (typeof(val) != 'string') return handleError('errors.badParameter.expectsString');
			_options.genderNeutralTag = val;
		}
	}
});

/**
 * Initialization routine. Called automatically if options are passed in with the require statement:
 *
 *  ####Example:
 *      var i18n = require('i18n-simple');
 *
 *      // initialize with all default option
 *      i18n.init();
 *
 *      // initialize with default options except those specified
 *      i18n.init({directory: 'languages', locales: ['en', 'es', 'de', 'fr']});
 *
 * @param {Object} [options] - optional settings passed in object literal notation
 *      Options:
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
i18n.init = function (options) {

	_translationFiles = {};
	_options = {};

	if (_.isUndefined(options)) options = {};

	this.directory = options.directory || './locales';
	this.fileExtension = options.fileExtension || '.json';

	initLocaleList();

	this.defaultLocale = options.defaultLocale ||
		((this.locales.length > 1 && _.indexOf(this.locales, 'en')) ? 'en' : this.locales[0]);

	this.currentLocale = options.currentLocale || this.defaultLocale;
	this.defaultTag = options.defaultTag || 'default';
	this.pluralTag = options.pluralTag || 'plural';
	this.pluralOneTag = options.pluralOneTag || 'one';
	this.pluralOtherTag = options.pluralOtherTag || 'other';
	this.genderTag = options.genderTag || 'gender';
	this.genderFemaleTag = options.genderFemaleTag || 'female';
	this.genderMaleTag = options.genderMaleTag || 'male';
	this.genderNeutralTag = options.genderNeutralTag || 'neutral';

	/**
	 * if we get this far with no errors, initialize my own locale files
	 * dynamically so other locales can be added without code changes
	 */
	fs.readdirSync(_myLocalesDirectory).forEach(function(file) {
		var localeName = path.basename(file, '.json');
		_myLocales.push(localeName);
	});
};

/**
 * 	load locales list from directory and fileExtension
 */
function initLocaleList() {
	_options.locales = [];
	fs.readdirSync(_options.directory).forEach(function(file) {
		if (file.indexOf(_options.fileExtension) >= 0) {
			var localeName = path.basename(file, _options.fileExtension);
			_options.locales.push(localeName);
		}
	});
}

/**
 * Fetches and returns translated text.
 *
 * @param {string} key - json key value for text lookup. may be dot notated for multiple level depths.
 * @param {Object} [options] - json object with the following optional name / value pairs
 *      @option plural[true|false|num] - for pluralization. If true or num === 1, singular is used, else plural form.
 *      @option gender - for gender selection. either literal string or object which supports the toString() method
 *          must match one of the default or custom set gender tags [female|male|neutral]
 *      @option replacements - json object replacement strings - e.g. { fname: 'Mickey', lname: 'Mouse' }
 *      @option locale - if supplied, ignores current locale and loads directly from specified locale
 * @returns {*} - translated text
 */
i18n.t = i18n.translate = function (key, options) {

	// if user tries to start translating without explicit init, call init for default options
	if (_.isUndefined(_translationFiles)) this.init();
	if (_.isUndefined(key)) handleError('errors.badParameter.missingKey');

	var gender,
		plural,
		replacements,
		locale,
		translation,
		finalTranslation,
		internal = false; // undocumented - used for this module to translate its own messages

	locale = this.currentLocale;

	if (!_.isUndefined(options) && _.isObject(options)) {

		plural =  options.plural;
		switch (typeof plural) {
			case "boolean" :
			case "undefined" :
				break;
			case "number" :
				plural = (plural !== 1);
				break;
			default :
				return handleError('errors.badParameter.badPlural');
		}

		gender = options.gender;
		if (_.isObject(gender)) gender = gender.toString();
		if (!_.isUndefined(gender) && gender != this.genderFemaleTag && gender != this.genderMaleTag && gender != this.genderNeutralTag) {
			return handleError('errors.badParameter.badGender',
				{ female: this.genderFemaleTag, male: this.genderMaleTag, neutral: this.genderNeutralTag });
		}

		replacements = options.replacements;
		if (!_.isUndefined(replacements) && !_.isObject(replacements)) {
			return handleError('errors.badParameter.badReplacements');
		}

		locale = this.defaultLocale;
		if (!_.isUndefined(options.locale)) {
			if (_.indexOf(this.locales, options.locale) === -1) {
				return handleError('errors.badSuppliedLocale', { locale: options.locale });
			}
			locale = options.locale;
		}

		if (!_.isUndefined(options.internal)) {
			internal = true;
		}

	}

	translation = doTranslate(key, locale, plural, gender, internal);

	var regex;
	if (!_.isUndefined(replacements)) {
		for (var replacement in replacements) {
			regex = new RegExp('{{\\s*' + replacement + '\\s*}}', 'gm');
			translation = translation.replace(regex, replacements[replacement]);
		}
	}

	// see if any replacement tags still exist in text and try to find them in the locales file
	finalTranslation = translation;
	regex = new RegExp('{{\\s*([\\w.]*)\\s*}}', 'gm');
	var results;
	while (( results = regex.exec(translation)) != null) {
		var lookup = doTranslate(results[1], locale, plural, gender, internal);
		finalTranslation = finalTranslation.replace(results[0], lookup);
	}

	return finalTranslation;
};

/**
 * called by translate method to perform the actual text lookup with possible fallback to default locale
 *
 * @param {string} key - string code to lookup
 * @param {string} locale - locale to take it from
 * @param {boolean} [plural] - true/false - use plural form or not
 * @param {string} [gender] - one of the gender tags
 * @param {boolean} [internal] - true if translation is coming from this module else false
 * @returns {*}
 */
function doTranslate(key, locale, plural, gender, internal) {
	if (internal) locale = _options.defaultLocale;

	var tFiles = (internal) ? _myTranslationFiles : _translationFiles;
	var dir = (internal) ? _myLocalesDirectory : _options.directory;
	var ext = (internal) ? '.json' : _options.fileExtension;

	if (_.indexOf(tFiles, locale) === -1) {
		tFiles[locale] = loadTranslationFile(dir + '/' + locale + ext);
	}
	var translation = getTranslation(key, tFiles[locale]);

	if (!internal && _.isUndefined(translation) && locale !== _options.defaultLocale) {
		if (_.isUndefined(_translationFiles[_options.defaultLocale])) {
			_translationFiles[_options.defaultLocale] =
				loadTranslationFile(_options.directory + '/' + _options.defaultLocale + _options.fileExtension);
		}
		translation = getTranslation(key, _translationFiles[_options.defaultLocale]);
	}

	// handle complex case
	if (_.isObject(translation)) {
		if (_.isUndefined(plural) && _.isUndefined(gender)) {
			key = key + '.' + _options.defaultTag;
		} else if (!_.isUndefined(plural) && _.isUndefined(gender)) {
			key = key + '.' + _options.pluralTag + '.' + ((plural) ? _options.pluralOtherTag : _options.pluralOneTag);
		} else if (_.isUndefined(plural) && !_.isUndefined(gender)) {
			key = key + '.' + _options.genderTag + '.' + gender;
		} else if (!_.isUndefined(plural) && !_.isUndefined(gender)) {
			// case plural->gender
			if (!_.isUndefined(translation[_options.pluralTag])) {
				key = key + '.' + _options.pluralTag + '.' + ((plural) ? _options.pluralOtherTag : _options.pluralOneTag) +
					'.' + _options.genderTag + '.' + gender;
			} else {
				key = key + '.' + _options.genderTag + '.' + gender + '.' +
					_options.pluralTag + '.' + ((plural) ? _options.pluralOtherTag : _options.pluralOneTag);
			}
		}
		translation = doTranslate(key, locale, plural, gender, internal);
	}

	return translation;
}

/**
 * Recursive function to parse dot notated key and pull correct value from json file
 *
 * @param {string} key
 * @param {Object} context
 * @returns {*} - found text
 */
function getTranslation(key, context) {
	if (_.isUndefined(context)) return undefined;
	var path = key.split(".");
	if (path.length === 1) {
		var lookupKey = path[0];
		var foundItem = context[lookupKey];
		if (!_.isUndefined(foundItem) && !_.isObject(foundItem) && foundItem.charAt(0) === '@') {
			lookupKey = context[lookupKey].slice(1);
		}
		return context[lookupKey];
	}

	if (_.isUndefined(context[path[0]])) return undefined;
	context = context[path[0]];
	return getTranslation(path.splice(1).join('.'), context);
}

/**
 * Loads the translation file from disk into memory and parses into JSON object
 *
 * @param {string} path
 * @returns {*}
 */
function loadTranslationFile(path) {
	try {
		if (! fs.existsSync(path)) {
			return handleError('errors.badLocaleFile', { file: path });
		}

		var data = fs.readFileSync(path, 'utf8');
		return JSON.parse(data);
	} catch (e) {
		return handleError(e);
	}
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

	var error = new Error(i18n.t(errorTag, { internal: true, replacements: replacements }));

	if (!_.isEmpty(i18n.listeners('error'))) {
		i18n._events.emit('error', error);
		return;
	}
	throw error;
}

module.exports = i18n;