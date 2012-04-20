/* 
 * menucomponent.js 
 *
 * REVISION HISTORY
 * Ver 2.3.1, 2010-01-29, hwa
 * - Revised 2.3 fix.
 * Ver 2.3, 2010-01-18, hwa
 * - Fixed window bug on IE7+.
 * Ver 2.2, 2007-02-09, hwa
 * - Set hiding of SELECT-tags on to work on IE6 or less.
 * Ver 2.1, 2007-01-24, hwa
 * - Fixed broken support for disabled submenuitems.
 * Ver 2.0, 2006-10-31, hwa
 * - Updated appearance to match the new Swedbank visual profile.
 * Ver 1.5, 2006-10-10, hwa
 * - Fixed miscalculated widths for menu containers in Internet Explorer 7 RC1.
 * 
 * Copyright (C) Swedbank AB (publ) 2010.
 * All rights reserved.
 */

/**
 *	COMPATABILITY ISSUES
 */
// Run conditional compilition statements to determine if a Microsoft JScript engine is old
// This code will only be executed by a JScript engine
var __oldJScriptEngine;
/*@cc_on @*/
/*@if (@_jscript_version < 5.5)
   __oldJScriptEngine = true;
   @else @*/
   __oldJScriptEngine = false;
/*@end @*/

// These functions applies only to version of IE that runs old versions of JScript
if(__oldJScriptEngine) {
	// Simulate the build-in JScript Error object
	function Error(num, msg) {
		this.name = 'Error';
		this.message = msg;
		this.description = msg;
		this.number = num || 0;
		
		return this;
	}
	
	// Simulate the built-in push-method of the Array object
	Array.prototype.push = function() {
		// Mac-change CAB@CROSSCOM.SE (this.arguments did not work in Mac IE)
		var argumentsArray;
		if(this.arguments)
			argumentsArray = this.arguments;
		else
			argumentsArray = arguments;
		for(var i = 0; i < argumentsArray.length; i++) {
			this[this.length] = argumentsArray[i];
		}

		return this.length;
	}
}


/**_________________________________________________________
 *	GLOBAL VARIABLES AND CONSTANTS
 */

var menuInitialized = false;			// this variable is true when the page is loaded and elements are ready to intilize
var menuComponents = new Object();		// Hash containing references to all menuComponents available
var openMenuContainers = new Array();		// CAB@CROSSCOM.SE: Array holding all visible MenuContainers

var MI_STATUS_NOT_CREATED = -1;			// MenuItem status constant: Item has not been created
var MI_STATUS_NORMAL      = 0;			// MenuItem status constant: Item is normal
var MI_STATUS_FOCUSED     = 1;			// MenuItem status constant: Item has focus
var MI_STATUS_DISABLED    = 2;			// MenuItem status constant: Item is disabled
var __miToInvoke	      = null;		// private reference to menuitem used in delayed invocation quickfix on ie7+, hwa 2010-01-18

/**
 *	Object MCException
 *	This error object is used when a MenuComponent errors occurs
 *	It inherits specific properties and methods from the built-in Error object
 */
function MCException(msg, num) {
	this.name = 'MenuComponentError';	// Identity of the error
	
	if(msg) {
		this.message     = msg;
		this.description = msg;			// Added for MSIE compatability
	}

	if(num) {
		this.number = num;
	}
	
	return this;
}

MCException.prototype = new Error;	// Exception is a prototype of the Error object

/**
 *_________________________________________________________
 *	METHODS FOR THE MenuComponent OBJECT
 */

function MenuComponent(name) {
	if(!name) {
		throw new MCException('Missing component name', 201);
	}
	
	// Properties
	this.closeTimerID = null;				// Contains the timeout id when a submenu is about to be closed
	this.menus = new Object();				// Hash containing references to all MenuContainer object, mapped on their name
	this.name  = name;						// String identifying the component
	this.autoHide = true;					// All open menus automatically hides after 1.5 seconds when the mouse pointer leaves the menu and does not reenter with that time
	this._additionalWidth = null;			// This variable is used to store the additional width information used when a menu is resized in relation to its contents. This only needs to be calculated once and what value it contains vary from environment to environment
	this.hideControls = true;				// Set this variable to true if system controls such as selectboxes should be hidden when a menu is displayed to avoid the transparancy issue
	this._controlsHidden = null;			// If hideControls are true, this variabel will specify weather the controls are hidden or not at the moment. Do not set this variable explicitly

	// Layout properties. If these are changed, the whole menu will have to be re-generated
	this.subMenuIconPath = null;			// Path to the icon indicating that there is a sub menu present
	this.subMenuIconPathDisabled = null;	// Path to the icon indicating that there is a sub menu present, but it is disabled.
	this.cssMenu = null;					// CSS class of the element containing all items
	this.cssMenuItem = null;				// CSS class of each menu item
	this.cssMenuItemFocus = null;			// CSS class of menu item that is in focus
	this.cssMenuItemDisabled = null;		// CSS class of a disabled menu item
	this.cssMenuItemLabel = null;			// CSS class of the label
	this.cssSubMenuIcon = null;				// CSS class of the sub menu icon
	this.cssSubMenuIconDisabled = null;				// CSS class of the sub menu icon

	// Methods
	this.addMenu = mcom_addMenu;			// Adds a menu to the component
	this.hideAll = mcom_hideAll;			// Hides all menus in the component
	this.reload  = mcom_reload;				// Re-generates all added menu
	this.removeMenu = mcom_removeMenu;		// Remove specified menu from the component
	this.toString = new Function('return "[object MenuComponent]"');
	
	menuComponents[name] = this;

	return this;
}

/**
 * object.addMenu
 * Adds a menu container to a specific component
 */
function mcom_addMenu(name) {
	var menu;
	try {
		menu = new MenuContainer(name, this);
	} catch(exception) {
		throw exception;	// Re-throw exception to user
	}

	this.menus[name] = menu;	// Make the menu accessable with its name
	
	return menu;
}

/**
 * object.hideAll
 * Hides all menus in a specific component
 */
function mcom_hideAll() {
	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}

	for(var menuName in this.menus) {
		this.menus[menuName].hide();
	}
	
	// QnD-fix to restore top level style. This function should be defined in mainmenu_wrapper and
	// use prototyping instead, but I somehow didn't get that to work... / hwa 2006-10-31
	if (__mm_topLevelElem) {
		_restoreTopLevelStyle();
	}
	
	// Reset the close timeout if its set
	if(this.closeTimerID) {
		self.clearTimeout(this.closeTimerID);
		this.closeTimerID = null;
	}
}

/**
 * object.relaod
 * Re-generates all created menus
 */
function mcom_reload() {
	for(var menuName in this.menus) {
		this.menus[menuName].reload();
	}
}

/**
 * object.removeMenu
 * Removes specified menu from the component and unlink its HTML-elements from the DOM-tree
 * Arguments
 *	menuName	Required. Name of menu to remove
 */

function mcom_removeMenu(menuName) {
	// Mac-change old code was: if(!(menuName in this.menus)) {
	if(!this.menus[menuName]) {
		throw new MCException("'" + menuName + "' is not a MenuContainer", 202);
	}
	
	var menu = this.menus[menuName];
	
	if(menu.HTMLElement != null) {
		// Remove the DOM element if it has been created
		document.body.removeChild(menu.HTMLElement);
	}
	
	delete this.menus[menu.name];
}

/**_________________________________________________________
 *	METHODS FOR THE MenuContainer OBJECT
 */

// Object constructor
function MenuContainer(name, component) {
	if(component != '[object MenuComponent]') {
		throw new MCException('Missing reference to MenuComponent', 301);
	} else if(typeof name != 'string' || name.length == 0) {
		throw new MCException('Missing name of MenuContainer', 302);
	}
	
	// Properties
	this.HTMLElement = null;				// Will contain reference to the HTML object. If this value is null, the menu has not yet been created
	this.inFocus = null;					// Specifies focused menu item
	this.items = new Array();				// Array with items
	this.name  = name;						// Name of the meny (mapped in menuContainer hash)
	this.positioned = false;				// This value is true if the menu has been positioned. If this is set to false, some methods will recalculate the menus position
	this.parent = null;						// Reference to a MenuContainer object to which this menu acts as a submenu
											// This property is set if the menu is added as a submenu with addItem-method or when a submenu is about to be displayed
	this.component = component;				// Add reference to the component this menu belongs to
	
	// Methods
	this.addItem = mc_addItem;				// Adds a menu item to the menu container
	this.hide    = mc_hide;					// Hides a displayed item
	this.isVisible = mc_isVisible;			// Returns a boolean value;true if the menu is visible, and false if not
	this.reload  = mc_reload;				// Forces the HTML for the menu to be reconstructed next time it will be displayed
	this.removeItem = mc_removeItem;		// Remove specific item
	this.setPosition = mc_setPosition;		// Calculates the position of the element based on specific parameters
	this.show    = mc_show;					// Displays this element and creates the HTML if that hasn't been done
	this._construct = mc_construct;			// Creates the required HTML elements for the menu
	
	this.toString = new Function('return "[object MenuContainer]";');
	
	return this;
}

/**
 * object.addItem
 * Adds a menu item to the menu container
 * menu items will appear in the order they are created
 * The created menuItem is returned
 */
function mc_addItem(label, action, subMenu) {
	var menuItem;
	
	try {
		menuItem = new MenuItem(this, label, action, subMenu);
	} catch(exception) {
		throw exception;				// Re-throw exception to client code
	}
	
	if(subMenu == '[object MenuContainer]') {
		subMenu.parent = this;			// Set the parent property
	}

	this.items.push(menuItem);
	
	return menuItem;
}


/**
 * object.removeItem()
 * Removes a menuitem from the list.
 * Arguments
 *	itm		index to menu item in the items array to be removed
 *			can also be a reference to a menuItem object
 *			If itm is omitted, the last item will be removed
 */
function mc_removeItem(itm) {
	var idx;
	if(typeof itm == 'undefined') {
		idx = this.items.length - 1;	// if omitted, remove the last item
		if(idx == -1) {
			throw new MCException('There are no items to be removed', 306);
		}
	} else if(itm == '[object MenuItem]') {
		// Item is a reference to a menu container
		for(idx = 0; idx < this.items.length; idx++) {
			if(this.items[idx] == itm) {
				break;
			}
		}
		
		// if reference was not in the items array, throw error
		if(idx == this.items.length) {
			throw new MCException('Item "' + itm.label + '" is not a part of this MenuContainer', 305);
		}
	// Mac change old code (did it even work??) } else if(!(itm in this.items)) {
 	} else if(itm > this.items.length-1) {
		throw new MCException('Index "' + idx + '" is out of bounds', 303);
	} else {
		idx = itm;
	}

	if(this.HTMLElement != null) {
		// Remove the items HTML element if it has been created
		this.HTMLElement.removeChild(this.items[idx].HTMLElement);
	}

	delete this.items[idx];	// Remove item from array
	this.items.compress();	// Compress the array
}


/**
 * object.isVisible()
 * Returns a boolean value that's true if the menu is visible and false if not
 */
function mc_isVisible() {
	if(this.HTMLElement == null) return false;
	return (this.HTMLElement.style.visibility == 'visible');
}

/**
 * object.reload()
 * Clears the menu items and forces changes to be visible
 * If the menu is visible when reload is executed, its redisplayed with same positioning
 */
function mc_reload() {
	if(this.HTMLElement == null) return;
	
	var isVisible, pos, x, y; 
	
	if(this.isVisible()) {
		isVisible = true;
		with(this.HTMLElement.style) {
			pos = position;
			x   = left;
			y   = top;
		}
	} else {
		isVisible = false;
	}
	
	document.body.removeChild(this.HTMLElement);	// Remove the menu HTML elements and all it's children
	this.HTMLElement = null;
	
	// All submenus's position must be recalculated
	for(var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if(item.subMenu == '[object MenuContainer]') {
			item.subMenu.positioned = false;
		}
		
		// reset status
		if(this.status != MI_STATUS_DISABLED) {
			this.status = MI_STATUS_NOT_CREATED;
		}
	}
	
	// If menu was visible when reload was called then re-display the menu
	if(isVisible) {
		// Hide submenus
		mc_hideAllRelated(this);
		this.setPosition('absolute', x, y);	// Reset position. This will cause the element to be created
		this.show();
	}
}

/**
 * object.setPosition()
 * Positions the menu at a specified position. This can only be done after page has loaded
 */
function mc_setPosition(type) {

	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}
	
	// SHOULD position() CREATE THE ELEMENT OR SHOULD IT JUST CALCULATE THE POSITION???
	// Create an HTML representation of the element if that hasn't been done yet
	if(this.HTMLElement == null) {
		this._construct();	// Create HTML for the menu if that hasn't been done
	}
	
	var x, y, atElement;
	x = y = 0;
	
	switch(type) {
		case 'element' :
			// The menu will be positioned at a specified element
			// First, locate the elements coordinates in the DOM hierarki
			
			if(typeof mc_setPosition.arguments[1] == 'string') {
				// if second arguments is a string, it's assumed to reflect the ID of the DOM element
				atElement = document.getElementById(mc_setPosition.arguments[1]);
			} else {
				// else its assumed to be a reference to the element
				atElement = mc_setPosition.arguments[1];
	 		}
			
			// Calculate the elements position. Use the BODY as the topmost node
			var elem = atElement;
			FIND: while(elem && elem.tagName != 'BODY') {
				// Skip elements without offsetTop and TR or similar elements. They have the same offsetTop as their children, without visual effect
				if(elem.tagName != 'TR' /* elem.tagName != 'UL' && */ && elem.tagName != 'BLOCKQUOTE') {
					
					if(elem.style && elem.style.position == 'absolute') {
						// If the element has an absolute position, add it's top and left values and terminate the loop
						x += parseInt(elem.style.left);
						y += parseInt(elem.style.top);
						
						break FIND;
					}

					if(false && navigator.platform == 'MacPPC' && navigator.userAgent.indexOf('MSIE') != -1) {
						// This is a Mac/IE workaround that probably need more testing
						// Fore some reason, the offsetTop and -Left property is wrong here, but client- seems to work fine
						// Mac change : CAB@CROSSCOM.SE Yes.... It needed more testing... =) I've disabled this block for now because on MacOS IE 5.0 it worked just fine. But it still needs more testing
						if(typeof elem.clientLeft != 'undefined') x += elem.clientLeft;
						if(typeof elem.clientTop  != 'undefined') y += elem.clientTop;
					} else {
						x += elem.offsetLeft;
						y += elem.offsetTop;
						// alert("elem.tagName = " + elem.tagName + ", x = " + x + ", y = " + y);
					}
				}
				
				
				elem = elem.offsetParent;
			}
			
			// The third argument is optional and should be a string that describe where in relation to the element the menu should be position
			if(mc_setPosition.arguments.length == 3) {
				POS: switch(mc_setPosition.arguments[2]) {
					case 'bottom' :			// In the left-bottom corner
						y += atElement.offsetHeight + 3; /* positioneringshack... hwa, 2006-10-30 */
						break POS;
					case 'right' :			// In the right-top corner
						x += atElement.offsetWidth;
						break POS;
				}
				
				// Default is top-left corner
			}
			
			// Safari 1.0 and 1.1 has a bug in the offsetTop-routine. This is very hackish solution.....'
			if((navigator.userAgent.toLowerCase().indexOf('safari') != - 1 && parseFloat(navigator.appVersion) < 87) || navigator.userAgent.toLowerCase().indexOf('opera') != - 1)
			{
				y += 5;
			}
			
			
			break;
	
		case 'submenu' :
			// Positions the menu as a submenu, next to an item
			var atElement = mc_setPosition.arguments[1];
			if(atElement == '[object MenuItem]') atElement = atElement.HTMLElement;
			
			with(atElement.parentNode.style) {
				x = parseInt(left) + atElement.offsetWidth - 5;
				y = parseInt(top) + atElement.offsetTop + 2;
			}
			this.HTMLElement.style.zIndex++;	// The item must be above the opener
			
			break;

		case 'absolute' :
			// Positions the menu at specified coordinates
			x = parseInt(mc_setPosition.arguments[1]);
			y = parseInt(mc_setPosition.arguments[2]);
			
			break;
		
		default :
			throw new MCException("Unknown argument: '" + type + "'", 103);
	}
	
	if(x && y) {
		this.HTMLElement.style.position = 'absolute';	// The object's dimentions is set when element recieves an absolute position
		
		// Adjust position to window-canvas
		if((this.HTMLElement.offsetWidth + x) >= document.body.clientWidth) {
			if(type == 'submenu' || (type == 'element' && mc_setPosition.arguments[2] == 'right')) {
				x -= (atElement.offsetWidth + this.HTMLElement.offsetWidth);		// position the menu to the left of the specified element
				if(type == 'submenu') x += 10;										// make a little indention if it's a submenu

			} else {
				x = document.body.clientWidth - this.HTMLElement.offsetWidth;		// align the element at the window's right canvas
			}
		}
				
		with(this.HTMLElement.style) {
			left = x + 'px';
			top  = y + 'px'
		}	
		
		this.positioned = true;
	} else {
		throw new MCException("Invalid coordinates: X: '" + x + "', Y: '" + y + "'", 304);
	}
}



/**
 * object._construct()
 * Creates an HTML representation of the menu and all its menu items
 * The menu element is available through menuContainers['name_of_menu'].HTMLElement or document.getElementById('mc_name_of_menu');
 * The menu item element is available through menuContainers['name_of_menu'].items[index_of_item].HTMLElement or docment.getElementById('mi_name_of_menu_index_of_item');
 *
 * returns the created HTML element
 */

function mc_construct() {
	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}

	if(this.HTMLElement != null) {
		// Remove existing DOM Node if it's exist
		document.body.removeChild(this.HTMLElement);
	}

	var rootNode = document.createElement('DIV');
	
	// Node properties
	rootNode.id = 'mc_' + this.name;
	rootNode.menu = this;				// Reference to the MenuContainer object representing the elements
	rootNode.beenDisplayed = false;		// The width of all items has to be adjusted to the width of the container (rootNode)
										// This has to be done just after the first time the menu is displayed.
	if(typeof this.component.cssMenu == 'string') {
		rootNode.className = this.component.cssMenu;
	}
	
	// Node layout properties
	rootNode.style.visibility = 'hidden';
	rootNode.style.position   = 'absolute';
	rootNode.style.top = "-1000px"; // CAB@CROSSCOM.SE : NS 6.2.1 had problems before this with "flashing", the menu showed up att the bottom of the page for a short while
	rootNode.style.left = "-1000px"; 
	rootNode.style.zIndex = 2;	// All menu elements are positioned at the second level in the z-index stack. This is because the event element must be below
	

	// Node methods and eventhandlers
	rootNode.onmouseover = function(e) {		// Reset close timer when the mouse enters the menu
		if(this.menu.component.closeTimerID) {
			self.clearTimeout(this.menu.component.closeTimerID);
			this.menu.component.closeTimerID = null;
		}
		
		var evt = e || event;
		evt.cancelBubble = true;
	}
	
	for(var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if(item != '[object MenuItem]') continue;
		
		// The markup inside each menu item is created as a string and appended and parsed
		// This is slightly faster than creating a an element setting it's properties and appending it to the DOM-tree
		// However, this is not a good way to do it. The code gets harder to maintain and the innerHTML-property used for 
		// appending and creating the elements is not a part of the open standard
		
		var itemHTML = '<SPAN';
		if(typeof this.component.cssMenuItemLabel == 'string') {
			itemHTML += ' CLASS="' + this.component.cssMenuItemLabel + '"';
		}
		
		itemHTML += ' ID="itemLabel" onMouseOver="return false;" onMouseOut="return false;">' + item.label + '</SPAN>';
		
		if(item.subMenu == '[object MenuContainer]' && typeof this.component.subMenuIconPath == 'string') {	
			var iconHTML;
			if(item.status == MI_STATUS_DISABLED) {
				iconHTML = '<IMG SRC="' + this.component.subMenuIconPathDisabled + '" ID="subMenuIconDisabled" onMouseOver="return false;" onMouseOut="return false;"';
				if(typeof this.component.cssSubMenuIconDisabled == 'string') {
					iconHTML += ' CLASS="' + this.component.cssSubMenuIconDisabled + '"';
				}
			} else {
				iconHTML = '<IMG SRC="' + this.component.subMenuIconPath + '" ID="subMenuIcon" onMouseOver="return false;" onMouseOut="return false;"';
				if(typeof this.component.cssSubMenuIcon == 'string') {
					iconHTML += ' CLASS="' + this.component.cssSubMenuIcon + '"';
				}	
			}

			itemHTML = iconHTML + '>' + itemHTML;	// Add the icon infront of the rest of the HTML
		}
		
		var itemNode = document.createElement('DIV');
		itemNode.innerHTML = '<NOBR>' + itemHTML + '</NOBR>';
		itemNode.id = 'mi_' + this.name + '_' + i;
		
		// Set CSS-class only if the base-class (cssMenuItem) is defined
		if(typeof this.component.cssMenuItem == 'string') {
			// If item has been set to disabled before creation and there is a disabled class defined, use that one
			if(item.status == MI_STATUS_DISABLED && typeof this.component.cssMenuItemDisabled == 'string') {
				itemNode.className = this.component.cssMenuItemDisabled;
			} else {
				itemNode.className = this.component.cssMenuItem;
			}
		}
		
		itemNode.menuItem = item;	// reference to the menu object
		
		// Execute the menu item action
		itemNode.onmousedown = function(e) {
			if(this.menuItem.action == null) {
				// If the action is null or undefined, cancel the click event and return
				var evt = e || event;
				evt.cancelBubble = true;
				evt.returnValue  = false;
				return false;
			}
			// hwa, 2010-01-29
			// Delay the menu invocation by 100 ms on IE 7+ to avoid a long standing window bug
			if (parseFloat(ua.substr(ua.indexOf("msie") + 4)) > 6) {
				__miToInvoke = this.menuItem;
				window.setTimeout('__miToInvoke.invokeAction();', 100);
			} else {
				this.menuItem.invokeAction();
			}
		}
		
		// Should only execute when mouse is moved over a valid target
		itemNode.onmouseover = function(e) {
			if(this.menuItem == this.menuItem.menu.inFocus) {
				// If the menu item firing the event is the same item that has focus, return
				return false;
			} else if(this.menuItem.menu.inFocus == '[object MenuItem]') {
				// Else if another item of this menu has focus, blur it
				this.menuItem.menu.inFocus.blur();
			}
			
			this.menuItem.focus(true);		// Set focus on item and display submenu if available
		}
		

		if(item.status == MI_STATUS_NOT_CREATED) {
			item.status = MI_STATUS_NORMAL;
		}

		rootNode.appendChild(itemNode);
		item.HTMLElement = itemNode;		// Save reference to the HTML element for the item
	}
	document.body.appendChild(rootNode);
	
	
	// Calculate the width of the new item and apply that on itself and its children
	{
		var ua = navigator.userAgent.toLowerCase();
		var calculatedWidth = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenu, 'width'));
		
		if(isNaN(calculatedWidth)) {
			// If the width was not specified in an external css-declaration
			if(navigator.platform == 'MacPPC'  && (ua.indexOf('safari') != -1 || ua.indexOf('msie') != -1)) {
				// For MSIE on the Mac-platform (x or 9) the width needs to be manually calculated
				// Safari also runs this code
				// Get the widest item in the menu
				var menuItem = rootNode.firstChild;
				calculatedWidth = 0;
				
				while(menuItem)  {
					var child = menuItem.firstChild;
					var itemWidth = 0;
					if(child.tagName == 'NOBR') child = child.firstChild;
					
					// Add up the total width of all HTML elements in the item div
					while(child) {
						itemWidth += child.offsetWidth;
						
						child = child.nextSibling;
					}
					
					calculatedWidth = Math.max(calculatedWidth, itemWidth);	// Get the widest item
					menuItem = menuItem.nextSibling;
				}
				
				if(this.component._additionalWidth == null) {
					// Take padding and margin of menu item in account here
					// This is value is the same on all menus, therefor calculate it only on the first menu accessed
					
					this.component._additionalWidth = 0;
					var paddingRight = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenuItem, 'paddingRight'));
					var paddingLeft  = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenuItem, 'paddingLeft'));
					var marginRight  = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenuItem, 'marginRight'));
					var marginLeft   = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenuItem, 'marginLeft'));
					
					if(!isNaN(paddingRight)) this.component._additionalWidth += paddingRight;
					if(!isNaN(paddingLeft))  this.component._additionalWidth += paddingLeft;
					if(!isNaN(marginRight))  this.component._additionalWidth += marginRight;
					if(!isNaN(marginLeft))   this.component._additionalWidth += marginLeft;
					
				}
				calculatedWidth += this.component._additionalWidth+15; // We need a little bit of extra space for as well. Add 15 pixels.

			} else {
				calculatedWidth = rootNode.offsetWidth+15; 
			}
					
			// Apply the width
			rootNode.style.width = calculatedWidth + 'px';
		}
		
		// hwa, 2005-06-09
		var _paddingRight = 0;
		var _paddingLeft = 0;
		
		// QnD fix to horizontal positioning of icon on MSIE/Win32, hwa 2005-06-09
		if (navigator.platform == 'Win32' && (ua.indexOf('msie 7.0') != -1 && ua.indexOf('opera') == -1)) {
			_paddingRight = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenuItem, 'paddingRight'));
			if (isNaN(paddingRight)) { 
				_paddingRight = 7;
			}
			_paddingLeft = parseInt(getCSSPropertyFromRule('.' + this.component.cssMenuItem, 'paddingLeft'));
			if (isNaN(paddingLeft)) { 
				_paddingLeft = 7; 
			}
		}
				  
		// explicit width of right border offset (ie icon image width), 
		// since MSIE/Win32 occasionally gave the wrong dynamic answer, hwa 2005-06-09
		var _imgRightOffset = 10;
		
		// Adjust all menu-item to the new width
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i].HTMLElement;
			
			// MSIE/Win32 IE5 & IE6 needs to have the width of all items adjusted to the toplevel item, updated hwa 2006-10-10
			if(navigator.platform == 'Win32' && (ua.indexOf('msie 6') != -1 && ua.indexOf('msie 5') != -1 && ua.indexOf('opera') == -1)) {
				item.style.width = calculatedWidth + 'px';
			}
			
			// Move all images to the right side
			var child = item.firstChild;
			if(child.tagName == 'NOBR') child = child.firstChild;
					
			// Find available sub menu icon and position it correctly
			IMG: while(child) {
				if(child.id == 'subMenuIcon' || child.id == 'subMenuIconDisabled') {
					
					child.style.position = 'absolute';						
					
					// updated 2006-10-10
					child.style.left = (calculatedWidth - _imgRightOffset) + 'px';
					
					//if(navigator.userAgent.toLowerCase().indexOf('gecko') != -1) // Mozilla and Netscape 6+ needs this to display the img correctly
					
					// QnD fixing the position of the icon on Safari, hwa 2005-06-09
					var _topAdjustment = 6;
					if (navigator.platform == 'MacPPC' && ua.indexOf('safari') != -1) {
						_topAdjustment = 5;
					} else if (navigator.platform == 'MacPPC' && ua.indexOf('msie') != -1) {
						_topAdjustment = 8;
					}
					
					// top position
					child.style.top = (item.offsetTop + _topAdjustment) + "px";
					
					break IMG;	// There is only one icon per item
				}
				
				child = child.nextSibling;
			}
		}
	}
	
	this.HTMLElement = rootNode;			// Save reference to the HTML element for the menu
	return rootNode;
}


/**
 * Displays an item and makes a call to _construct if that hasn't been done
 *	
 * The method returns false if a menu does not have menuitems
 */
function mc_show() {
	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}

	if(this.items.length == 0) return false;
	
	if(this.HTMLElement == null) {
		this._construct();	// Create HTML for the menu if that hasn't been done
	}
	var ua = navigator.userAgent.toLowerCase(); // Mac change : ua was never defined....
	// Determine the width of the menu item
	if(!this.HTMLElement.beenDisplayed) {
		// Run this only on ie 5.0 or 5.1 on MacOS (the error seems only to exist on OS 9, but these version where never released on osx)
		if(navigator.platform.toLowerCase().indexOf("mac") == 0 && parseFloat(ua.substr(ua.indexOf("msie") + 4)) < 5.2) { // Mac change : MSIE to msie
			// Adjust the height of the menu container to the total height of the menu items
			var lastChildNode = this.HTMLElement.childNodes.item(this.HTMLElement.childNodes.length - 1);
			this.HTMLElement.style.height = (lastChildNode.offsetTop + lastChildNode.offsetHeight) + "px"; // Mac change : added + "px";
		}

		this.HTMLElement.beenDisplayed = true;	// This whole operation only needs to be done once
	}
	
	// Hide system controls if they are visible
	if(this.component.hideControls && navigator.platform == 'Win32' && parseFloat(ua.substr(ua.indexOf("msie") + 4)) < 7) { // && !this.component._controlsHidden) {
		mc_setControlVisibility('hidden');
		// this.component._controlsHidden = true;
	}

	this.HTMLElement.style.visibility = 'visible';
	
	// CAB@CROSSCOM.SE: Add reference to the mc in openMenuContainers
	var referencePath = "menuComponents['"+this.component.name+"'].menus['"+this.name+"']";

	var foundMc = false;
	for(var i=0; i < openMenuContainers.length; i++)
	{
		if(openMenuContainers[i] == referencePath)
			foundMc = true
	}
	if(foundMc == false)
		openMenuContainers[openMenuContainers.length] = referencePath;
	
	return true;
}

/**
 * Hides a displayed item if page is loaded and the item is visible
 * returns a boolean value indicating the success of the operation
 */
function mc_hide() {
	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}
	
	// CAB@CROSSCOM.SE: Remove reference to this mc in openMenuContainers
	var referencePath = "menuComponents['"+this.component.name+"'].menus['"+this.name+"']";
	var newOpenMenuContainers = new Array();
	for(var i=0; i < openMenuContainers.length; i++)
	{
		if(openMenuContainers[i] != referencePath)
			newOpenMenuContainers[newOpenMenuContainers.length] = openMenuContainers[i]
	}
	openMenuContainers = newOpenMenuContainers;
	
	if(this.HTMLElement == null) return false;
	
	this.HTMLElement.style.visibility = 'hidden';
	
	if(this.inFocus == '[object MenuItem]') {
		this.inFocus.blur();
	}
	
	// Show system controls if they has been hidden
	if(this.component.hideControls) { //&& this.component._controlsHidden) {
		mc_setControlVisibility('visible');
		//this.component._controlsHidden = false;
	}

	return true;
}
/**
 * Hides all displayed MenuContianers
 * Added by Carl Abramsson [CAB@CROSSCOM.SE] on 040603
 */
function mc_hideAll()
{
	for(var i=0; i < openMenuContainers.length; i++)
	{
		if(openMenuContainers[i] != null && openMenuContainers[i] != "")
		{
			eval(openMenuContainers[i]+".hide()");
			openMenuContainers[i] = "";
		}
			
	}
	openMenuContainers = new Array();
	
}



/**_________________________________________________________
 *	METHODS FOR THE MenuItem OBJECT
 */

// Object constructor.
function MenuItem(menu, label, action, subMenu) {
	if(menu != '[object MenuContainer]') {
		throw new MCException('Missing reference to MenuContainer', 401);
	}
	
	// Properties
	this.menu = menu;						// Reference to the item's MenuContainer
	this.label = label;						// The text label
	this.action = action;					// The action property
	this.subMenu = subMenu;					// Reference to the item's submenu's MenuContainer
	this.subMenuTimer = null;				// This contains the timer id to a submenu that is about to be displayed
	this.status = MI_STATUS_NOT_CREATED;	// Retrieves the status of the menuitem
	
	// Methods
	this.blur = mi_blur;					// Causes an item to loose focus
	this.invokeAction = mi_invokeAction;	// Execute and evaluate the action property
	this.focus = mi_focus;					// Causes an item to recieve focus
	this.enable = mi_enable;				// Restoring an items status back to normal (if currently disabled)
	this.disable = mi_disable;				// Disables an item
	
	this.toString = new Function('return "[object MenuItem]"');
	
	return this;
}

/**
 * object.invokeAction()
 * Executes the specified action of the menu item
 * If the action property is a string, it will first be tested with a regex that check if it matches a URI. In that case the link will be followed
 * Else, the string will be evaluated as js-code
 * If the action property is a reference to a function, the function will be executed
 * If the is disabled, the action will not be executed
 */
function mi_invokeAction() {
	if(this.status == MI_STATUS_DISABLED) return;

	if(typeof this.action == 'string') {
	
		// Test useing the string methods 
		// The regex engine on IE on any MacOS version could not compile a good enough regex to do this
		var str = this.action.toLowerCase();	// The checks should be case insesitive, but preserve the original action string
		var protocol = str.substring(0, str.indexOf(":"));
		if(
			protocol == 'http' ||
			protocol == 'https' ||
			protocol == 'ftp' ||
			protocol == 'mailto' ||
			protocol == 'javascript' ||
			str.indexOf("/") == 0 ||
			str.indexOf("../") == 0 ||
			str.indexOf("./") == 0
		) {
			location.href = this.action;
		} else {
			eval(this.action);
		}
	} else if(typeof this.action == 'function') {
		this.action();
	}
}

/**
 * object.focus()
 * Sets focus on the given menu item. This will highlight the item and display any submenu and set status to focused
 * Status cannot be given to a disabled menu-item
 *
 * Arguments:
 *	showSubMenu		If true, any available submenu will be displayed after a timeout
 */
function mi_focus(showSubMenu) {
	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}
	
	if(this.status == MI_STATUS_DISABLED) {
		return;
	}
	
	if(typeof this.menu.component.cssMenuItemFocus == 'string') {
		this.HTMLElement.className = this.menu.component.cssMenuItemFocus;
	}
	
	if(this.subMenu == '[object MenuContainer]') {
		// Make sure the parent property of the submenu is correct (that value can be altered)
		if(this.subMenu.parent != this.menu) this.subMenu.parent = this.menu;
		
		if(showSubMenu) {
			// Set timer to display menu
			this.subMenuTimer = self.setTimeout('menuComponents["' + this.subMenu.component.name + '"].menus["' + this.subMenu.name + '"].show();', 500);
			
			if(!this.subMenu.positioned) {
				this.subMenu.setPosition('submenu', this);
			}
		}
	}
	
	this.status = MI_STATUS_FOCUSED;
	this.menu.inFocus = this;
}

/**
 * object.blur()
 * Removes focus from given menu item. This hides any submenu and sets status to normal
 * A disabled menu item cannot be blured
 */
function mi_blur() {
	if(!menuInitialized) {
		//throw new MCException('MenuComponent is not initialized', 101);
		return;
	}

	if(this.status == MI_STATUS_DISABLED) {
		return;
	}
	
	if(typeof this.menu.component.cssMenuItem == 'string') {
		this.HTMLElement.className = this.menu.component.cssMenuItem;
	}

	if(this.subMenu == '[object MenuContainer]') {
		if(this.subMenuTimer) {
			// If the timer has been started, clear it and reset the timer variable
			self.clearTimeout(this.subMenuTimer);
			this.subMenuTimer = null;
		}

		if(this.subMenu.isVisible()) {
			// Hide a visible submenu
			this.subMenu.hide();
		}
	}
	
	this.status = MI_STATUS_NORMAL;
	this.menu.inFocus = null;
}


/**
 *	object.disable()
 *	Disables a menu item by setting its status to disabled. This will prevent actions from being executed, 
 *	and the item will not be able to recieve or loose focus.
 *	If the item has focus when its disabled, blur() will be called, hiding any open submenu
 */
function mi_disable() {
	if(this.status == MI_STATUS_FOCUSED) {
		this.blur();
	}

	if(this.HTMLElement != null) {

		if(typeof this.menu.component.cssMenuItemDisabled == 'string') {
			this.HTMLElement.className = this.menu.component.cssMenuItemDisabled;
		}
	}
	
	this.status = MI_STATUS_DISABLED;
}


/**
 *	object.enable()
 *	Restoring a disabled menu item back to normal
 */
function mi_enable() {
	if(this.status == MI_STATUS_DISABLED) {
		if(this.HTMLElement != null) {
			if(typeof this.menu.component.cssMenuItem == 'string') {
				this.HTMLElement.className = this.menu.component.cssMenuItem;
			}
		}

		this.status = MI_STATUS_NORMAL;
	}
}

/**_________________________________________________________
 *	GLOBAL NON-API METHODS
 */

/**
 *	window.initializeMenu()
 *	Initializes the menu and changes initialization state to true
 *	This code also adds global eventhandlers to control open menus. These handlers effect all components on page
 */
function initializeMenu() {
	document.onmousedown = function(e) {	// Hide all menus on a single click outside the menu itself
		var src;
		if(e) { // Get the source. e is the w3c dom event object, while msie uses the global 'event' object
			src = e.target;
		} else if(event) {
			src = event.srcElement;
		}
		
		if (src == null || !src.getAttribute) { return true; } // error check, HWA 2004-02-04
		
		// The getAttribute is supported by Opera, but does not seem to work... no idea why
  	var eventAttr = src.getAttribute('mcEvent');								// Get event property associated with the menu component from source
		if(eventAttr == null) eventAttr = src.getAttribute('mcMouseDown');			// Check specific action
		if(eventAttr != null && eventAttr.toLowerCase() == 'nohide') return true;

		for(var component in menuComponents) {
			menuComponents[component].hideAll();
		}
	}
	
	document.onmouseover = function(e) {	// Hide all menus after 1500 msek if a timer is not already initialized and element is not a menu item
		var src;
		if(e) { // Get the source. e is the w3c dom event object, while msie uses the global 'event' object
			src = e.target;
		} else if(event) {
			src = event.srcElement;
		}
		
		if (src == null || !src.getAttribute) { return true; } // error check, HWA 2004-02-04

	  var eventAttr = src.getAttribute('mcevent');								// Get event property associated with the menu component from source
		if(eventAttr == null) eventAttr = src.getAttribute('mcmouseover');			// Check specific action
		if(eventAttr != null && eventAttr.toLowerCase() == 'nohide') return true;


	  if(src.menu != '[object MenuContainer]') {
			// Blur the first found focused menu item of a visible menu IF that item does not have a visible submenu

			COMPONENTS : for(var componentName in menuComponents) {
				var component = menuComponents[componentName];
				if(component.closeTimerID != null || !component.autoHide) continue COMPONENTS;		// skip the component if it's about to be closed
				CONTAINERS : for(var menuName in component.menus) {
					var menu = component.menus[menuName];
					if(menu.isVisible() && menu.inFocus == '[object MenuItem]') {
						if(menu.inFocus.subMenu && menu.inFocus.subMenu.isVisible()) {
							continue CONTAINERS; // If focused item has a visible submenu, just skip it
						}
						menu.inFocus.blur();
						break CONTAINERS;
					}
				}
				component.closeTimerID = self.setTimeout('menuComponents["' + component.name + '"].hideAll()', 1500);	// Set timeout
			}
		}
	}
	
	window.onresize = function() {	// All items has to be re-positioned after the window has been resized
		for(var componentName in menuComponents) {
			var component = menuComponents[componentName];
			
			for(var menuName in component.menus) {
				component.menus[menuName].positioned = false;
			}
		}
	}
	
	menuInitialized = true;
}

/**
 *	mc_hideRelated
 *	Hides all menus related to a given menu
 *
 *	Arguments
 *		menu	A menu component object. All submenus (including the given one) will be hidden
 */
function mc_hideRelated(menu) {
	if(!menu || menu.constructor != MenuContainer) {
		throw new MCException("'" + menu + "' is not a MenuContainer", 102);
	}
	
	for(var i = 0; i < menu.items.length; i++) {
		if(menu.items[i].subMenu == '[object MenuContainer]' && menu.items[i].subMenu.isVisible()) {
			mc_hideAllRelated(menu.items[i].subMenu);
		}
	}
	menu.hide();
}

/**
 *	mc_setControls
 *	Sets the visibility of system controls
 *	
 *	Arguments
 *		vis		String. Either 'visible' or 'hidden'
 */
var controlHideCount = 0;
var controlsCurrentState = "visible";
var doSetControlVisibility_timer = null;
function mc_setControlVisibility(vis) {
	
	vis = vis || 'hidden';
	
	if(vis == 'hidden')
		controlHideCount++
	else if(controlHideCount > 0)
		controlHideCount--
	vis = (controlHideCount > 0)? "hidden":"visible";
	
	if(vis == 'hidden')
	{
		if(doSetControlVisibility_timer != null)
		{
			self.clearTimeout(doSetControlVisibility_timer);
			doSetControlVisibility_timer = null;
		}
		doSetControlVisibility(vis);
	}
	else
	{
		if(doSetControlVisibility_timer != null)
		{
			self.clearTimeout(doSetControlVisibility_timer);
			doSetControlVisibility_timer = null;
		}
		doSetControlVisibility_timer = self.setTimeout("doSetControlVisibility('"+vis+"')",100);
	}
		
}

function doSetControlVisibility(vis)
{
	if(controlsCurrentState != vis)
	{
		controlsCurrentState = vis;
		var ctrlsSelect = document.getElementsByTagName('SELECT');
		//var ctrlsObject = document.getElementsByTagName('OBJECT');
		//var ctrlsApplet = document.getElementsByTagName('APPLET');
	
		var i;
		for(i = 0; i < ctrlsSelect.length; i++) {
			ctrlsSelect.item(i).style.visibility = vis;
		}
		//for(i = 0; i < ctrlsObject.length; i++) {
		//	ctrlsObject.item(i).style.visibility = vis;
		//}
		//for(i = 0; i < ctrlsApplet.length; i++) {
		//	ctrlsApplet.item(i).style.visibility = vis;
		//}
	}
}

/**_________________________________________________________
 *	TOOLS
 *	These functions can be moved outside the library if you want them to be used by other applications

 */

/**
 *	getCSSPropertyFromRule
 *	
 *	Returns the value of a CSS property from a specific rule declared in a stylesheet, inline or external
 *
 *	Arguments
 *		ruleName	The name of the rule, for example 'DIV.header'
 *		property	The name of the property, DOM style (background-color is backgroundColor)
 *
 *	Returns null if rule was not found
 *	Returns null if property was not found in rule
 *	Returns '' if property was not set
 *	Returns the value as a string if found
 */

function getCSSPropertyFromRule(ruleName, property) {
	if(ruleName.charAt(0) == '.' && (navigator.platform == 'MacPPC' && navigator.appName == 'Microsoft Internet Explorer')) {
		ruleName = '*' + ruleName;
	}
	try {
		for(var i = 0; i < document.styleSheets.length; i++) {
			var colCSSRules;	// Collection of rules in the stylesheet declaration

			with(document.styleSheets.item(i)) {
				colCSSRules = (typeof cssRules == 'undefined') ? rules : cssRules;
			}

			for(var j = 0; j < colCSSRules.length; j++) {
				var cssRule = colCSSRules.item(j);

				if(cssRule.selectorText == ruleName) {
					if(cssRule.style[property]) {
						return String(cssRule.style[property]);
					} else {
						return null;
					}
				}
			}
		}
		return null;
	} catch(exception) {
		return null;	// All browsers does not implement the styleSheet-collection
	}
}

// This method removes all undefined or null values within an array
// This method is not a part of any open standard
if(typeof Array.compress != 'function') {
	Array.prototype.compress = function() {
		var arrTmp = new Array();
		for(var i = 0; i < this.length; i++) {
			// Mac change : old code : if(i in this) {
			if(this[i]) {
				arrTmp.push(this[i]);
			}
		}

		for(var i = 0; i < this.length; i++) {
			this[i] = arrTmp[i];
		}

		this.length = arrTmp.length;
	}
}