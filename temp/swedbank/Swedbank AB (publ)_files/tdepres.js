var loading = false; //20020109 ega

function onButtonClick(aForm, aTarget) {
	if(loading==true){
		alert("För många utestående anrop.\n\nBanken kan bara hantera ett anrop i taget.");
		window.setTimeout("loading=false;", 500);
	} else {
		formSubmit(aForm, aTarget);
	}
	loading=true;
}

//20020109 ega Nya functioner för kontroll om ongoingrequest vid klick på Knapp eller Länk
function formSubmit(aForm, aTarget) {
    var form = document.getElementById(aForm);
    if (form) {
           var defaultTarget;
           if (aTarget) {
                      defaultTarget = form.target;
                      if (defaultTarget == null || defaultTarget == '') {
                                 defaultTarget = '_self';
                      }
                      
                      form.target = aTarget;
           }
                      
           form.submit();
           
           if (aTarget) {
                      form.target = defaultTarget;
           }
    }
}

function onLinkClick(aLink){
	if(loading==true) {
		alert("För många utestående anrop.\n\nBanken kan bara hantera ett anrop i taget.");
		window.setTimeout("loading=false;", 500);
		aLink.href = '#';
	}
	loading=true;
}

//Används för att kunna flytta sig i dropdown på sida_kontohistorik
function MM_jumpMenu(targ,selObj,restore){ //v3.0
  if(loading==true) {
    alert("För många utestående anrop.\n\nBanken kan bara hantera ett anrop i taget.");
  } else {
    eval(targ+".location='"+selObj.options[selObj.selectedIndex].value+"'");
    if (restore) selObj.selectedIndex=0;
    loading=true;
  }
} 
 //Används av multiselect-taggen. 
 function multiselectAdd(aForm,select1,select2){
            control1 = eval('document.' + aForm + '.' + select1);
            control2 = eval('document.' + aForm + '.' + select2);
            for(var i = 0;i < control1.options.length;i++){
                    if(control1.options[i].selected == true){
                        control2.options[control2.length] = new Option(control1.options[i].text,control1.options[i].value);
                        control1.options[i] = null;
                       i--;
					}
   			} 
 }
 function multiselectSelectAll(aForm,select1){
            control1 = eval('document.' + aForm + '.' + select1);	 
            for(var i = 0;i < control1.options.length;i++){
                    control1.options[i].selected = true;
            }  
 }
 //Används av Multiselect-taggen, initieras av attributet sortAscending. Tillagt mars 2007 kodat av Christina Salén
 function orderedMultiselectAdd(aForm,select1,select2){
            control1 = eval('document.' + aForm + '.' + select1);
            control2 = eval('document.' + aForm + '.' + select2);
            for(var i = 0;i < control1.options.length;i++){
                    if(control1.options[i].selected == true){
                  		var aStr = control1.options[i].text.substring(1,2);
                  		var aIndex = control2.options.length + 1;
						if(aStr == "."){
                        	var aText = control1.options[i].text;
                        	aText = aText.substring(3);
                        	control2.options[control2.length] = new Option(aText,control1.options[i].value);
                            control1.options[i] = null;
                        	if(i < control1.options.length){
	       						for(var y = 0; y < control1.options.length;y++){
									var ind = y+1;
									if(control1.options[y].selected == true){
		                        	control1.options[y] = new Option(ind+'. '+control1.options[y].text.substring(3),control1.options[y].value);
										control1.options[y].selected = true;
		                        	}else{
		                        		control1.options[y] = new Option(ind+'. '+control1.options[y].text.substring(3),control1.options[y].value);
								}
       						}
       						}
                    	} else{
                        	control2.options[control2.length] = new Option(aIndex+'. '+control1.options[i].text,control1.options[i].value);
	                        control1.options[i] = null;
                        }
                        i--;
					}
   			} 
 } 
  
/* Aktiverar/avaktiverar samtliga element i en Multiselect. /Alex Sanchez 2007-05 */	
function setMultiSelectDisabledState(aSourceListName, aTargetListName, aDisabled) {
	setElementDisabledState(aSourceListName, aDisabled);
	setElementDisabledState(aTargetListName, aDisabled);
	setElementDisabledState(aSourceListName+'Rubrik', aDisabled);
	setElementDisabledState(aTargetListName+'Rubrik', aDisabled);
	setElementDisabledState(aTargetListName+'SelectAllLink', aDisabled);
	setElementDisabledState(aSourceListName+'To'+aTargetListName+'MoveBtn', aDisabled);
	setElementDisabledState(aTargetListName+'To'+aSourceListName+'MoveBtn', aDisabled);
}

/* Aktiverar/avaktiverar ett element. /Alex Sanchez 2007-05 */
function setElementDisabledState(aElement, aDisabled) {
	document.getElementById(aElement).disabled=aDisabled;
}
/* timeout
Notifierar användaren om när automatisk utloggning ska ske
Lägg till följande på den sida som ska använda skriptet:
<script language="JavaScript" type="text/javascript">
	var time = new Date();
	var portalUrl = '<%= request.getAttribute(TDEApplConstants.PORTAL_URL) %>';	
	var sessionTimeoutValue = <%= tSessionTimeoutValue %>;
	time = time.setTime(time.getTime() + sessionTimeoutValue);
	ID=window.setTimeout("timeout("+time+");", 1000);
	timeoutUpdateOpenerWindow(time);
</script>
*/
var medWin = false;
var logOut = false;
function timeout(aTime,active,localeParam) {
	if(active){
		var now = new Date();	
		var seconds = (aTime - now) / 1000;
		var minutes = Math.round(seconds/60);
		if(((seconds - 120) <= 0) && !medWin && !updated){
			window.status = minutes + ' ' + tTimeoutTextAktivitetsrad;
		    var win=window.open("jsp/portal/timeout_meddelande.jsp?locale="+localeParam+'&WindowSessId='+sessionId,"fsbTimeout","width=400,height=200,screenX=100,screenY=100,top=100,left=100,resizable=yes,scrollbars=yes");
			medWin = true;		    
		}
		if(((seconds) <= 5) && logOut == false){
			window.location = portalUrl +'WindowSessId='+sessionId+'&_new_flow_=false&requestId='+requestId+'&_loa_=_loc_&bi='+bankid + '&_autoloa_=1';
			logOut = true;
		}		
		window.status = minutes + ' ' + tTimeoutTextAktivitetsrad;
		if(!updated){
			ID=window.setTimeout("timeout("+aTime+","+active+",'"+localeParam+"');",1000);
		} else {
			updated = false;
		}
	}
}
var updated = false;
/**
* Uppdaterar även fönstret som öppnade aktuellt fönster
*/
function timeoutUpdateOpenerWindow(aTime){
	if(window.opener !=  null && !window.opener.closed){
		try{	
			window.opener.setTimeout("timeout("+aTime+","+window.opener.active+",'"+window.opener.tLocaleParameter+"');", 1000);		
			window.opener.updated = true;
		} catch(exception) { }		
	}	
}
function printDate(){
	var printDate = new Date();
	var year = printDate.getYear();
	//Hanterar mozilla-baserade browsers - år presenteras -1900. 2004 = 104
	if(year < 1000){
		year = year + 1900;
	}
	var month = (printDate.getMonth()+1);
	var formattedMonth = (month < 10) ? '0'+month : month; 
	var formattedDate = (printDate.getDate() < 10) ? '0'+printDate.getDate() : printDate.getDate(); 	
	var formattedHours = (printDate.getHours() < 10) ? '0'+printDate.getHours() : printDate.getHours(); 
	var formattedMinutes = (printDate.getMinutes() < 10) ? '0'+printDate.getMinutes() : printDate.getMinutes();
	document.write(year +'-'+ formattedMonth +'-'+ formattedDate +' '+ formattedHours +':'+ formattedMinutes);
}
/**
* Används för att kontrollera om timeoutskriptet ska köras i aktuellt fönster
*/
 function checkWindowOpener(){
  try{ if(window.opener != null && !window.opener.closed && window.opener.hattId != null){
   active = false;
  } }catch(exception){}
 }

/**
* Används för att kontrollera hattId har ändrats i moderfönstret. T ex Nettrad -> BvIPrivat
*/
 function checkWindowState(hattId) {
  try{ if(window.opener == null || window.opener.closed || window.opener.hattId != hattId){
    window.close();
   } else {
    ID2=window.setTimeout("checkWindowState(hattId);",2000);
   } }catch(exception){ }
 }
/**
 * _postMenuForm()
 *
 * hwa 2002-02-28
 */
function _postLinkForm(url, wsId, rId) {
	// get reference to form element and change action attribute
	var formElem = document.getElementById('_fsbLinkForm');
	var urlParts = url.split('?');
	formElem.action = urlParts[0];

	// add extra get parameters to post form as hidden input fields
	var args = parseQueryString(urlParts[1]);
	for (var arg in args) {
		var newParam = document.createElement("INPUT");
		newParam.setAttribute("type", "hidden");
		newParam.setAttribute("name", arg);
		newParam.setAttribute("value", args[arg]);
		formElem.appendChild(newParam);
	}
	formElem.elements['WindowSessId'].value = wsId;
	formElem.elements['requestId'].value = rId;

	// submit form
	formElem.submit();
}
/**
 * parseQueryString()
 *
 * hwa 2002-02-28
 */
function parseQueryString(str) {
	str = str ? str : location.search;
	var query = str.charAt(0) == '?' ? str.substring(1) : str;
	var args = new Object();
	if (query) {
		var fields = query.split('&');
		for (var f = 0; f < fields.length; f++) {
			var field = fields[f].split('=');
			args[unescape(field[0].replace(/\+/g, ' '))] = unescape(field[1].replace(/\+/g, ' '));
		}
	}
	return args;
}

/*
Formattering av belopp
skapat 2007-08-28 av p950ase.
exempel på anrop <input type="text" maxlength="19" onblur="this.value=formatteraBelopp(this.value, true, ' ',',')"/>
*/
function formatteraBelopp(aInNum, aInclDecimal, a1000Delimiter, aDecimalSign) {
	if (aInNum == null || aInNum.length < 1){
		/* text box contains no characters*/
		return '';
	}
   /*
	* To edit an already formatted amount
	* se need to "deformat" first.
	*/
	var tRawNum = aInNum.replace(new RegExp(a1000Delimiter,"g"), '');
	/* change decimal commma to decimal point */
	tRawNum = tRawNum.replace(new RegExp(aDecimalSign,"g"),'.');
	if(isNaN(tRawNum)){
		/* input is not a number, just return */
		return aInNum;
	}	
	/* get sign */
	var tSign = (tRawNum == (tRawNum = Math.abs(tRawNum)));
	/* parse out integer part and insert 1000delimiter */
	var tOutNum = parseInt(tRawNum).toString();
	for (var i = 0; i < Math.floor((tOutNum.length-(1+i))/3); i++){
		tOutNum = tOutNum.substring(0,tOutNum.length-(4*i+3))+a1000Delimiter+tOutNum.substring(tOutNum.length-(4*i+3));
	}
	if (aInclDecimal){
		/* prepare and show decimal */
		var tTmpNum = Math.floor(tRawNum*100+0.50000000001);
		var tDec = tTmpNum%100;
		tTmpNum = Math.floor(tTmpNum/100).toString();
		if(tDec<10){
			tDec = "0" + tDec;
		}
		return (((tSign)?'':'-') + tOutNum + aDecimalSign + tDec);
	} else{
		return (((tSign)?'':'-') + tOutNum);
	}
}

	



