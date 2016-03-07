/* TaalPortaal.js */
/*
author: Frank Landsbergen (INL)
version 1.0 date: 25.06.2014
version 1.1 date: 30.06.2014 set default sentence in PHP script

included in GrETEL/Nederbooms by Liesbeth Augustinus
*/

jQuery(document).ready(function() {
    fillInputField();                                               //taalportaalextensie
});

function fillInputField(){

    //var examplefiller = "Dit is een zin."; //De standaardzin die we invullen als er geen argument is meegegeven in de url
 
    var tpinput = getUrlVars()["tpinput"];              //Zoek specifiek op waarde van 'tpinput'
    if(getUrlVars()["tpinput"]){
        tpinput = tpinput.split('%20').join(' ');        //zet %20 om in spaties
        tpinput = tpinput.split('+').join(' ');            //(voor de zekerheid) zet + om in spaties
        examplefiller = tpinput;
    }
    //Verschillende opties voor de verschillende pagina's:
    //(1) gretel voor lassy, gretel voor cgn: inputveld heeft id=example:
    $('#example').val(examplefiller);
    //(2) stringsearch in lassy, stringsearch in cgn: inputveld heeft name=string;
    $('input[name=string]').val(examplefiller);
    //(3) alpino: inputveld heeft name=input
    $('input[name=input]').val(examplefiller);
}

function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}