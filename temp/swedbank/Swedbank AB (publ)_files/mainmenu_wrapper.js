/* 
 * menucomponent.js 
 *
 * REVISION HISTORY
 * Ver 2.2, 2007-02-07, hwa
 * - Changed generated mainmenu markup for better compability with the old visual profile.
 * Ver 2.1, 2007-01-24, hwa
 * - Fixed broken support for disabled submenuitems.
 * Ver 2.0, 2006-10-30, hwa
 * - Updated the appearance to match the new Swedbank visual profile.
 * 
 * Copyright (C) Swedbank AB (publ) 2007.
 * All rights reserved.
 */
 
// Mac kompabilitet för arrayer
var undefined;
function isUndefined(property) {
  return (typeof property == 'undefined');
}

// Array.splice() - Splice out and / or replace several elements of an array and return any deleted elements
if (isUndefined(Array.prototype.splice) == true) {
  Array.prototype.splice = function(start, deleteCount) {
     if (deleteCount == null || deleteCount == '') deleteCount = this.length - start;
     
     // create a temporary copy of the array
     var tempArray = this.copy();
     
     // Copy new elements into array (over-writing old entries)
     for (var i = start; i < start + arguments.length - 2; i++) {
        this[i] = arguments[i - start + 2];
     }
     
     // Copy old entries after the end of the splice back into array and return
     for (var i = start + arguments.length - 2; i < this.length - deleteCount + arguments.length - 2; i++) {
        this[i] = tempArray[i + deleteCount - arguments.length + 2];
     }
     this.length = this.length - deleteCount + (arguments.length - 2);
     return tempArray.slice(start, start + deleteCount);
  };
}
// Array.copy() - Copy an array
if (isUndefined(Array.prototype.copy) == true) {
  Array.prototype.copy = function() {
     var copy = new Array();
     for (var i = 0; i < this.length; i++) {
        copy[i] = this[i];
     }
     return copy;
  };
}
// Array.slice() - Copy several elements of an array and return them
if (isUndefined(Array.prototype.slice) == true) {
  Array.prototype.slice = function(start, end) {
     var temp;
     
     if (end == null || end == '') end = this.length;
     
     // negative arguments measure from the end of the array
     else if (end < 0) end = this.length + end;
     if (start < 0) start = this.length + start;
     
     // swap limits if they are backwards
     if (end < start) {
        temp  = end;
        end   = start;
        start = temp;
     }
     
     // copy elements from array to a new array and return the new array
     var newArray = new Array();
     for (var i = 0; i < end - start; i++) {
        newArray[i] = this[start + i];
     }
     return newArray;
  };
}



// slut Mac kompabilitet

MenuComponent.prototype.addTopLevelMenu = mr_addTopLevelMenu;	// Metod för att skriva ut första nivån
MenuComponent.prototype.hideAll = mr_hideAll;					// Metod för att skriva ut första nivån
MenuComponent.prototype.topLevelMenus = new Array();			// Array med alla top-level objekt
MenuComponent.prototype.removeTopLevelMenu = mr_removeTopLevelMenu;	// Metod för att skriva ut första nivån

function TopLevelMenuContainer(name, label, url, component) {
	// Mac change : .call doesn't exist in Mac IE
	if(MenuContainer.call)
	{
		MenuContainer.call(this, name, component);	// Ärv egenskaper från det ursprungliga MenuContainer objektet
	}
	else
	{
		this.inheritedMenuContainer = new MenuContainer(name, component)
		for(var i in this.inheritedMenuContainer)
		{
			try
			{
				eval("this."+i+" = this.inheritedMenuContainer."+i)
			}
			catch(e)
			{ alert("Kunde inte skapa menyn : TopLevelMenuContainer") }
	
		}
		this.toString = this.inheritedMenuContainer.toString;
	}
	
	this.label         = label;
	this.url           = url;
	this.disabled	   = false;
	this.topLevelIndex = component.topLevelMenus.length;	// Spara indexet för denna meny
	component.topLevelMenus.push(this);

	return this;
}

// Lägger till en meny på översta nivån
function mr_addTopLevelMenu(name, label, url) {
	var menu = new TopLevelMenuContainer(name,  label, url, this);
	this.menus[name] = menu;
	
	return menu;
}

//Tar bort en meny på översta nivån
function mr_removeTopLevelMenu(menuName) {

	//Ta bort menyn ur hashmapen
	try {
		this.removeMenu(menuName);
	} catch (e) {
		alert("MenuItem " + menuName + " cannot be removed, does not exist in menu.");
		return;
	}

	//Ta bort menyn från arrayen som representerar översta nivån i menyn
	var containsMenu = false;
	for(var i = 0; i < this.topLevelMenus.length; i++) {
		var menu = this.topLevelMenus[i];		
		if (menu.name == menuName) {
			containsMenu = true;
			break;
		}
	}

	if (containsMenu) {
		this.topLevelMenus.splice(i, 1);	
	}
	// INDEX-FIXUP : CARL.ABRAMSSON@CROSSCOM.SE
	// Loopa igenom arrayen med menyer och uppdatera dess index
	for(var i = 0; i < this.topLevelMenus.length; i++) {
		this.topLevelMenus[i].topLevelIndex = this.topLevelMenus[i].topLevelIndex-1;
	}

}

function mr_hideAll() {
	if(this === mainMenu) {		// Om metoden anropas av mainMenu objektet, sätt activeMenu-referensen till null
		__mm_activeMenu = null;
	}
	mcom_hideAll.call(this);	// Anropa den ursprungliga hideAll metoden i detta objekts (this) kontext
}

var __mm_activeMenu; // Refenence to active menu
var __mm_topLevelElem; // Reference to activating top menu element, hwa 2006-10-31

/**
 *	Skriver ut HTML för varje meny i MenuComponent-objektet
 */

function writeMainMenu() {
	document.writeln('<div id="main-nav">');
	document.writeln('<ul>');
	var firstLink = false;
	for(var i = 0; i < mainMenu.topLevelMenus.length; i++) {
		var menu = mainMenu.topLevelMenus[i];
		document.write('<li');
		if (i == 0) {
			if (mainMenu.topLevelMenus.length == 1) {
				document.write(' class="first last"');
			} else {
				document.write(' class="first"');
			}
		} else if (i == (mainMenu.topLevelMenus.length - 1)) {
			document.write(' class="last"');
		}
		document.write('>');
		if(menu.disabled) {
			document.write('<span class="disabled">');
			document.write(menu.label);
			document.write('</span></li>\n');
		} else {
			// om urlen börjar med '../', lägg på parametrar, Varför??
			if (menu.url.indexOf('../') == 0) {
				menu.url += '&WindowSessId=' + sessionId + '&requestId=' + requestId;
			}
			document.write('<a href="' + menu.url + '"');
			document.write(' onMouseOver="showMainMenu(\'' + menu.name + '\', this);"');
			document.write(' onFocus="showMainMenu(\'' + menu.name + '\', this);"');
			document.write(' onBlur="mainMenu.hideAll();"');
			document.write(' onClick="if (__mm_activeMenu && __mm_activeMenu.inFocus) { return false; }"');
			document.write(' mcmouseover="nohide"');	// Göm inte om menyn hoovrar över en länk
			document.write(' id="toplevel_' + menu.name + '"');	// Varje länks id blir 'toplevel_[menu.name]' [CARL.ABRAMSSON@CROSSCOM.SE] : Was refed by index before.
			if(!firstLink) {
				document.write(' accesskey="m"');		// Första menyvalet blir i fokus om en användare skriver ALT-m
				firstLink = true;
			}
			document.write('>');
			document.write(menu.label);
			document.write('</a></li>\n');
		}
	}
	document.writeln('</ul>');
	document.writeln('</div>');
}


/**
 *	Visar och placerar en meny i huvudmenyn
 */
function showMainMenu(menuName, element) {
	var menu = mainMenu.menus[menuName]; // MenuContainer objektet som ska visas
	
	try {	
		mainMenu.hideAll(); // Göm öppna huvud-menyer
		
		if(menu.HTMLElement == null) { // Lägg till unika URL-querys på alla items första gången en meny visas
			_addSpecialParams(menu); // Nytt anrop
		}
			
		if(!menu.positioned) { // Placera ut menyvalet om detta inte är gjort
			menu.setPosition('element', element, 'bottom');
		}
		
		// hwa, 2006-10-31
		_setActiveTopLevelStyle(element);
		
		menu.show(); // Visa menyn
		__mm_activeMenu = menu;
			
	} catch(e) {
		alert("Ett fel uppstod: \n" + e.message);	// Alerta användaren om eventuellt fel
	}
}

/**
 *	Lägger rekursivt till WindowSessId och requestId på urlen för alla menyval i en meny och dess undermenyer.
 */
function _addSpecialParams(menu) {
	if(!menu.items) {
		return;
	}
	for(var i = 0; i < menu.items.length; i++) {
		// Lägg inte på parametrar om action börjar med 'javascript', 2003-04-08, HWA

		if (menu.items[i].action.indexOf('javascript') != 0) {
		  menu.items[i].action += '&WindowSessId=' + sessionId + '&requestId=' + requestId;
		}
		//Dock skall gamla windowsessionid skickas med om det är en tdeapplikation som öppnas i nytt fönster
		else if (menu.items[i].action.indexOf('TDEApplName') != 0) {
		 start = menu.items[i].action.indexOf('&OldWindowSessId=');
		 if (start != -1) {
		    replacewith = 'OldWindowSessId=' + sessionId;
		    re = new RegExp("OldWindowSessId\='*[0-9]*'*");
		 	menu.items[i].action = menu.items[i].action.replace(re, replacewith);
		  }
		}
		
	  if(menu.items[i].subMenu) {
			_addSpecialParams(menu.items[i].subMenu);
		}
	}
}

/**
 * Restores the original appearance of active top level elements (<li> and <a>)
 * Should be CSS-driven. 
 * hwa, 2006-10-31
 */
function _restoreTopLevelStyle() {
	if(__mm_topLevelElem) {
		__mm_topLevelElem.style.borderRightColor = '#ccc';
		__mm_topLevelElem.style.color = '#ea5e0d';
		__mm_topLevelElem.parentNode.style.backgroundColor = 'transparent';
		__mm_topLevelElem = null;
	}
}

/**
 * Sets new style for 
 * Should be CSS-driven. 
 * hwa, 2006-10-31
 */
function _setActiveTopLevelStyle(element) {
	__mm_topLevelElem = element;
	element.style.color = '#fff';
	element.style.borderRightColor = '#666';
	__mm_topLevelElem.parentNode.style.backgroundColor = '#666';
}

/**
 *	Behandlar alla keydown-events som rör menyn
 *	Om ingen meny är aktiv skickas eventen vidare, men om interaktion med menyn sker avbryts den
 */
function handleKeyNav(e) {
	var evt = e || event;
	
	if(!__mm_activeMenu) return true;
	var cancelEvent = true;

	switch(evt.keyCode) {
			
		case 9 : // Tabb
			if(__mm_activeMenu && __mm_activeMenu.isVisible())
			{
				__mm_activeMenu.hide();
				__mm_activeMenu = null;
			}
			cancelEvent = false;
			break;
		
		case 13 :	// Enter/Retur
			if(__mm_activeMenu.inFocus) {
				__mm_activeMenu.inFocus.invokeAction();
			} else {
				cancelEvent = false;
			}
			break;
			
		case 27 :	// ESC
			mainMenu.hideAll();
			_restoreTopLevelStyle();
			cancelEvent = false;
			break;
			
		case 40 :	// Pil ned
			if(__mm_activeMenu.isVisible()) {		
				kn_moveItemFocus(1);
			} else {
				cancelEvent = false;
			}
			break;

		case 38 :	// Pil upp
			if(__mm_activeMenu.isVisible()) {				
				kn_moveItemFocus(-1);
			} else {
				cancelEvent = false;
			}
			break;

		case 37 :	// Pil vänster
			if(__mm_activeMenu.isVisible()) {		
				kn_moveMenuFocus(false);
			} else {
				cancelEvent = false;
			}
			break;
		
		case 39 :	// Pil höger
			if(__mm_activeMenu.isVisible()) {				
				kn_moveMenuFocus(true);
			} else {
				cancelEvent = false;
			}
			break;

		default :
			return true;
	}
	
	// Avbryter eventen
	if(cancelEvent) {
		evt.cancelBubble = true;
		evt.returnValue = false;
		return false;
	}
}

/**
 *  Behandlar alla keypress-events som rör menyn, används för att inte scrolla sidan vid pil upp/ned i Mozilla.
 *	Om ingen meny är aktiv skickas eventen vidare, men om interaktion med menyn sker avbryts den.
 */
function handleKeyPress(e) {
	var evt = e || event;

	if (__mm_activeMenu && (evt.keyCode == 40 || evt.keyCode == 38)) {
		return false;
	}	
}

// Tar hand om upp- och nedpilknapperna.
// dir är -1 eller 1 beroende på håll (-1 uppåt)
function kn_moveItemFocus(dir) {
	var i;

	// Hitta index till det menyval som har fokus
	for(i = 0; i < __mm_activeMenu.items.length; i++) {
		if(__mm_activeMenu.items[i] == __mm_activeMenu.inFocus) {
			__mm_activeMenu.inFocus.blur();
			break;
		}
	}
	
	var idx = i; // idx blir indexet till det nya menyvalet
	
	// Gå uppåt/nedåt, börja om från början om det är den sista och vice versa. 
	// Skippa disablade menyval
	do {
		idx += dir;
		if(idx >= __mm_activeMenu.items.length) {
			idx = 0;
		} else if(idx < 0) {
			idx = __mm_activeMenu.items.length - 1;
		}
	} while(__mm_activeMenu.items[idx].status == MI_STATUS_DISABLED);
	
	__mm_activeMenu.items[idx].focus();
}

// Tar hand vänster- och högerpilarna
// right är true om högerpilen trycks ned
function kn_moveMenuFocus(right) {
	var dir;
	if(right) {
		var focusedItem = __mm_activeMenu.inFocus;
		if(focusedItem && focusedItem.subMenu == '[object MenuContainer]') {
			// Visa undermenyval
			if(!focusedItem.subMenu.positioned) {
				// Positionera menyvalet om detta inte redan skett
				focusedItem.subMenu.setPosition('submenu', focusedItem);
			}
			
			focusedItem.subMenu.show();
			focusedItem.subMenu.items[0].focus();
			__mm_activeMenu = focusedItem.subMenu;		// Sätt undermenyn som aktiv
			
			return;
		}
		
		// Om det inte fanns undermeny att visa, 
		// sätt den aktiva menyn till menyträdets översta del
		while(__mm_activeMenu.parent == '[object MenuContainer]') {
			__mm_activeMenu = __mm_activeMenu.parent;
		}
		dir = 1;
	} else {
		if(__mm_activeMenu.parent == '[object MenuContainer]') {
			// Om den aktiva menyn är en undermeny, stäng den och sätt föräldern till aktiv
			__mm_activeMenu.hide();
			__mm_activeMenu = __mm_activeMenu.parent;
			mc_setControlVisibility('hidden');
			return;
		}
		dir = -1;
	}

	// Har exekveringen kommit hit ska nästa/föregående menyval visas
	var idx = __mm_activeMenu.topLevelIndex;
	
	// Skippa disablade menyer
	do {
		idx += dir;
		if(idx >= mainMenu.topLevelMenus.length) {
			idx = 0;
		} else if(idx < 0) {
			idx = mainMenu.topLevelMenus.length - 1;
		}
	} while(mainMenu.topLevelMenus[idx].disabled);
	
	document.getElementById('toplevel_' + mainMenu.topLevelMenus[idx].name).focus();
}

document.onkeydown = handleKeyNav;	// Registrera global eventhandler
document.onkeypress = handleKeyPress; // Dito, men för att hindra att Mozilla scrollar sidan vid pil upp/ned.
window.onload = initializeMenu;


/**
 *	Skapa och sätt huvudmenyns egenskaper
 */
var mainMenu = new MenuComponent('mainMenu');	// Instansiera en komponent för huvud menyn

with(mainMenu) {								// Sätt dess layout properties
	subMenuIconPath = 'images/menu_right_arrow.gif';
	subMenuIconPathDisabled = 'images/menu_right_arrow_disabled.gif';
	cssMenu = 'menu';
	cssMenuItem = 'menu-item';
	cssMenuItemFocus = 'menu-item-focus';
	cssMenuItemLabel = 'menu-item-label';
	cssMenuItemDisabled = 'menu-item-disabled';
	cssSubMenuIcon = 'menu-item-icon';	
	cssSubMenuIconDisabled = 'menu-item-icon-disabled';	
	autoHide = true;
}