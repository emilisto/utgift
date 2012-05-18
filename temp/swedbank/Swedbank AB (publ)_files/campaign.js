var campaign = {
	collect : (function tlist(){
		var inner = {};
		var foundItems = [];
		inner.setItem = function (item){
			foundItems[foundItems.length] = item;
			return item;
		};
		inner.getString = function (){
			var itemStr = foundItems;
			return itemStr;
		};
		inner.length = function(){
			return foundItems.length;
		};
		return inner;
	})(),
	loginAds: function () {
		try {
			if (campaign.runThrough()){
				adCampaign='adCampaign=IBTracker';
				var page1d = '';
				var metaTags = null;
				metaTags = document.getElementsByTagName("META");
				if ( metaTags != null && metaTags.length > 0) {
					var tag = null;
					tag = metaTags["WT.batch_pageid"];
					if (tag !="undefined" && tag != null){
						page1d = tag.content;
					}
				}				
				GetInfo.getCampaignInfo(page1d,adCampaign+ ';' + campaign.collect.getString(), document.URL);
			}
		} catch (e) {}
	},	
	checkId: function(idStr){
		if (document.getElementById(idStr) != null) {
			return true;
		} else {
			return false;
		}
	}, 			

	runThrough: function () {
		if (typeof admin_link != 'undefined') campaign.collect.setItem("admin_link");
		if (campaign.checkId("dataframe")) campaign.collect.setItem("dataframe");
		if (campaign.checkId("overlay")) campaign.collect.setItem("overlay");
		if (typeof brcl != 'undefined') campaign.collect.setItem("brcl");
		if (campaign.collect.length() > 0) {
			return true;
		}	else {
			return false;
		}		
	}
}

setTimeout('campaign.loginAds()', 2000);    

