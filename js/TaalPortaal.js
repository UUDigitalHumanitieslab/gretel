/* TaalPortaal.js */
/*
author: Frank Landsbergen (INL)

version 1.0 date: 25.06.2014
version 1.1 date: 30.06.2014 set default sentence in PHP script
version 1.2 date: 25.02.2015 deal with diacritics
version 1.3 date: 25.03.2016 improved URI decoding, removed examplefiller:
	not necessary if you put everything inside an if-clause.
	Call taalPortaalFiller() on the pages (input.php) that are required
	(by Bram Vanroy for CCL)

included in GrETEL/Nederbooms by Liesbeth Augustinus
*/

function taalPortaalFiller() {
	if (getUrlVars()["tpinput"]) {
		// Decode URI into readable string
		var tpinput = decodeURIComponent(getUrlVars()["tpinput"]);
		
		//Verschillende opties voor de verschillende pagina's:
		//(1) gretel voor lassy, gretel voor cgn: inputveld heeft id=example:
		$('#example').val(tpinput);
		//(4) XPath search: inputveld heeft name=xpinput
		$('textarea[name=xpinput]').val(tpinput);
	}
}

function getUrlVars() {
	var vars = [],
		hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}
