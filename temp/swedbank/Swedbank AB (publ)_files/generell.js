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
alternerar det synliga och osynlig läget
ändrar synlighet av fält
ändrar ikonen
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
ifall man klickar på länken för att fälla ut och in den dynamiska rutan
anropar funktion toggleVisibility(id)
*/
function endra_dynamisk_ruta(formnamn, divnamn,nr){
	toggleVisibility(divnamn,nr);
}


/*steng_dynamisk_ruta
ifall man klickar på länken för att minimera den dynamiska rutan
anropar funktion noneVisibility(id,nr)

parameter formnamn - form-taggens namn
parameter divnamn - div-taggens namn som inkapslar fälten som skall gömmas
parameter nr - används för att särskilja flera likadana på samma sida
*/
function steng_dynamisk_ruta(formnamn,divnamn,nr){
	noneVisibility(divnamn,nr);
}

/*oppna_dynamisk_ruta
ifall man klickar på länken för att minimera den dynamiska rutan

anropar funktion blockVisibility(id,nr)

parameter formnamn - form-taggens namn
parameter divnamn - div-taggens namn som inkapslar fälten som skall visas
parameter nr - används för att särskilja flera likadana på samma sida
*/
function oppna_dynamisk_ruta(formnamn,divnamn,nr){
	blockVisibility(divnamn,nr);
}

/*visaFelt
Öppnar och stänger fält beroende på val i dropdown lista

anropar fuktionerna steng_dynamisk_ruta och oppna_dynamisk_ruta

parameter formnamn - form-taggens namn
parameter elementnamn - dropdownlistans namn
parameter divnamn - div-taggens namn som inkapslar fälten som skall visas/gömmas
parameter nr - används för att särskilja flera likadana på samma sida
parameter indexArray - en array med index för val i dropdownlista för vilka vald fält ej skall visas
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
tömmer fält ifall man gör fälten osynliga

parameter formnamn - form-taggens namn
parameter feltArray - en array med inmatningsfält som skall tömmas
parameter listaArray - en array med alla dropdownlistor som skall ändras till första option-taggen
parameter kryssrutaArray - en array med arrayer som innehåller kryssrutans namn samt true/false om den skall vara ikryssad
parameter radioknappArray - en array med arrayer som innehåller radioknappgruppens namn samt vilket index som skall vara vald

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
Öppnar nytt fönster på adressen som skickas in
parameter inPage - adressen till sidan på fsb's externa web
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
Lägger inskickat värde på det fält som anges.
Kan tex anropas av en Knapp vid onclick för att sätta ett värde på ett hiddenfält
*/
function addFieldValue(fieldName,value) {
    fieldName.value = value;
}

/* endraAktiverad
Skriptet gör fälten skrivskyddade eller inte beroende på vilket alternativ i radiobutton man gjort.
De skrivskyddade fälten töms när de inaktiveras.

parameter formnamn - form-taggens namn
parameter radioknappnamn - namn på radio-taggens i vilken man klickar och får fälten aktiverade eller inaktiverade
parameter inaktiveradnr - siffra som anger vilket alternativ på radioknapp som ska ge inaktiverat fält
parameter feltArray - en array med inmatningsfält som skall alterneras mellan inaktiverat/aktiverat
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
*	Byter värdet på display-attributen på ett element. Kan användas
*	för att ta bort / ta fram element på en sida.
*	@param elemId	Id på elementet ifråga.
*	@param value	Det nya värdet
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
*	Tar bort och tar fram flera element samtidigt på en sida.
*	@param hideElemsIds		en eller flera (array) id på element som ska tas bort
*	@param showElemsIds		en eller flera (array) id på element som ska tas fram
*	@param showValue		eventuellt värde som talar om hur elementen ska visas.
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
*	Aktiverar resp. deaktiverar ett visst textfält och dess label.
*	@param active		om det ska aktiveras eller deaktiveras...
*	@param fieldID		id:t på textfältet
*	@param labelID		id:t på labeln som tillhör textfältet
*.
*	@author Alex Sanchez, Projekt: Teddy IT
*/
function setFieldActive(active, fieldID, labelID) {
	var elem;
	//ändra fält
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
	//ändra label
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
Lägger inskickat värde på det fält som anges.
Kan tex anropas av en Knapp vid onclick för att sätta ett värde på ett hiddenfält

parameter formnamn - form-taggens namn
parameter fieldName - namnet på fältet som ska byta värde
parameter newValue - fältets nya värde 
*/
function addFormFieldValue(formnamn,fieldName,newValue) {
	var felt = eval('document.'+formnamn+'.'+fieldName);
	felt.value=newValue;	
}

/* addFieldValue
Äldre version av addFieldValue som ligger kvar av bakåtkompatibla skäl
Bör ej användas längre. Använd istället addFieldValue(formnamn,fieldName,newValue)

parameter fieldName - namnet på fältet som ska byta värde
parameter newValue - fältets nya värde 
*/
function addFieldValue(fieldName,newValue) {
	fieldName.value=newValue;	
}


