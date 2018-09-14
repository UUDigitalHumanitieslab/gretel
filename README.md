[![Build Status](https://travis-ci.org/UUDigitalHumanitieslab/gretel.svg?branch=develop)](https://travis-ci.org/UUDigitalHumanitieslab/gretel)

# GrETEL 4

This is currently under active development. The stable predecessor can be found at http://gretel.ccl.kuleuven.be/gretel3 (and the source at https://github.com/CCL-KULeuven/gretel/).

## Info

* v4.0.0 June 2018: First GrETEL 4 release with new interface.
* v3.9.99 November 2017: GrETEL 4 currently under development!
* v3.0.2 July 2017: Show error message if the BaseX server is down  
* v3.0. November 2016: GrETEL 3 initial release. Available at http://gretel.ccl.kuleuven.be/gretel3

### Branches

master: official version of GrETEL 4, available at http://gretel.hum.uu.nl/gretel3/
dev: development version  
gretel2.0: official version of GrETEL 2.0, available at http://gretel.ccl.kuleuven.be/gretel-2.0  

## Installation

### Prerequisites

Next to a standard LAMP server (with a PHP version > 5.4), GrETEL requires the following packages to be installed on your machine:

* [BaseX](https://packages.debian.org/jessie/database/basex)
* [SimpleXML](http://php.net/manual/en/book.simplexml.php)
* [Perl](https://packages.debian.org/jessie/perl/perl) with:
  * [XML::Twig](https://packages.debian.org/jessie/libxml-twig-perl)
  * [XML::XPath](https://packages.debian.org/jessie/libxml-xpath-perl)

### Next steps

1. Download (or clone) GrETEL from GitHub.
2. Download the Alpino dependency parser. Current binary used in the live version: `Alpino-x86_64-linux-glibc2.5-20548-sicstus` (available [here](http://www.let.rug.nl/vannoord/alp/Alpino/versions/binary)). 

> It is recommended to use the same version used for creating the treebanks. This way an example based search will result in the same search structure as stored in the database.

3. Create BaseX databases containing the treebanks you want to make available (not necessary when using GrETEL-upload).
4. Adapt `config.example.php` file and change name to `config.php`, and then:
  * Set the path to the Alpino dependency parser in the variable `$alpinoDirectory` (by default: directory `parsers`)
  * Set BaseX variables (machine names, port numbers, password and username)
5. Install [composer](https://getcomposer.org/) to be able to install PHP dependencies.
6. Enable the rewrite mdoule (e.g. `sudo a2enmod rewrite && sudo systemctl restart apache2`).
6. Run `npm run build` to compile all the dependencies.
7. Make sure `tmp` and `log` folders exist in the root and can be accessed by Apache.

## Notes for users

Only the properties of the first node matched by an XPATH variable is returned for analysis. For example:

A user searches for `//node[node]`. Two variables are found in this query: `$node1 = //node` and `$node2 = $node1[node]`.

The following sentence would match this query: 

`node[np] (node[det] node[noun])`

The node found for `$node1` will then be `node[np]`. 
The node found for `$node2` will then be `node[det]`. The properties of `node[noun]` will not be available for analysis using this query.

When searching for a more specific structure, this is unlikely to occur.

## Notes for developers

### Front-end

The [Angular 6](https://angular.io) front-end can be found under `web-ui` and run from there: `npm run start`.

### Back-end

* The results that are flushed to the user at a time as well as the maximum results that will be fetched is stored in variables in `config.php`. Change `$flushLimit` and `$resultsLimit` to the values that you want.
* Scripts are organised according to their function:
  * `basex-search-scripts/`: scripts that are required to do the actual searching for results. However, the `basex-client.php` is sometimes needed in other cases as well to open up a BaseX session.
  * `front-end-includes/`: files that are included or required by other scripts and that present content rather than execute functions are stored here (e.g. `head.php`, `footer.php`). Content that is shared between the example-based search and the XPath search can be found here as well §e.g. `results-shared-content.php`).
  * `preparatory-scripts/`: scripts that run functions on the input leading up to but not including the actual fetching of results. These scripts manipulate do things such as creating XPath, generating breadth-first patterns, parsing the input, and modifying input examples.
  * `functions.php`: contains general functions that are often required but that are not specific to any part of the process
  * `helpers.php`: basic helper functions that return booleans.

## Credits

* [Liesbeth Augustinus](http://www.ccl.kuleuven.be/~liesbeth/): concept and initial implementation;
* [Vincent Vandeghinste](http://www.ccl.kuleuven.be/~vincent/ccl): concept and initial implementation;
* [Bram Vanroy](http://bramvanroy.be/): GrETEL 3 improvements and design;
* [Martijn van der Klis](http://www.uu.nl/staff/MHvanderKlis): initial GrETEL 4 functionality and improvements;
* [Sheean Spoel](http://www.uu.nl/staff/SJJSpoel): additional GrETEL 4 functionality and improvements;
* [Gerson Foks](https://www.uu.nl/staff/GFoks): additional GrETEL 4 functionality and improvements;
* Colleagues at the Centre for Computational Linguistics at KU Leuven, and Utrecht University Digital Humanities Lab for their feedback.

## License

This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (cc-by-sa-4.0). See the [license.txt](license.txt) file for license rights and limitations.
