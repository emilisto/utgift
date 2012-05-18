/*
fsbOppnaFonster()

Argument:
  url        - Webbadress till f�nstrets inneh�ll.
  namn       - F�nstrets namn. Anv�nds f�r att referera till f�nstret. Motsvarar attributet "target" i <a>.
               Standardv�rde: "_blank"
  bredd      - F�nsterytans bredd, d v s f�nstrets innerm�tt p� h�jden, exklusive ram, menyrad, verktygsf�lt/knappar, 
               adressf�lt etc. Standardv�rde: tidigare f�nsters bredd.
  hojd       - F�nsterytans h�jd enligt ovan. Standardv�rde: tidigare f�nsters h�jd.
  attribut   - �vriga f�nsterattribut (dvs utom bredd och h�jd, se dokumentation f�r detaljer). Standardv�rde:
               "scrollbars=yes,resizable=yes,status=yes,menubar=yes,directories=yes,toolbar=yes,location=yes"

Version 1.3, 2004-03-31, Henrik Wall
Revision 2004-05-27, Therese Franzen. Tagit bort rad som orskade ett extra anrop till det ny�ppnade f�nstret, 
			dvs tv� requester postades.

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