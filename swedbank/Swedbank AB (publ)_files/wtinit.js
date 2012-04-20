// WebTrends SmartSource Data Collector Tag
// Version: 1.1.1
// Created: 5/15/2008 12:08:55 AM
function DcsInit(){
	var that=this;
	this.dcsid="dcsv5bquupez1ledhhwndfept_4h1j";
	this.domain="stat.swedbank.se";
	this.enabled=true;
	this.exre=(function(){return(window.RegExp?new RegExp("dcs(uri)|(ref)|(aut)|(met)|(sta)|(sip)|(pro)|(byt)|(dat)|(p3p)|(cfg)|(redirect)|(cip)","i"):"");})();
	this.fpc="WT_FPC";
	this.fpcdom=".swedbank.se";
	this.i18n=false;
	this.images=[];
	this.index=0;
	this.qp=[];
	this.re=(function(){return(window.RegExp?(that.i18n?{"%25":/\%/g}:{"%09":/\t/g,"%20":/ /g,"%23":/\#/g,"%26":/\&/g,"%2B":/\+/g,"%3F":/\?/g,"%5C":/\\/g,"%22":/\"/g,"%7F":/\x7F/g,"%A0":/\xA0/g}):"");})();
	this.onsitedoms="";
	this.downloadtypes="xls,doc,pdf,txt,csv,zip,ppt,pps";
	this.rightclicktypes="xls,doc,pdf,txt,csv,zip,ppt,pps";
	this.timezone=1;
	this.trackevents=true;
	(function(){if(that.enabled&&(document.cookie.indexOf(that.fpc+"=")==-1)&&(document.cookie.indexOf("WTLOPTOUT=")==-1)){document.write("<scr"+"ipt type='text/javascript' src='"+"http"+(window.location.protocol.indexOf('https:')==0?'s':'')+"://"+that.domain+"/"+that.dcsid+"/wtid.js"+"'><\/scr"+"ipt>");}})();
}
var DCS={};
var WT={};
var DCSext={};
var dcsInit=new DcsInit();