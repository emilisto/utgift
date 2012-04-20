/*
fsbOppnaFonster()

Argument:
  url        - Webbadress till fönstrets innehåll.
  namn       - Fönstrets namn. Används för att referera till fönstret. Motsvarar attributet "target" i <a>.
               Standardvärde: "_blank"
  bredd      - Fönsterytans bredd, d v s fönstrets innermått på höjden, exklusive ram, menyrad, verktygsfält/knappar, 
               adressfält etc. Standardvärde: tidigare fönsters bredd.
  hojd       - Fönsterytans höjd enligt ovan. Standardvärde: tidigare fönsters höjd.
  attribut   - Övriga fönsterattribut (dvs utom bredd och höjd, se dokumentation för detaljer). Standardvärde:
               "scrollbars=yes,resizable=yes,status=yes,menubar=yes,directories=yes,toolbar=yes,location=yes"

Version 1.3, 2004-03-31, Henrik Wall
Revision 2004-05-27, Therese Franzen. Tagit bort rad som orskade ett extra anrop till det nyöppnade fönstret, 
			dvs två requester postades.

Copyright (C) Swedbank AB, 2004.
All rights reserved.
*/ 
function fsbOppnaFonster(url, namn, bredd, hojd, attribut) {	
	if (namn == null) {
		namn = "_blank";
	}else{
  		if(sessionId != null){
   			namn = namn + sessionId;
  		}
 	}
	
	if (attribut == null) {
		attribut = "scrollbars=yes,resizable=yes,status=yes,menubar=yes,directories=yes,toolbar=yes,location=yes";
	}
	if (bredd != null) {
		attribut += ",width=" + bredd;
	}
	if (hojd != null) {
		attribut += ",height=" + hojd;
	}
	var nyttFonster = window.open(url, namn, attribut);
	if (nyttFonster.opener == null) {
		remote.opener = window;
	}
	nyttFonster.focus();
}