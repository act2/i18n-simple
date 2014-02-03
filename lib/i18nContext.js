/**
 * Project: simple-i18n
 * File: i18nContext.js
 * Copyright (c) 2014, ACT2 Technologies, Inc.
 * Created by Jeff on 1/29/14.
 */
'use strict';

var _ = require('underscore'),
	_s = require('underscore.string'),
	path = require('path'),
	EventEmitter = require('events').EventEmitter,
	fs = require('fs');

var i18nContext = function (name, options, errorHandler) {

	this.name = name;

	if (_.isUndefined(options)) options = {};

	this.errorHandler = errorHandler || function (err, values) {
		throw new Error(err + 'metadata: ' + JSON.stringify(values));
	};

	this.translationFiles = {};
	this.directory = options.directory || './locales';
	this.fileExtension = options.fileExtension || '.json';

	initLocaleList(this);

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

};

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
Object.defineProperties(i18nContext.prototype, {
	translationFiles : {
		get: function () { return this._translationFiles; },
		set: function (val) { this._translationFiles = val;	}
	},
	directory: {
		get: function () { return this._directory; },
		set: function (val) {
			var dir = path.resolve(val);
			if (! fs.existsSync(dir)){
				return this.errorHandler('errors.badLocalesDir', { dir: dir });
			}
			this._directory = dir;

			// force reloading of locale files since directory changed
			if (!_.isUndefined(this._locales)) initLocaleList(this);
		}
	},
	locales: {
		get: function() { return this._locales; }
	},
	defaultLocale: {
		get: function() { return this._defaultLocale; },
		set: function(val) {
			if (_.indexOf(this._locales, val) === -1) return this.errorHandler('errors.badDefaultLocale', { locale: val });
			this._defaultLocale = val;
		}
	},
	currentLocale: {
		get: function() { return this._currentLocale; },
		set: function(val) {
			if (_.indexOf(this._locales, val) === -1) return this.errorHandler('errors.badCurrentLocale', { locale: val });
			this._currentLocale = val;
			if (_.indexOf(this.translationFiles, val) === -1) {
				this.translationFiles[val] = loadTranslationFile(this, path.join(this._directory, this._currentLocale + this._fileExtension));
			}
		}
	},
	fileExtension: {
		get: function() { return this._fileExtension; },
		set: function(val) {
			this._fileExtension = _s.trim(val);
			if (this._fileExtension.charAt(0) != '.') this._fileExtension = '.' + this._fileExtension;
		}
	},
	defaultTag: {
		get: function() { return this._defaultTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._defaultTag = val;
		}
	},
	pluralTag: {
		get: function() { return this._pluralTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._pluralTag = val;
		}
	},
	pluralOneTag: {
		get: function() { return this._pluralOneTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._pluralOneTag = val;
		}
	},
	pluralOtherTag: {
		get: function() { return this._pluralOtherTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._pluralOtherTag = val;
		}
	},
	genderTag: {
		get: function() { return this._genderTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._genderTag = val;
		}
	},
	genderFemaleTag: {
		get: function() { return this._genderFemaleTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._genderFemaleTag = val;
		}
	},
	genderMaleTag: {
		get: function() { return this._genderMaleTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._genderMaleTag = val;
		}
	},
	genderNeutralTag: {
		get: function() { return this._genderNeutralTag; },
		set: function(val) {
			if (typeof(val) != 'string') return this.errorHandler('errors.badParameter.expectsString');
			this._genderNeutralTag = val;
		}
	}
});


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
i18nContext.prototype.translate = function (key, options) {

	if (_.isUndefined(key)) this.errorHandler('errors.badParameter.missingKey');

	var gender,
		plural,
		replacements,
		locale,
		translation,
		finalTranslation;

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
				return this.errorHandler('errors.badParameter.badPlural');
		}

		gender = options.gender;
		if (_.isObject(gender)) gender = gender.toString();
		if (!_.isUndefined(gender) && gender != this.genderFemaleTag && gender != this.genderMaleTag && gender != this.genderNeutralTag) {
			return this.errorHandler('errors.badParameter.badGender',
				{ female: this.genderFemaleTag, male: this.genderMaleTag, neutral: this.genderNeutralTag });
		}

		replacements = options.replacements;
		if (!_.isUndefined(replacements) && !_.isObject(replacements)) {
			return this.errorHandler('errors.badParameter.badReplacements');
		}

//		locale = this.defaultLocale;
		if (!_.isUndefined(options.locale)) {
			if (_.indexOf(this.locales, options.locale) === -1) {
				return this.errorHandler('errors.badSuppliedLocale', { locale: options.locale });
			}
			locale = options.locale;
		}
	}

	translation = doTranslate(this, key, locale, plural, gender);

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
		var lookup = doTranslate(this, results[1], locale, plural, gender);
		finalTranslation = finalTranslation.replace(results[0], lookup);
	}

	return finalTranslation;
};

/**
 * called by translate method to perform the actual text lookup with possible fallback to default locale
 *
 * @param {Object} context - context object
 * @param {string} key - string code to lookup
 * @param {string} locale - locale to take it from
 * @param {boolean} [plural] - true/false - use plural form or not
 * @param {string} [gender] - one of the gender tags
 * @returns {*}
 */
function doTranslate(context, key, locale, plural, gender) {

	if (_.indexOf(context.translationFiles, locale) === -1) {
		context.translationFiles[locale] = loadTranslationFile(this, context.directory + '/' + locale +
			context.fileExtension);
	}
	var translation = getTranslation(key, context.translationFiles[locale]);

	if (_.isUndefined(translation) && locale !== context.defaultLocale) {
		if (_.isUndefined(context.translationFiles[context.defaultLocale])) {
			context.translationFiles[context.defaultLocale] =
				loadTranslationFile(this, context.directory + '/' + context.defaultLocale +
					context.fileExtension);
		}
		translation = getTranslation(key, context.translationFiles[context.defaultLocale]);
	}

	// handle complex case
	if (_.isObject(translation)) {
		if (_.isUndefined(plural) && _.isUndefined(gender)) {
			key = key + '.' + context.defaultTag;
		} else if (!_.isUndefined(plural) && _.isUndefined(gender)) {
			key = key + '.' + context.pluralTag + '.' + ((plural) ? context.pluralOtherTag : context.pluralOneTag);
		} else if (_.isUndefined(plural) && !_.isUndefined(gender)) {
			key = key + '.' + context.genderTag + '.' + gender;
		} else if (!_.isUndefined(plural) && !_.isUndefined(gender)) {
			// case plural->gender
			if (!_.isUndefined(translation[context.pluralTag])) {
				key = key + '.' + context.pluralTag + '.' + ((plural) ? context.pluralOtherTag : context.pluralOneTag) +
					'.' + context.genderTag + '.' + gender;
			} else {
				key = key + '.' + context.genderTag + '.' + gender + '.' +
					context.pluralTag + '.' + ((plural) ? context.pluralOtherTag : context.pluralOneTag);
			}
		}
		translation = doTranslate(context, key, locale, plural, gender);
	}

	return translation;
}

/**
 * Recursive function to parse dot notated key and pull correct value from json object
 *
 * @param {string} key
 * @param {Object} translations
 * @returns {*} - found text
 */
function getTranslation(key, translations) {
	if (_.isUndefined(translations)) return undefined;
	var keyPath = key.split(".");
	if (keyPath.length === 1) {
		var lookupKey = keyPath[0];
		var foundItem = translations[lookupKey];
		if (!_.isUndefined(foundItem) && !_.isObject(foundItem) && foundItem.charAt(0) === '@') {
			lookupKey = translations[lookupKey].slice(1);
		}
		return translations[lookupKey];
	}

	if (_.isUndefined(translations[keyPath[0]])) return undefined;
	return getTranslation(keyPath.splice(1).join('.'), translations[keyPath[0]]);
}


/**
 * 	load locales list from directory and fileExtension
 */
function initLocaleList (context) {
	context._locales = [];
	fs.readdirSync(context._directory).forEach(function(file) {
		if (file.indexOf(context._fileExtension) >= 0) {
			var localeName = path.basename(file, context._fileExtension);
			context._locales.push(localeName);
		}
	});
}

/**
 * Loads the translation file from disk into memory and parses into JSON object
 *
 * @param {string} path
 * @returns {*}
 */
function loadTranslationFile(context, path) {
	try {
		if (! fs.existsSync(path)) {
			return context.errorHandler('errors.badLocaleFile', { file: path });
		}

		var data = fs.readFileSync(path, 'utf8');
		return JSON.parse(data);
	} catch (e) {
		return context.errorHandler('errors.badJSON', { file: path, msg: e.message });
	}
}

module.exports.i18nContext = i18nContext;