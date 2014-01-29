# i18n-simple

Powerful, but easy to use, i18n translation for Node with support for replacement variables, plurals and gender. Reads from language files stored as JSON files. Very lightweight -- only 500 SLOC (including comments).

[![Build Status](https://travis-ci.org/act2/i18n-simple.png?branch=master)](https://travis-ci.org/act2/i18n-simple)

## Key Features
* **Easy to Use** - written by a seasoned developer for developers
* **Translation Files** - easy to create and maintain JSON files
* **Fallback** - will automatically select matching text from default locale if match is not found in current locale
* **Lazy Loading** - language files are not loaded into memory until required
* **Synchronous** - no asynchronous methods so no need to worry about callbacks
* **Plural Support** - out of the box support for plural text selection
* **Gender Support** - out of the box support for gender-based text selection
* **Replacement Parameters** - supports replaceable text through named parameters
* **Shortcuts** - can easily reference sibling elements to help you avoid defining duplicate strings in language files
* **Self References** - can easily reference other elements in the same file as replacement values to produce complex combinations
* **Error Handling** - supports either throwing errors or emitting events to an EventEmitter handler. 
* **Fast** - It wouldn't be Node if it wasn't

## Install

	npm install i18n-simple
	
## Test 

	mocha

## Getting Started

	// load module
	var i18n = require("i18n-simple");
	
## Initialization

You can skip initialization if you want to run with all defaults. Otherwise, you need to explicitly call i18n.init() with the configuration values that you want to change in object literal notation. 

### list of configuration options (all optional)

	i18n.init({
	    // path to directory containing the translation files. defaults to './locales'.
	    directory:'./language_files',

	    // locale filename extension. defaults to '.json'.
	    fileExtension: 'js',
	    
	    // string matching one of the locales in the directory. If only one locale file, this is automatically set as the default. 
	    // If there is more than one locale file, defaults to 'en', assuming this file exists, otherwise, chooses first locale.
	    defaultLocale: 'es',

	    // string matching one of the locales in the directory. defaults to the defaultLocale value.
	    currentLocale: 'es',

	    // string representing complex definition default text tag. defaults to 'default'.
	    defaultTag: 'def',

	    // string representing complex definition plural tag. defaults to 'plural'.
	    pluralTag: "p",

	    // string representing complex definition plural one tag. defaults to 'one'.
	    pluralOneTag: '1',
	    
	    // string representing complex definition plural one tag. defaults to 'other'.
	    pluralOtherTag: '*',
	    
	    // string representing complex definition gender tag. defaults to 'gender'.
	    genderTag: 'g',
	    
	    // string representing complex definition gender female tag. defaults to 'female'.
	    genderFemaleTag: 'f',
	    
	    // string representing complex definition gender male tag. defaults to 'male'.
	    genderMaleTag: 'm',
	    
	    // string representing complex definition gender neutral tag. defaults to 'neutral'.
	    genderNeutralTag: 'n',
	});

### Changing configuration values at run-time
All of the properties available in the init method can be set directly at run time. However, in practice, only changing the current locale is recommended as the other settings impact the loading and parsing of the language files. All attributes are accessed through getter/setter properties.

#### Example property change
This changes the current locale to Spanish.

	i18n.currentLocale = 'es';

## Public Methods

###i18n.init([options] [, context])
**Options**:

 * **directory** - path to translation files. defaults to './locales'.
 * **defaultLocale** - string matching one of the locales array entries. defaults to 'en'.
 * **currentLocale** - string matching one of the locales array entries. defaults to 'en'.
 * **fileExtension** - string representing locale filename extension. defaults to '.json'.
 * **defaultTag** - string representing complex definition default text tag. defaults to 'default'.
 * **pluralTag** - string representing complex definition plural tag. defaults to 'plural'.
 * **pluralOneTag** - string representing complex definition plural one tag. defaults to 'one'.
 * **pluralOtherTag** - string representing complex definition plural one tag. defaults to 'other'.
 * **genderTag** - string representing complex definition gender tag. defaults to 'gender'.
 * **genderFemaleTag** - string representing complex definition gender female tag. defaults to 'female'.
 * **genderMaleTag** - string representing complex definition gender male tag. defaults to 'male'.
 * **genderNeutralTag** - string representing complex definition gender neutral tag. defaults to 'neutral'.

**Context**: a string identifying a named context to initialize (see context section below for more details). If no context is specified, this sets up a default context.
Otherwise, when a string context name is passed in, it sets up a named context.

###i18n.t or i18n.translate(key [, options] [, context])
You can either use the ".t" method if you like to keep things short and sweet, or you can use the ".translate" method if you prefer verbose. There is absolutely no difference other than the name, in fact, they both point to the same function.

**Key**: JSON key value for text lookup in language file. May be dot notated for multiple level depths.

**Options**:
An object literal notation of the following options:

* **plural** {boolean} [true|false] - determines if plural form is used for complex language lookup
* **gender** {string} - one of the gender tag values. default [female|male|neutral]. determines the gender for complex language lookup
* **replacements** {object literal} - name / value pairs in object literal notation for value substitution in replacement strings.

**Context**: an optional string identifying the named context to use for the translation (see context section below for more details). If no context is specified,
the default context is used.

###i18n.getAttr(attribute, context)
Returns a specific attribute (options above in init method) for a specific context

###i18n.setAttr(attribute, value, context)
Sets a specific attribute (options above in init method) for a specific context

## Wrapper Methods for the embedded EventEmitter class
A Node EventEmitter is embedded into the i18n-simple module for error notification if bound to a handler function.  Please refer to the Node event documentation for details of these methods at [http://nodejs.org/api/events.html](http://nodejs.org/api/events.html)

###i18n.on(event, listener)
###i18n.once(event, listener)
###i18n.removeListener(event, listener)
###i18n.removeAllListeners(event)
###i18n.setMaxListeners(n)
###i18n.listeners(event)


## Design Decisions
1. Entries do not get added to the language files if they are not found. Instead, calls to ".t" or ".translate" return "undefined".
2. K.I.S.S. - Keep it simple, stupid [http://en.wikipedia.org/wiki/KISS_principle](http://en.wikipedia.org/wiki/KISS_principle).
3. Lookup key values are case sensitive.
4. The lookup keys allow for dot notation to parse multiple levels down into a JSON hierarchy. Because of this, do not use periods in the keys unless you mean for this multi-depth lookup to occur.
5. The lookup keys best lend themselves to mnemonic-style rather than verbose.  For example, here is a snippet from the language file for this library:

	Numbers 4 & 5 above allow for referring to "expectsString" as "errors.badParameter.expectsString".
	
		"errors" : {
		"badParameter" : {
			"expectsString" : "Invalid parameter - expects literal string value",

## Contexts
Contexts allow for multiple translation settings each having their own set of options and translation files. This is useful when creating a package
with i18n-simple for inclusion in another project.  The package should set its own context to a unique value (the package name is a great choice).
Then, it must use the context parameters when invoking the translate method.  This allows the package to maintain its translations separate from the main program.
If contexts are not used in this scenario, the i18n-simple in both the main program and the package will interfere with each other.  It is recommended that the
main program use the default context although it is perfectly acceptable for the main program to use a named context.

## Language Files
### General Rules
1. Must be properly formed JSON. To verify, use a free online tool such as [http://jsonlint.com/](http://jsonlint.com/).
2. The plural / one / other tags must be either the defaults or the ones you specified at init time.
3. The gender / female / male / neutral tags must be either the defaults or the ones you specified at init time.
4. Language translation rules can be simple name / value pairs or nested name value pairs without implication of plural or gender:

    	// super simple rule - Hello = Howdy there!
    	"Hello" : "Howdy there!"
    	
    	// nested simple rule access through dot notation
    	"Hi" : {
			"formal": "Good afternoon",
			"informal": "Yo, sup?"
			}
		
5. Language translation rules can be complex where structure implies plural and/or gender relationships. See below for Plural and Gender complex structures.

### Shortcuts
Shortcuts quickly refer to sibling elements using an @ symbol.  For example:

	{
		"Hello", {
			"default" : "Hello",
			"gender" : {
				"female" : "Hello, ladies!",
				"male": "Hello, guys!",
				"neutral": "@male"
			}
		}
	}		

Note the @male reference.  Because of this, the neutral reference will return the same text as the male reference. Any value that begins with an @ sign is used to look up a sibling translation **at the same level**.  This is important to note. In the above example, you could not refer to the "default" value because it is one level up from "neutral".  To refer to another element at a different level in the hierarchy, you can use replacement parameters.

### Replacement Parameters
Replacement parameters take the form "{{parameter_name}}".  Spaces inside the brackets are optional. Therefore, "{{name}}" is the same as "{{ name }}". This is left up to you as the developer based on your preference and you may mix and match.  When this pattern is encountered in a translation string, parameter substitution occurs if a match is found.  For example if the language file contained an entry that looked like:

	{
		"askAboutSpouse": "Hi, {{family.husband}}! How is {{ family.wife }}?",
		"family" : {
			"husband" : "Mickey Mouse",
			"wife" : "Minnie"
			}
	}

The call to translate "askAboutSpouse" would return "Hi, Mickey Mouse! How is Minnie?" The ".t" or ".translate" methods first look for parameters passed in explicitly in their method invocation.  If replacements are not explicitly passed, then the current locale file is searched for suitable replacements.  Dot notation may be used for in-file reference and are always absolute paths from the root element. For example, to get the name of Mickey's wife in the above language file, you would refer to "family.wife".

### Plural
Plural lookups are defined in the language files with the following pattern:

	"tagName" : {
		"default" : "default text", //text to return if no plural boolean specified
		"plural" : {
			"one" : "text for only one",
			"other" : "text for any other"
		}
	}

### Gender
Gender lookups are defined in the language files with the following pattern:

	"tagName" : {
		"default" : "default text", //text to return if no gender tag specified
		"gender" : {
			"female" : "text for female variant",
			"male" : "text for male variant",
			"neutral" : "text for neutral variant"
		}
	}

### Nesting plurals and gender
Plurals may be nested within gender and vice versa. Developer's choice. 

#### Example gender nested within plural

	"Howdy": {
		"default": "Howdy!",
		"plural": {
			"one": {
				"gender" : {
					"female": "Howdy, ma'am!",
					"male": "Howdy, sir!",
					"neutral": "Howdy there!"
				}
			},
			"other": {
				"gender" : {
					"female": "Howdy, ladies!",
					"male": "Howdy, gents!",
					"neutral": "Howdy, y'all!"
				}
			}
		}
	},


####Example plural nested within gender

	"Goodbye": {
		"default": "Goodbye!",
		"gender" : {
			"female": {
				"plural": {
					"one": "Goodbye, ma'am!",
					"other": "Goodbye, ladies!"
				}
			},
			"male": {
				"plural": {
					"one": "Goodbye, sir!",
					"other": "Goodbye, gents!"
				}
			},
			"neutral": {
				"plural": {
					"one": "Goodbye there!",
					"other": "Goodbye, y'all!"
				}
			}
		}
	},
		
## Example usage

The examples below all use the following language file (the actual test file for the Mocha tests):
	
### Example Language File

    {
        "Hello": "Hello",
        "name" : "Mickey Mouse",
        "familyMouse" : {
            "husband" : "Mickey",
            "wife" : {
                "firstName" : "Minnie"
            }
        },
        "HelloReferencesOnly": "{{Hello}}, {{name}}! {{Goodbye}}",
        "Hi": {
            "noName" : "Hi",
            "withName": "Hi, {{name}}!",
            "withSpouse": "Hi, {{name}}! How is {{ spouse }}?",
            "withRefSpouse": "Hi, {{familyMouse.husband}}! How is {{ familyMouse.wife.firstName }}?"
        },
        "Howdy": {
            "default": "Howdy!",
            "plural": {
                "one": {
                    "gender" : {
                        "female": "Howdy, ma'am!",
                        "male": "Howdy, sir!",
                        "neutral": "Howdy there!"
                    }
                },
                "other": {
                    "gender" : {
                        "female": "Howdy, ladies!",
                        "male": "Howdy, gents!",
                        "neutral": "Howdy, y'all!"
                    }
                }
            }
        },
        "Goodbye": {
            "default": "Goodbye!",
            "gender" : {
                "female": {
                    "plural": {
                        "one": "Goodbye, ma'am!",
                        "other": "Goodbye, ladies!"
                    }
                },
                "male": {
                    "plural": {
                        "one": "Goodbye, sir!",
                        "other": "Goodbye, gents!"
                    }
                },
                "neutral": {
                    "plural": {
                        "one": "Goodbye there!",
                        "other": "Goodbye, y'all!"
                    }
                }
            }
        },
        "dogs" : {
            "default" : "doggies",
            "plural" : {
                "one" : "dog",
                "other" : "dogs"
            }
        },
        "3rdPersonPossessiveSingular" : {
            "default" : "her/his/its",
            "gender" : {
                "female" : "her",
                "male" : "his",
                "neutral": "its"
            }
        },
        "relativeReferenceSimple" : {
            "one" : "one",
            "two" : "two",
            "three" : "@one",
            "four" : "@one"
        },
        "relativeReferenceComplex": {
            "default": "default relative reference",
            "plural": {
                "one": {
                    "gender" : {
                        "female": "relative female {{ref}}",
                        "male": "relative male {{ref}}",
                        "neutral": "@male"
                    }
                },
                "other": {
                    "gender" : {
                        "female": "relative females {{ref}}",
                        "male": "relative males {{ref}}",
                        "neutral": "@male"
                    }
                }
            }
        }
    }

### Example simple usage
	// return "Hello"
	var text = i18n.translate('Hello');

### Example simple dot notation usage
	// return "Hi"
	var text = i18n.t('Hi.noName');

### Example simple replacement value
	// returns "Hi, Mickey Mouse!" because name is in language file and no explicit replacement values passed into method
	var text = i18n.translate('Hi.withName');

### Example simple replacement value with explicit values
	// returns "Hi, Donald Duck!" because name value is explicitly passed into method
	var text = i18n.t('Hi.withName', {replacements: {name: 'Donald Duck'}});

### Example complex definition with default value
	// returns "doggie" as default because no plural was specified
	var text = i18n.translate('dogs');

### Example complex definition with plural = true
	// returns "dogs" 
	var text = i18n.t('dogs', {plural: true});

### Example complex definition with gender = female
	// returns "her"
	var text = i18n.translate('3rdPersonPossessiveSingular', {gender: 'female'});

### Example complex combination of plural and gender
	// returns "Howdy, ladies!"
	var text = i18n.t('Howdy', {gender: 'female', plural: true});

### Example complex combination of plural, gender and replacements
	// returns "relative female reference"
	var text = i18n.translate('relativeReferenceComplex', {gender: 'female', plural: false, replacements: {ref: "reference"}});

### Example shortcut reference
	// returns "one" because "four" has the value of "@one" which points to it's sibling "one" and returns that value
	var text = i18n.t('relativeReferenceSimple.four');

## Error Handling
Internal errors generated by the i18n-simple library return an Error object with text message translated to the currently defined default language.  The following error message languages are supplied out of the box: English, Spanish, German, French, Italian, Japanese, Chinese (Simplified) and Russian. These can be found in the node_modules/i18n-simple/lib/locales directory. **Caveat**: Except for English, all of these were generated with Google Translate and the accuracy cannot be assured at this time.

### Without binding the event emitter
	try {
		var text = i18n.translate('some.key');
	} catch (e) {
		// handle exception
	}

### With binding the event emitter
	i18n.on('error', function (err) {
		// handle error
	});


## Changelog

* 1.0.0: initial stable release
* 1.0.2: added node version dependencies in package.json and .travis.yml for Travis CI
* 1.0.3: fixed issue #1 - deep reference in-file replacement broken
* 1.1.0: major refactor to handle issue #2 - addition of multiple translation context support

## Licensed under MIT

MIT License
Copyright (c) 2014, ACT2 Technologies, Inc.
http://www.act2hq.com
email: info@act2hq.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.