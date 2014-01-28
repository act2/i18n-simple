/**
 * Copyright (c) 2014, ACT2 Technologies, Inc.
 *
 * Unit tests for i18n-simple node package
 *
 */
'use strict';

var path = require('path'),
	util = require('util'),
	should = require('chai').should(),
	expect = require('chai').expect,
	assert = require('chai').assert,
	chai = require('chai'),
	spies = require('chai-spies'),
	path = require('path'),
	i18n = require('../lib/i18n');

var stringObject = function (string) {
	this._string = string;
}
stringObject.prototype.toString = function () {
	return this._string;
}

chai.use(spies);

describe('Unit tests for i18n-simple', function () {

	describe('Configuration Options', function () {

		describe('Initialization', function () {

			it('should init properly with default values with default values', function () {
				i18n.init();
				i18n.should.have.property('directory', path.resolve('./locales'));
				i18n.should.have.property('fileExtension', '.json');
				i18n.should.have.property('locales');
				i18n.should.have.property('defaultLocale', 'en');
				i18n.should.have.property('currentLocale', 'en');
				i18n.should.have.property('pluralTag', 'plural');
				i18n.should.have.property('pluralOneTag', 'one');
				i18n.should.have.property('pluralOtherTag', 'other');
				i18n.should.have.property('genderTag', 'gender');
				i18n.should.have.property('genderFemaleTag', 'female');
				i18n.should.have.property('genderMaleTag', 'male');
				i18n.should.have.property('genderNeutralTag', 'neutral');
			});

			it('should init properly with supplied values with explicit call to init', function () {
				i18n.init({
						directory: './test/language',
						fileExtension: 'js',
						defaultLocale: 'es',
						currentLocale: 'en',
						defaultTag: '*',
						pluralTag: 'p',
						pluralOneTag: '1',
						pluralOtherTag: '*',
						genderTag: 'g',
						genderFemaleTag: 'f',
						genderMaleTag: 'm',
						genderNeutralTag: 'n'
					}
				);
				i18n.should.have.property('directory', path.resolve('./test/language'));
				i18n.should.have.property('fileExtension', '.js');
				i18n.should.have.property('locales');
				i18n.should.have.property('defaultLocale', 'es');
				i18n.should.have.property('currentLocale', 'en');
				i18n.should.have.property('pluralTag', 'p');
				i18n.should.have.property('pluralOneTag', '1');
				i18n.should.have.property('pluralOtherTag', '*');
				i18n.should.have.property('genderTag', 'g');
				i18n.should.have.property('genderFemaleTag', 'f');
				i18n.should.have.property('genderMaleTag', 'm');
				i18n.should.have.property('genderNeutralTag', 'n');
			});
		});

		describe('Getters and Setters', function () {
			it('should be able to change directory directly', function () {
				i18n.directory = './test/language';
				i18n.directory.should.equal(path.resolve('./test/language'));
			});

			it('should be able to change file extension directly', function () {
				i18n.fileExtension = '.js';
				i18n.fileExtension.should.equal('.js');
			});

			it('should be able to change default locale directly', function () {
				i18n.defaultLocale = 'en';
				i18n.defaultLocale.should.equal('en');
			});

			it('should be able to change current locale directly', function () {
				i18n.currentLocale = 'es';
				i18n.currentLocale.should.equal('es');
			});

			it('should be able to change complex default tag directly', function () {
				i18n.defaultTag = 'default';
				i18n.defaultTag.should.equal('default');
			});

			it('should be able to change complex plural tag directly', function () {
				i18n.pluralTag = 'plural';
				i18n.pluralTag.should.equal('plural');
			});

			it('should be able to change complex plural one tag directly', function () {
				i18n.pluralOneTag = 'one';
				i18n.pluralOneTag.should.equal('one');
			});

			it('should be able to change complex plural other tag directly', function () {
				i18n.pluralOtherTag = 'other';
				i18n.pluralOtherTag.should.equal('other');
			});

			it('should be able to change complex gender tag directly', function () {
				i18n.genderTag = 'gender';
				i18n.genderTag.should.equal('gender');
			});

			it('should be able to change complex gender female tag directly', function () {
				i18n.genderFemaleTag = 'female';
				i18n.genderFemaleTag.should.equal('female');
			});

			it('should be able to change complex gender male tag directly', function () {
				i18n.genderMaleTag = 'male';
				i18n.genderMaleTag.should.equal('male');
			});

			it('should be able to change complex gender neutral tag directly', function () {
				i18n.genderNeutralTag = 'neutral';
				i18n.genderNeutralTag.should.equal('neutral');
			});
		});
	});

	describe('Localization', function () {
		describe('Basic', function () {

			it('should return correct text with no dot notation', function () {
				i18n.init({ directory: './test/locales' });
				i18n.translate('Hello').should.equal('Hello');
			});

			it('should return correct text with dot notation', function () {
				i18n.translate('Hi.noName').should.equal('Hi');
			});

			it('should return correct text with dot notation replacement value substituted', function () {
				i18n.translate('Hi.withName', {replacements: {'name': 'Mickey'}}).should.equal('Hi, Mickey!');
			});

			it('should return correct text with dot notation replacement multiple value substituted', function () {
				i18n.translate('Hi.withSpouse', {replacements: {'name': 'Mickey', 'spouse': 'Minnie'}}).
					should.equal('Hi, Mickey! How is Minnie?');
			});

			it('should return correct text with dot notation replacement multiple value substituted for specific locale', function () {
				i18n.init({ directory: './test/locales'});
				i18n.translate('Hi.withSpouse', {replacements: {'name': 'Mickey', 'spouse': 'Minnie'}, locale: 'es'}).
					should.equal('¡Hola, Mickey! ¿Cómo es Minnie?');
			});

		});

		describe('Plural', function () {

			it('should return correct text with plural only default case', function () {
				i18n.init({ directory: './test/locales'});
				i18n.translate('dogs').should.equal('doggies');
			});

			it('should return correct text with plural set to boolean false case', function () {
				i18n.translate('dogs', {plural: false}).should.equal('dog');
			});

			it('should return correct text with plural set to number 1 case', function () {
				i18n.translate('dogs', {plural: 1}).should.equal('dog');
			});

			it('should return correct text with plural set to boolean true case', function () {
				i18n.translate('dogs', {plural: true}).should.equal('dogs');
			});

			it('should return correct text with plural set to number 2 case', function () {
				i18n.translate('dogs', {plural: 2}).should.equal('dogs');
			});

		});

		describe('Gender', function () {

			it('should return correct text with gender string literal set to default case', function () {
				i18n.init({ directory: './test/locales' });
				i18n.translate('3rdPersonPossessiveSingular').should.equal('her/his/its');
			});

			it('should return correct text with gender string literal set to female case', function () {
				i18n.translate('3rdPersonPossessiveSingular', {gender: 'female'}).should.equal('her');
			});

			it('should return correct text with gender string literal set to male case', function () {
				i18n.translate('3rdPersonPossessiveSingular', {gender: 'male'}).should.equal('his');
			});

			it('should return correct text with gender string literal set to neutral case', function () {
				i18n.translate('3rdPersonPossessiveSingular', {gender: 'neutral'}).should.equal('its');
			});

			it('should return correct text with gender string object set to female case', function () {
				var sex = new stringObject('female');
				i18n.translate('3rdPersonPossessiveSingular', {gender: sex}).should.equal('her');
			});

			it('should return correct text with gender string object set to male case', function () {
				var sex = new stringObject('male');
				i18n.translate('3rdPersonPossessiveSingular', {gender: sex}).should.equal('his');
			});

			it('should return correct text with gender string object set to neutral case', function () {
				var sex = new stringObject('neutral');
				i18n.translate('3rdPersonPossessiveSingular', {gender: sex}).should.equal('its');
			});

		});

		describe('Plural->Gender Combined', function () {

			it('should return correct text with plural set to boolean false and gender female', function () {
				i18n.translate('Howdy', {plural: false, gender: 'female'}).should.equal("Howdy, ma'am!");
			});

			it('should return correct text with plural set to boolean false and gender male', function () {
				i18n.translate('Howdy', {plural: false, gender: 'male'}).should.equal("Howdy, sir!");
			});

			it('should return correct text with plural set to boolean false and gender female', function () {
				i18n.translate('Howdy', {plural: false, gender: 'neutral'}).should.equal("Howdy there!");
			});

			it('should return correct text with plural set to boolean true and gender female', function () {
				i18n.translate('Howdy', {plural: true, gender: 'female'}).should.equal("Howdy, ladies!");
			});

			it('should return correct text with plural set to boolean true and gender male', function () {
				i18n.translate('Howdy', {plural: true, gender: 'male'}).should.equal("Howdy, gents!");
			});

			it('should return correct text with plural set to boolean true and gender female', function () {
				i18n.translate('Howdy', {plural: true, gender: 'neutral'}).should.equal("Howdy, y'all!");
			});
		});

		describe('Gender->Plural Combined', function () {

			it('should return correct text with plural set to boolean false and gender female', function () {
				i18n.translate('Goodbye', {plural: false, gender: 'female'}).should.equal("Goodbye, ma'am!");
			});

			it('should return correct text with plural set to boolean false and gender male', function () {
				i18n.translate('Goodbye', {plural: false, gender: 'male'}).should.equal("Goodbye, sir!");
			});

			it('should return correct text with plural set to boolean false and gender female', function () {
				i18n.translate('Goodbye', {plural: false, gender: 'neutral'}).should.equal("Goodbye there!");
			});

			it('should return correct text with plural set to boolean true and gender female', function () {
				i18n.translate('Goodbye', {plural: true, gender: 'female'}).should.equal("Goodbye, ladies!");
			});

			it('should return correct text with plural set to boolean true and gender male', function () {
				i18n.translate('Goodbye', {plural: true, gender: 'male'}).should.equal("Goodbye, gents!");
			});

			it('should return correct text with plural set to boolean true and gender female', function () {
				i18n.translate('Goodbye', {plural: true, gender: 'neutral'}).should.equal("Goodbye, y'all!");
			});
		});
	});

	describe('Localization Fallback', function () {
		it('should return fallback from default locale for missing text in current locale', function () {
			i18n.init({ directory: './test/locales', defaultLocale: 'en'});
			i18n.currentLocale = 'es';
			i18n.translate('Hello').should.equal('Hello');
		});
	});

	describe('Shortcut References', function () {
		it('should return shortcut reference item for simple case', function () {
			i18n.currentLocale = 'en';
			i18n.translate('relativeReferenceSimple.four').should.equal('one');
		});

		it('should return shortcut reference item for complex case', function () {
			i18n.currentLocale = 'en';
			i18n.translate('relativeReferenceComplex',
				{ plural: false, gender: 'neutral', replacements: {ref: 'reference'} }
			).should.equal('relative male reference');
		});
	});

	describe('References to other fields in locale file', function () {
		it('should return correct text with dot notation some references from locales file', function () {
			i18n.init({ directory: './test/locales'});
			i18n.translate('Hi.withSpouse', {replacements: {spouse: 'Minnie'}}).
				should.equal('Hi, Mickey Mouse! How is Minnie?');
		});

		it('should return correct text with dot notation all references shallow from locales file', function () {
			i18n.translate('HelloReferencesOnly', {plural: false, gender: 'male'}).
				should.equal('Hello, Mickey Mouse! Goodbye, sir!');
		});

		it('should return correct text with dot notation all references deep from locales file', function () {
			i18n.translate('Hi.withRefSpouse').
				should.equal('Hi, Mickey! How is Minnie?');
		});

	});

	describe('Error Conditions and Handling', function () {
		it('should throw error on invalid directory setting', function () {
			var junkDir = path.resolve('junk');
			(function(){i18n.directory = 'junk'}).should.throw(
				util.format('Invalid locale directory - directory "%s" does not exist', junkDir));
		});

		it('should throw error on invalid default locale setting', function () {
			(function(){i18n.defaultLocale = 'junk'}).should.throw('New default locale "junk" is not in acceptable locales list');
		});

		it('should throw error on invalid current locale setting', function () {
			(function(){i18n.currentLocale = 'junk'}).should.throw('New current locale "junk" is not in acceptable locales list');
		});

		it('should throw error on non string default tag setting', function () {
			(function(){i18n.defaultTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string plural tag setting', function () {
			(function(){i18n.pluralTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string pluralOne tag setting', function () {
			(function(){i18n.pluralOneTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string pluralOther tag setting', function () {
			(function(){i18n.pluralOtherTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string gender tag setting', function () {
			(function(){i18n.genderTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string genderFemale tag setting', function () {
			(function(){i18n.genderFemaleTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string genderMale tag setting', function () {
			(function(){i18n.genderMaleTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error on non string genderNeutral tag setting', function () {
			(function(){i18n.genderNeutralTag = false}).should.throw('Invalid parameter - expects literal string value');
		});

		it('should throw error when key is not supplied for localize call', function () {
			(function(){i18n.translate()}).should.throw('"Key" parameter required');
		});

		it('should throw error when plural parameter is not boolean or number', function () {
			(function(){i18n.translate('Howdy', {plural: 'yes'})}).should.throw('Invalid plural parameter - expected boolean or number');
		});

		it('should throw error when gender parameter is not one of the set gender tags', function () {
			(function(){i18n.translate('Howdy', {gender: 'dog'})}).should.throw('Invalid gender parameter - expects either "female", "male" or "neutral"');
		});

		it('should throw error when replacements parameter is not an object', function () {
			(function(){i18n.translate('Howdy', {replacements: 'dog'})}).should.throw('Invalid "replacements" parameter - expects JSON object');
		});

		it('should throw error when locale parameter is not in the allowed locales list', function () {
			(function(){i18n.translate('Howdy', {locale: 'de'})}).should.throw('Supplied locale "de" is not in acceptable locales list');
		});

		it('should throw Spanish error when default locale parameter is set to "es"', function () {
			i18n.defaultLocale = 'es';
			(function(){i18n.translate('Howdy', {locale: 'de'})}).should.throw('Se suministra idioma "de" no está en la lista de idiomas aceptables');
		});

		it('should catch emitted error with EventEmitter handler defined on i18n', function(done) {
			var spy = chai.spy();
			i18n.on('error', spy);
			i18n.translate('Howdy', {locale: 'de'});
			expect(spy).to.have.been.called();
			done();
		});
	});
});
