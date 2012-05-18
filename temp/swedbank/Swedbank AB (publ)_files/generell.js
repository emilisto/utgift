var iconOsynlig = "../../images/gor_synlig.gif";
var iconSynlig = "../../images/gor_osynlig.gif"; 

function blockVisibility(id,nr) {
	var elem = document.getElementById(id);
	if (elem && elem.style) {
		elem.style.display = elem.style.display = 'block';
		if(eval('document.dynamisk_bild'+nr)){
			eval('document.dynamisk_bild'+nr+'.src=iconSynlig');
		}
	}
}

function noneVisibility(id,nr) {
	var elem = document.getElementById(id);
	if (elem && elem.style) {
		elem.style.display = elem.style.display = 'none';
		if(eval('document.dynamisk_bild'+nr)){
			eval('document.dynamisk_bild'+nr+'.src=iconOsynlig');
		}
	}
}


/* toggleVisibility
alternerar det synliga och osynlig l�get
�ndrar synlighet av f�lt
�ndrar ikonen
anropar funktion tomFelt()
*/
function toggleVisibility(id,nr) {
	var elem = document.getElementById(id);
	if (elem && elem.style) {
		if (elem.style.display == 'none'){
			elem.style.display = 'block';
			eval('document.dynamisk_bild'+nr+'.src=iconSynlig');
			}else{
			elem.style.display = 'none';
			eval('document.dynamisk_bild'+nr+'.src=iconOsynlig');
			}
	}
}
/*endra_dynamisk_ruta
ifall man klickar p� l�nken f�r att f�lla ut och in den dynamiska rutan
anropar funktion toggleVisibility(id)
*/
function endra_dynamisk_ruta(formnamn, divnamn,nr){
	toggleVisibility(divnamn,nr);
}


/*steng_dynamisk_ruta
ifall man klickar p� l�nken f�r att minimera den dynamiska rutan
anropar funktion noneVisibility(id,nr)

parameter formnamn - form-taggens namn
parameter divnamn - div-taggens namn som inkapslar f�lten som skall g�mmas
parameter nr - anv�nds f�r att s�rskilja flera likadana p� samma sida
*/
function steng_dynamisk_ruta(formnamn,divnamn,nr){
	noneVisibility(divnamn,nr);
}

/*oppna_dynamisk_ruta
ifall man klickar p� l�nken f�r att minimera den dynamiska rutan

anropar funktion blockVisibility(id,nr)

parameter formnamn - form-taggens namn
parameter divnamn - div-taggens namn som inkapslar f�lten som skall visas
parameter nr - anv�nds f�r att s�rskilja flera likadana p� samma sida
*/
function oppna_dynamisk_ruta(formnamn,divnamn,nr){
	blockVisibility(divnamn,nr);
}

/*visaFelt
�ppnar och st�nger f�lt beroende p� val i dropdown lista

anropar fuktionerna steng_dynamisk_ruta och oppna_dynamisk_ruta

parameter formnamn - form-taggens namn
parameter elementnamn - dropdownlistans namn
parameter divnamn - div-taggens namn som inkapslar f�lten som skall visas/g�mmas
parameter nr - anv�nds f�r att s�rskilja flera likadana p� samma sida
parameter indexArray - en array med index f�r val i dropdownlista f�r vilka vald f�lt ej skall visas
*/

function visaFelt(formnamn,elementnamn,divnamn,nr,indexArray){
var val =  eval('document.'+formnamn+'.'+elementnamn).selectedIndex;
	for (i=0;i<indexArray.length;i++){  
		if (val==indexArray[i]){
			steng_dynamisk_ruta(formnamn,divnamn,nr);
			break;
		}else{
			oppna_dynamisk_ruta(formnamn,divnamn,nr);
		}
	}
}

/* tomFelt
t�mmer f�lt ifall man g�r f�lten osynliga

parameter formnamn - form-taggens namn
parameter feltArray - en array med inmatningsf�lt som skall t�mmas
parameter listaArray - en array med alla dropdownlistor som skall �ndras till f�rsta option-taggen
parameter kryssrutaArray - en array med arrayer som inneh�ller kryssrutans namn samt true/false om den skall vara ikryssad
parameter radioknappArray - en array med arrayer som inneh�ller radioknappgruppens namn samt vilket index som skall vara vald

*/
function tomFelt(formnamn,feltArray,listaArray,kryssrutaArray,radioknappArray){
	if (feltArray!=null){
		for(i=0;i<feltArray.length;i++){
			eval('document.'+formnamn+'.'+feltArray[i]+'.value=""');
		}
	}
	if (listaArray!=null){
		for(j=0;j<listaArray.length;j++){
			eval('document.'+formnamn+'.'+listaArray[j]+'.selectedIndex="0"');
		}
	}
	if (kryssrutaArray!=null){
		for(k=0;k<kryssrutaArray.length;k++){
			kryssruta = kryssrutaArray[k];
			if(kryssruta!=null){
				eval('document.'+formnamn+'.'+kryssruta[0]+'.checked='+kryssruta[1]);
			}
		}
	}
	if (radioknappArray!=null){
		for(m=0;m<radioknappArray.length;m++){
			if(radioknappArray[m]!=null){
				eval('document.'+formnamn+'.'+radioknappArray[m][0]+'['+radioknappArray[m][1]+'].checked=true');
			}
		}
	}else{
	}
}

/* openWindow
�ppnar nytt f�nster p� adressen som skickas in
parameter inPage - adressen till sidan p� fsb's externa web
*/
function openWindow(inPage) 
{
 var wPage = open(inPage,"","menubar,resizable,scrollbars,height=450,width=640");
 if (wPage == null)
 {
 alert ("Det g&aring;r inte att &ouml;ppna fler f&ouml;nster. St&auml;ng alla f&ouml;nster som inte tillh&ouml;r F&ouml;reningssparbanken via Internet och f&ouml;rs&ouml;k igen!.");
 }
 else
 {
 wPage.location = inPage;
 document.isUnloading = false;
 }
} 

/* addFieldValue
L�gger inskickat v�rde p� det f�lt som anges.
Kan tex anropas av en Knapp vid onclick f�r att s�tta ett v�rde p� ett hiddenf�lt
*/
function addFieldValue(fieldName,value) {
    fieldName.value = value;
}

/* endraAktiverad
Skriptet g�r f�lten skrivskyddade eller inte beroende p� vilket alternativ i radiobutton man gjort.
De skrivskyddade f�lten t�ms n�r de inaktiveras.

parameter formnamn - form-taggens namn
parameter radioknappnamn - namn p� radio-taggens i vilken man klickar och f�r f�lten aktiverade eller inaktiverade
parameter inaktiveradnr - siffra som anger vilket alternativ p� radioknapp som ska ge inaktiverat f�lt
parameter feltArray - en array med inmatningsf�lt som skall alterneras mellan inaktiverat/aktiverat
*/
function endraAktiverad(formnamn, radioknappnamn, inaktiveradnr, feltArray){
           var val =  eval('document.'+formnamn+'.'+radioknappnamn);
           if (val[0].checked){
                      if (feltArray!=null){
                                 for(i=0;i<feltArray.length;i++){                                 
                                            eval('document.'+formnamn+'.'+feltArray[i]+'.disabled=false');
                                 }
                      }
           }else{
                      if (feltArray!=null){
                                 for(i=0;i<feltArray.length;i++){
                                            eval('document.'+formnamn+'.'+feltArray[i]+'.value=""');
                                            eval('document.'+formnamn+'.'+feltArray[i]+'.disabled=true');
                                 }
                      }
           }
}

/**
*	Byter v�rdet p� display-attributen p� ett element. Kan anv�ndas
*	f�r att ta bort / ta fram element p� en sida.
*	@param elemId	Id p� elementet ifr�ga.
*	@param value	Det nya v�rdet
*
*	@author Alex Sanchez, Projekt: Teddy IT
*/
function changeDisplay(elemId, value) {
	var  elem = document.getElementById(elemId);
	if (elem && elem.style) {
		elem.style.display = value;
	}
}

/**
*	Tar bort och tar fram flera element samtidigt p� en sida.
*	@param hideElemsIds		en eller flera (array) id p� element som ska tas bort
*	@param showElemsIds		en eller flera (array) id p� element som ska tas fram
*	@param showValue		eventuellt v�rde som talar om hur elementen ska visas.
*.
*	@author Alex Sanchez, Projekt: Teddy IT
*/
function changeDisplaySwitch(hideElemsIds, showElemsIds, showValue) {
	var value;
	// ta bort element
	if (hideElemsIds) {
		value = 'none';
		if (hideElemsIds.constructor == Array) {
			for (i=0; i<hideElemsIds.length; i++) {
				changeDisplay(hideElemsIds[i], value);
			}
		} else {
			changeDisplay(hideElemsIds, value);
		}
	}
	// ta fram element
	if (showElemsIds) {
		if (showValue) {
			value = showValue;
		} else {
			value = 'block';
		}
		if (showElemsIds.constructor == Array) {
			for (i=0; i<showElemsIds.length; i++) {
				changeDisplay(showElemsIds[i], value);
			}
		} else {
			changeDisplay(showElemsIds, value);
		}
	}
}

/**
*	Aktiverar resp. deaktiverar ett visst textf�lt och dess label.
*	@param active		om det ska aktiveras eller deaktiveras...
*	@param fieldID		id:t p� textf�ltet
*	@param labelID		id:t p� labeln som tillh�r textf�ltet
*.
*	@author Alex Sanchez, Projekt: Teddy IT
*/
function setFieldActive(active, fieldID, labelID) {
	var elem;
	//�ndra f�lt
	if (fieldID) {
		elem = document.getElementById(fieldID);
		if (elem) {
			if (active) {
				elem.className="textruta";
				elem.disabled=false;
			} else {
				elem.className="textruta-disabled";
				elem.disabled=true;
				elem.value="";
			}
		}
	}
	//�ndra label
	if (fieldID) {
		elem = document.getElementById(labelID);
		if (elem) {
			if (active) {
				elem.className="form-label";
			} else {
				elem.className="form-label-disabled";
			}
		}
	}
}

/* addFormFieldValue
L�gger inskickat v�rde p� det f�lt som anges.
Kan tex anropas av en Knapp vid onclick f�r att s�tta ett v�rde p� ett hiddenf�lt

parameter formnamn - form-taggens namn
parameter fieldName - namnet p� f�ltet som ska byta v�rde
parameter newValue - f�ltets nya v�rde 
*/
function addFormFieldValue(formnamn,fieldName,newValue) {
	var felt = eval('document.'+formnamn+'.'+fieldName);
	felt.value=newValue;	
}

/* addFieldValue
�ldre version av addFieldValue som ligger kvar av bak�tkompatibla sk�l
B�r ej anv�ndas l�ngre. Anv�nd ist�llet addFieldValue(formnamn,fieldName,newValue)

parameter fieldName - namnet p� f�ltet som ska byta v�rde
parameter newValue - f�ltets nya v�rde 
*/
function addFieldValue(fieldName,newValue) {
	fieldName.value=newValue;	
}


