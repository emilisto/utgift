// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (GetInfo == null) var GetInfo = {};
GetInfo._path = '/campaign/dwr';
GetInfo.getCampaignInfo = function(p0, p1, p2, callback) {
  dwr.engine._execute(GetInfo._path, 'GetInfo', 'getCampaignInfo', p0, p1, p2, callback);
}