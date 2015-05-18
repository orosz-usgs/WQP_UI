var APP={};APP.DOWNLOAD={beforeSubmit:function(myForm ,resultType){
var urlString=APP.URLS.getFormUrl(resultType);if(urlString.length>2000){PORTAL.downloadProgressDialog.updateProgress({message:'Too many query criteria selected.  <br>Please reduce your selections <br>'
+'NOTE: selecting all options for a given criteria is the same as selecting none.<br>'
+'query length threshold 2000, current length: '+urlString.length});}
APP.DOWNLOAD.makeHeadRequest(urlString,$('#providers-select').val(),resultType,$('input[name="mimeType"]').val());return;},makeHeadRequest:function(urlString ,providers ,resultType,fileFormat){
var http=new XMLHttpRequest();http.open('HEAD',urlString,false); http.send();var headers=new HTTPHeaders(http.getAllResponseHeaders());var warnings=headers.getWarnings(); var count=DataSourceUtils.getCountsFromHeader(headers,PORTAL.MODELS.providers.getIds());var resultsReturned=resultType!=='Station';var getCountMessage=function(){var message='Your query will return ';var providers=PORTAL.MODELS.providers.getIds();if(resultsReturned){message+='<b>'+count.total.results+'</b> sample results from <b>'+count.total.sites+'</b> sites:<br />';for(var i=0;i<providers.length;i++){var id=providers[i];message+='From '+id+': '+count[id].results+' sample results from '+count[id].sites+' sites<br />';}}
else{message+=count.total.sites+':<br />';for(var i=0;i<providers.length;i++){var id=providers[i];message+='From '+id+': '+count[id].sites+'<br/>';}}
return message;};function noData(){return(resultsReturned&&(count.total.results==='0'))||(!resultsReturned&&(count.total.sites==='0'));};var warningMessage='';for(var i=0;i<warnings.length;i++){if(($.inArray(warnings[i].agent,providers)!==-1)&&warnings[i].code!=199){warningMessage+='<p>Issue with '+warnings[i].agent+': '+warnings[i].text+'</p>';}}
if(noData()){PORTAL.downloadProgressDialog.updateProgress({message:'Your query returned no data to download.<br />'+warningMessage});}
else{var downloadCount;if(resultsReturned){downloadCount=count.total.results;}
else{downloadCount=count.total.sites;}
PORTAL.downloadProgressDialog.updateProgress({totalCounts:downloadCount,message:warningMessage+getCountMessage(),fileFormat:fileFormat});}}};
APP.RULES={isBBoxValid:function(myForm ){var north=$(myForm).find('input[name=north]').val();var south=$(myForm).find('input[name=south]').val();var west=$(myForm).find('input[name=west]').val();var east=$(myForm).find('input[name=east]').val();if((north.length==0)&&(south.length==0)&&(west.length==0)&&(east.length==0)){return true;}
else if((north.length>0)&&(south.length>0)&&(east.length>0)&&(west.length>0)){var message='';if(isNaN(north)||isNaN(south)||isNaN(east)||isNaN(west)){message+='Floating point numbers are required for bounding box fields. <br />';}
else{if(parseFloat(south)>=parseFloat(north)){message+='The value of south '+south+' must be less than the value of north '+north+'. <br />';}
if(parseFloat(west)>=parseFloat(east)){message+='The value of west '+west+' must be less than the value of east '+east+'. <br />';}}
if(message){PORTAL.downloadProgressDialog.updateProgress({message:message});return false;}
else{return true;}}
else{PORTAL.downloadProgressDialog.updateProgress({message:'Bounding box values must be all empty or all filled in.'});}},isResultsRequestValid:function(myForm ){
if(APP.RULES.isBBoxValid(myForm)){if($(myForm).find('input[name=mimeType][value=kml]').is(':checked')){PORTAL.downloadProgressDialog.updateProgress({message:'Results cannot be downloaded in kml'});return false;}
return true;}}};
APP.URLS={};APP.URLS={getQueryParams:function(forGoogle ){var IGNORE_PARAM_LIST=["north","south","east","west","resultType","source"];var ignoreList=(forGoogle)?IGNORE_PARAM_LIST.concat(["mimeType","zip"]):IGNORE_PARAM_LIST;var result=getFormQuery($(APP.DOM.form),ignoreList);if(forGoogle){if(!result){result+='&';}
result+="mimeType=kml";}
return result;},getFormUrl:function(resultType ,forGoogle ){return Config.QUERY_URLS[resultType]+"?"+APP.URLS.getQueryParams(forGoogle);}};APP.DOM={getBBox:function(){var myForm=APP.DOM.form;return(myForm.north.value&&myForm.west.value&&myForm.south.value&&myForm.east.value)?myForm.west.value+","+myForm.south.value+","+myForm.east.value+","+myForm.north.value:"";},getResultType:function(){return $(APP.DOM.form).find('input[name="resultType"]').val();}};var MapUtils={};MapUtils.XYZ_URL_POSTFIX='${z}/${y}/${x}';MapUtils.MERCATOR_PROJECTION=new OpenLayers.Projection("EPSG:900913");MapUtils.WGS84_PROJECTION=new OpenLayers.Projection("EPSG:4326");MapUtils.DEFAULT_CENTER={lon:-82.5,lat:48.2};MapUtils.MAP_OPTIONS={projection:MapUtils.MERCATOR_PROJECTION,maxResolution:156543.0339,maxExtent:new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),controls:[new OpenLayers.Control.Navigation(),new OpenLayers.Control.ArgParser(),new OpenLayers.Control.Attribution(),new OpenLayers.Control.Zoom(),new OpenLayers.Control.ScaleLine(),new OpenLayers.Control.MousePosition({formatOutput:function(lonLat){lonLat.transform(MapUtils.MERCATOR_PROJECTION,MapUtils.WGS84_PROJECTION);return lonLat.toShortString();}}),new OpenLayers.Control.LayerSwitcher()]};MapUtils.BASE_LAYERS={light_grey_base:{type:OpenLayers.Layer.XYZ,name:'World Light Gray',url:'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/'+MapUtils.XYZ_URL_POSTFIX},world_street:{type:OpenLayers.Layer.XYZ,name:'World Street',url:'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/'+MapUtils.XYZ_URL_POSTFIX},world_imagery:{type:OpenLayers.Layer.XYZ,name:'World Imagery',url:'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+MapUtils.XYZ_URL_POSTFIX},world_topo:{type:OpenLayers.Layer.XYZ,name:'World Topo',url:'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/'+MapUtils.XYZ_URL_POSTFIX},world_relief:{type:OpenLayers.Layer.XYZ,name:'World Relief',url:'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/'+MapUtils.XYZ_URL_POSTFIX}};
MapUtils.getLayer=function(layer,options){if(layer.type==OpenLayers.Layer.Stamen){return new OpenLayers.Layer.Stamen(layer.name,options);}
else{return new layer.type(layer.name,layer.url,options);}}
MapUtils.getNWISSitesLayer=function(options,params){options=options?options:{};params=params?params:{};var defaultOptions={layers:'NWC:gagesII',version:'1.1.1',format:'image/png',transparent:true,tiled:true};var defaultParams={isBaseLayer:false,displayInLayerSwitcher:true,visibility:false,singleTile:true
}
var finalParams=$.extend({},defaultParams,params);var finalOptions=$.extend({},defaultOptions,options);var sldDeferred=$.Deferred();$.ajax({url:Config.NWIS_SITE_SLD_URL,dataType:'text',success:function(data){finalOptions.sld_body=data;sldDeferred.resolve(new OpenLayers.Layer.WMS('NWIS Stream Gages','http://cida.usgs.gov/nwc/proxygeoserver/NWC/wms',finalOptions,finalParams));},error:function(){sldDeferred.resolve(new OpenLayers.Layer.WMS('NWIS Stream Gages','http://cida.usgs.gov/nwc/proxygeoserver/NWC/wms',finalOptions,finalParams))}});return sldDeferred;}
function setCheckboxState(elements ,state ){if(state){elements.prop('checked',true);}
else{elements.prop('checked',false);}}
function setCheckboxTriState(elements ,is_indeterminate ,state ){if(is_indeterminate){elements.prop('indeterminate',true);}
else{elements.prop('indeterminate',false);setCheckboxState(elements,state);}}
function getCheckBoxHtml(id,className,value){var checkBox='<input type="checkbox" id="'+id+'" class="'+className+'" value="'+value+'"/>';var label='<label for="'+id+'">'+value+'</label>';return checkBox+label;}
function getFormValues(formEl ,ignoreList ){var allInputs=formEl.serializeArray();var result=[];for(var i=0;i<allInputs.length;i++){if($.inArray(allInputs[i].name,ignoreList)===-1&&allInputs[i].value){result.push(allInputs[i]);}}
return result;}
function getFormQuery(formEl ,ignoreList ){return $.param(getFormValues(formEl,ignoreList));}
function setEnabled(els ,isEnabled ){els.prop('disabled',!isEnabled);if(isEnabled){els.each(function(){$('label[for="'+$(this).attr('id')+'"]').removeClass('disabled');});}
else{els.each(function(){$('label[for="'+$(this).attr('id')+'"]').addClass('disabled');});}};function toggleShowHideSections(buttonEl,contentDivEl){var buttonImgEl=buttonEl.find('img');if(buttonImgEl.attr('alt')==='show'){buttonEl.attr('title',buttonEl.attr('title').replace('Show','Hide'));buttonImgEl.attr('alt','hide').attr('src',Config.STATIC_ENDPOINT+'img/collapse.png');contentDivEl.slideDown();return true;}
else{buttonEl.attr('title',buttonEl.attr('title').replace('Hide','Show'));buttonImgEl.attr('alt','show').attr('src',Config.STATIC_ENDPOINT+'img/expand.png');contentDivEl.slideUp();return false;}}
function IdentifyDialog(dialogDivId,downloadUrlFunc ){ this.dialogEl=$('#'+dialogDivId);this._downloadButtonEl=this.dialogEl.find('#download-map-info-button');this._detailDivEl=this.dialogEl.find('#map-info-details-div');this.portalDataMap=null; this._downloadButtonEl.click($.proxy(function(){var dialogFormEl=this.dialogEl.find('form');var resultType=this.dialogEl.find('input[name="resultType"]:checked').val();var url=downloadUrlFunc(resultType);dialogFormEl.attr('action',url);_gaq.push(['_trackEvent','Portal Page','IdentifyDownload'+resultType,url+'?'+dialogFormEl.serialize()]);dialogFormEl.submit();},this));this.create=function(portalDataMap){this.portalDataMap=portalDataMap;this.dialogEl.dialog({autoOpen:false,modal:false,title:'Detailed site information',width:450,height:400,close:$.proxy(function(event,ui){this.portalDataMap.cancelIdentifyOp();},this)});};this.updateAndShowDialog=function(siteIds ,bbox ,formParams){var that=this;var updateFnc=function(html){that._detailDivEl.html(html);};var successFnc=function(){var formHtml='';var i;that.dialogEl.find('#map-id-hidden-input-div input[type="hidden"]').remove();if(siteIds.length>50){ formHtml+='<input type="hidden" name="bBox" value="'+bbox.toBBOX()+'" />';for(i=0;i<formParams.length;i++){if(formParams[i].name!=='bBox'){formHtml+='<input type="hidden" name="'+formParams[i].name+'" value="'+formParams[i].value+'" />';}}}
else{formHtml+='<input type="hidden" name="siteid" value="'+siteIds.join(';')+'" />';}
that.dialogEl.find('#map-id-hidden-input-div').append(formHtml);that._downloadButtonEl.removeAttr('disabled');};this._downloadButtonEl.attr('disabled','disabled');this.dialogEl.dialog('open');PORTAL.CONTROLLER.retrieveSiteIdInfo(siteIds,updateFnc,successFnc);};}
WQPGetFeature=OpenLayers.Class(OpenLayers.Control.GetFeature,{CLASS_NAME:'WQPGetFeature',selectBoundingBox:new OpenLayers.Bounds(),selectBoxFeatures:[],getLastBoundingBox:function(){return this.selectBoundingBox;},getSelectBoxFeatures:function(){return this.selectBoxFeatures;},initialize:function(options){OpenLayers.Control.GetFeature.prototype.initialize.apply(this,[options]);},selectBox:function(position){if(position instanceof OpenLayers.Bounds){var upperLeftLonLat=this.map.getLonLatFromPixel(new OpenLayers.Pixel(position.left,position.top));var lowerRightLonLat=this.map.getLonLatFromPixel(new OpenLayers.Pixel(position.right,position.bottom));this.selectBoundingBox=new OpenLayers.Bounds(upperLeftLonLat.lon,lowerRightLonLat.lat,lowerRightLonLat.lon,upperLeftLonLat.lat);this.selectBoxFeatures=[new OpenLayers.Feature.Vector(this.selectBoundingBox.toGeometry())];}
else if(!this.click){this.selectBoundingBox=this.pixelToBounds(position);this.selectBoxFeatures=[];}
OpenLayers.Control.GetFeature.prototype.selectBox.apply(this,[position]);},selectClick:function(evt){this.selectBoundingBox=this.pixelToBounds(evt.xy);this.selectBoxFeatures=[];OpenLayers.Control.GetFeature.prototype.selectClick.apply(this,[evt]);}});function SitesLayer(formParams,loadendCallback,enableBoxId,selectFeatureFnc){this._isBoxIDEnabled=enableBoxId;this._selectFeatureFnc=selectFeatureFnc;var getSearchParams=function(formParams){var result=[];providerValues=[];$.each(formParams,function(index,param){if(param.name==='providers'){providerValues.push(param.value);}
else{var paramStr=param.name+':'+param.value.replace(';','|');result.push(paramStr);}});if(providerValues.length>0){result.push('providers:'+providerValues.join('|'));}
return result.join(';');};this.searchParams=getSearchParams(formParams);this.dataLayer=new OpenLayers.Layer.WMS('Sites',Config.SITES_GEOSERVER_ENDPOINT+'wms',{layers:'wqp_sites',styles:'wqp_sources',format:'image/png',transparent:true,searchParams:this.searchParams},{displayInLayerSwitcher:false,isBaseLayer:false,transitionEffect:'resize',singleTile:true,visibility:true,opacity:0.75,tileOptions:{
 maxGetUrlLength:1024}});this.dataLayer.events.register('loadend',this,function(ev){loadendCallback();});this._createIdControl=function(){var filter=new OpenLayers.Filter.Comparison({type:OpenLayers.Filter.Comparison.EQUAL_TO,property:'searchParams',value:encodeURIComponent(this.searchParams)});var protocol=new OpenLayers.Protocol.WFS({version:'1.1.0',url:Config.SITES_GEOSERVER_ENDPOINT+'wfs',srsName:'EPSG:900913',featureType:'wqp_sites',featureNS:'',featurePrefix:'',defaultFilter:filter});this.idFeatureControl=new WQPGetFeature({protocol:protocol,box:this._isBoxIDEnabled,click:!this._isBoxIDEnabled,clickTolerance:5,single:false,maxFeatures:50});this.idFeatureControl.events.register('featuresselected',this,function(ev){this._selectFeatureFnc(ev,this.idFeatureControl.getLastBoundingBox());});this.idFeatureControl.events.register('clickout',this,function(ev){console.log('No feature selected');});};this.idFeatureControl=null;this.addToMap=function(map ){map.addLayer(this.dataLayer);this._createIdControl();map.addControl(this.idFeatureControl);this.idFeatureControl.activate();};this.removeFromMap=function(map ){this.idFeatureControl.deactivate();map.removeControl(this.idFeatureControl);map.removeLayer(this.dataLayer);};this.enableBoxId=function(map ,on ){if(this._isBoxIDEnabled!==on){this._isBoxIDEnabled=on;this.idFeatureControl.deactivate();map.removeControl(this.idFeatureControl);this._createIdControl();map.addControl(this.idFeatureControl);this.idFeatureControl.activate();}};};SiteImportWPSUtils={getRequestXML:function(identifier ,dataInputs ){var formattedData=[];for(var i=0;i<dataInputs.length;i++){formattedData.push({'identifier':dataInputs[i].name,'data':{'literalData':{'value':dataInputs[i].value}}});}
return new OpenLayers.Format.WPSExecute().write({'identifier':identifier,'dataInputs':formattedData,'responseForm':{'rawDataOutput':{'identifier':'result'}}});}}
function PortalDataMap(mapDivId,updateDivId,identifyDialog ){var WPS_URL=Config.GEOSERVER_ENDPOINT+'/ows?service=WPS&version=1.0.0&request=Execute';var BASE_LAYERS=['world_topo','world_street','world_relief','world_imagery'];this.map=new OpenLayers.Map(mapDivId,MapUtils.MAP_OPTIONS);
 this.identifyTool=new OpenLayers.Control.Button({displayClass:'identify-button',type:OpenLayers.Control.TYPE_TOGGLE,title:'Toggle to enable box identify. Click and drag to draw rectangle area of interest.',eventListeners:{activate:function(){this._boxIdentifyOn=true;this.toggleBoxId();},deactivate:function(){this._boxIdentifyOn=false;this.toggleBoxId();},scope:this}});this.toolPanel=new OpenLayers.Control.Panel({createControlMarkup:function(control){var button=document.createElement('button');return button;}});this.toolPanel.addControls([this.identifyTool]);this.map.addControl(this.toolPanel);this.dataLayer=null;this._boxIdentifyOn=false;this._updateDivEl=$('#'+updateDivId);this._identifyDialog=identifyDialog;this._popupIdentify;this._selectBoxLayer=new OpenLayers.Layer.Vector('selectBoxLayer',{displayInLayerSwitcher:false,isBaseLayer:false});this.map.addLayer(this._selectBoxLayer);this._updateSelectBoxLayer=function(){this._selectBoxLayer.destroyFeatures();this._selectBoxLayer.addFeatures(this.dataLayer.idFeatureControl.getSelectBoxFeatures());};this._identifyDialog.create(this);this.timerId={};this.completeFnc=null; OpenLayers.ProxyHost="" 
var loadingPanel=new OpenLayers.Control.LoadingPanel();this.map.addControl(loadingPanel); var baseLayers=[];for(var i=0;i<BASE_LAYERS.length;i++){baseLayers[i]=MapUtils.getLayer(MapUtils.BASE_LAYERS[BASE_LAYERS[i]],{isBaseLayer:true,transitionEffect:'resize'});}
this.map.addLayers(baseLayers);MapUtils.getNWISSitesLayer().then(function(layer){this.map.addLayer(layer);}.bind(this));this.map.zoomTo(3);var center=new OpenLayers.LonLat(MapUtils.DEFAULT_CENTER.lon,MapUtils.DEFAULT_CENTER.lat);this.map.setCenter(center.transform(MapUtils.WGS84_PROJECTION,MapUtils.MERCATOR_PROJECTION));this.toggleBoxId=function(){if(this.dataLayer){this.dataLayer.enableBoxId(this.map,this._boxIdentifyOn);}};this.cancelIdentifyOp=function(){this._selectBoxLayer.destroyFeatures();};this.cancelMapping=function(){window.clearInterval(this.timerId);this.timerId={};this._updateDivEl.hide();if(this.completeFnc){this.completeFnc();this.completeFnc=null;}};this.showDataLayer=function(formParams,loadendCallback){var self=this; if(this.dataLayer){this.dataLayer.removeFromMap(this.map);this._selectBoxLayer.destroyFeatures();this.map.removeLayer(this._selectBoxLayer);}
if(this._identifyDialog.dialogEl.dialog('isOpen')){this._identifyDialog.dialogEl.dialog('close');}
if(this._popupIdentify){this.map.removePopup(this._popupIdentify);}
this.dataLayer=new SitesLayer(formParams,loadendCallback,this._boxIdentifyOn,function(ev,selectBoundingBox){var siteIds=[];var degreeBBox;var i;self._updateSelectBoxLayer();
 for(i=0;i<ev.features.length;i++){siteIds.push(ev.features[i].attributes.name);}
if($('body').width()<750){PORTAL.CONTROLLER.retrieveSiteIdInfo(siteIds,function(html){this._popupIdentify=new OpenLayers.Popup.FramedCloud('idPopup',selectBoundingBox.getCenterLonLat(),null,html,null,true,function(){self._popupIdentify=null;self.cancelIdentifyOp();self.destroy();});self.map.addPopup(this._popupIdentify,true);});}
else{degreeBBox=selectBoundingBox.transform(MapUtils.MERCATOR_PROJECTION,MapUtils.WGS84_PROJECTION);self._identifyDialog.updateAndShowDialog(siteIds,degreeBBox,formParams);}});this.dataLayer.addToMap(this.map);this.map.addLayer(this._selectBoxLayer);};};var PORTAL=PORTAL||{};PORTAL.VIEWS=PORTAL.VIEWS||{};PORTAL.VIEWS.createStaticSelect2=function(el ,ids ,select2Options ){var defaultOptions={placeholder:'All',allowClear:true};var selectHtml='';var i;for(i=0;i<ids.length;i++){selectHtml+='<option value="'+ids[i]+'">'+ids[i]+'</option>';}
el.append(selectHtml);el.select2($.extend({},defaultOptions,select2Options));};PORTAL.VIEWS.createCodeSelect=function(el ,spec ,select2Options ){ if(!('isMatch'in spec)){spec.isMatch=function(data,searchTerm){if(searchTerm){return(data.desc.toUpperCase().indexOf(searchTerm.toUpperCase())>-1);}
else{return true;}};}
if(!('formatData'in spec)){spec.formatData=function(data){return{id:data.id,text:data.desc+' ('+PORTAL.MODELS.providers.formatAvailableProviders(data.providers)+')'};};}
if(!('getKeys'in spec)){spec.getKeys=function(){return;};}
var defaultOptions={placeholder:'All',allowClear:true,multiple:true,separator:';',formatSelection:function(object,container){return object.id;},query:function(options){spec.model.processData(function(data){var i,key;var results=[];var dataArray=[];if(length in data&&data.length>0){dataArray=dataArray.concat(data);}
else{for(key in data){if((data[key])&&data[key].length>0){dataArray=dataArray.concat(data[key]);}}}
for(i=0;i<dataArray.length;i++){if(spec.isMatch(dataArray[i],options.term)){results.push(spec.formatData(dataArray[i]));}}
options.callback({'results':results});},spec.getKeys());}};el.select2($.extend(defaultOptions,select2Options));};var PORTAL=PORTAL||{};PORTAL.onReady=function(){var initProviderSelect=function(ids){PORTAL.VIEWS.createStaticSelect2($('#providers-select'),ids);};var failedProviders=function(error){alert('Unable to retrieve provider list with error: '+error);};var placeSelects;var select2Options={};PORTAL.portalDataMap;APP.DOM.form=document.getElementById("params");PORTAL.downloadProgressDialog=PORTAL.VIEWS.downloadProgressDialog($('#download-status-dialog'));PORTAL.MODELS.providers.initialize(initProviderSelect,failedProviders);placeSelects=PORTAL.VIEWS.placeSelects($('#countrycode'),$('#statecode'),$('#countycode')); PORTAL.VIEWS.createCodeSelect($('#siteType'),{model:PORTAL.MODELS.siteType},select2Options);PORTAL.VIEWS.createCodeSelect($('#organization'),{model:PORTAL.MODELS.organization,formatData:function(data){return{id:data.id,text:data.id+' - '+data.desc};},isMatch:function(data,searchTerm){if(searchTerm){var searchTermUpper=searchTerm.toUpperCase();return((data.id.toUpperCase().indexOf(searchTermUpper)>-1)||(data.desc.toUpperCase().indexOf(searchTermUpper)>-1));}
else{return true;}}},$.extend({},select2Options,{closeOnSelect:false,minimumInputLength:2}));PORTAL.VIEWS.createCodeSelect($('#sampleMedia'),{model:PORTAL.MODELS.sampleMedia},select2Options);PORTAL.VIEWS.createCodeSelect($('#characteristicType'),{model:PORTAL.MODELS.characteristicType},select2Options);PORTAL.VIEWS.createCodeSelect($('#characteristicName'),{model:PORTAL.MODELS.characteristicName},$.extend({},select2Options,{closeOnSelect:false,minimumInputLength:2,sortResults:function(results,container,query){if(query.term){results.sort(function(a,b){if(a.text.length>b.text.length){return 1;}
else if(a.text.length<b.text.length){return-1;}
else{return 0;}});}
return results;}})); PORTAL.VIEWS.inputValidation({inputEl:$('#siteid'),validationFnc:PORTAL.validators.siteIdValidator});PORTAL.VIEWS.inputValidation({inputEl:$('#startDateLo'),validationFnc:PORTAL.dateValidator.validate,updateFnc:function(value){return PORTAL.dateValidator.format(value,true);}});PORTAL.VIEWS.inputValidation({inputEl:$('#startDateHi'),validationFnc:PORTAL.dateValidator.validate,updateFnc:function(value){return PORTAL.dateValidator.format(value,false);}});PORTAL.VIEWS.inputValidation({inputEl:$('#bounding-box input[type="text"]'),validationFnc:PORTAL.validators.realNumberValidator});PORTAL.VIEWS.inputValidation({inputEl:$('#point-location input[type="text"]'),validationFnc:PORTAL.validators.realNumberValidator});PORTAL.VIEWS.inputValidation({inputEl:$('#huc'),validationFnc:PORTAL.hucValidator.validate,updateFnc:PORTAL.hucValidator.format});$('html').click(function(e){$('.popover-help').popover('hide');});$('.popover-help').each(function(){var options=$.extend({},PORTAL.MODELS.help[($(this).data('help'))],{html:true,trigger:'manual'});$(this).popover(options).click(function(e){$(this).popover('toggle');e.stopPropagation();});}); $('.panel-heading .show-hide-toggle').click(function(){toggleShowHideSections($(this),$(this).parents('.panel').find('.panel-body'));});$('.subpanel-heading .show-hide-toggle').click(function(){toggleShowHideSections($(this),$(this).parents('.subpanel').find('.subpanel-body'));});

var mapBox=$('#query-map-box');var mapDiv=$('#query-results-map');mapDiv.height(mapBox.height());$(window).resize(function(){if(mapBox.height()!==mapDiv.height()){mapDiv.height(mapBox.height());}}); $('#show-on-map-button').click(function(){if(!PORTAL.CONTROLLERS.validateDownloadForm()){return;}
_gaq.push(['_trackEvent','Portal Map','MapCount',decodeURIComponent(APP.URLS.getQueryParams())]);PORTAL.downloadProgressDialog.show('map',function(count){ if($('#query-map-box').is(':hidden')){$('#mapping-div .show-hide-toggle').click();}
_gaq.push(['_trackEvent','Portal Map','MapCreate',decodeURIComponent(APP.URLS.getQueryParams()),parseInt(count)]); $('#show-on-map-button').attr('disabled','disabled').removeClass('query-button').addClass('disable-query-button');var formParams=getFormValues($('#params'),['north','south','east','west','resultType','source','mimeType','zip','__ncforminfo']);PORTAL.portalDataMap.showDataLayer(formParams,function(){$('#show-on-map-button').removeAttr('disabled').removeClass('disable-query-button').addClass('query-button');});});
setTimeout(function(){APP.DOWNLOAD.beforeSubmit(APP.DOM.form,'Station');},500);}); $('#main-button').click(function(event){if(!PORTAL.CONTROLLERS.validateDownloadForm()){return;}
event.preventDefault();_gaq.push(['_trackEvent','Portal Page',APP.DOM.getResultType()+'Count',decodeURIComponent(APP.URLS.getQueryParams())]);PORTAL.downloadProgressDialog.show('download',function(count){_gaq.push(['_trackEvent','Portal Page',APP.DOM.getResultType()+'Download',decodeURIComponent(APP.URLS.getQueryParams()),parseInt(count)]);$('#params').submit();});
setTimeout(function(){APP.DOWNLOAD.beforeSubmit(APP.DOM.form,$(APP.DOM.form).find('input[name=resultType]').val());},500);}); function updateMyLocation(){if(navigator.geolocation&&navigator.geolocation.getCurrentPosition){navigator.geolocation.getCurrentPosition(updateFormLocation,displayError,{timeout:8000,maximumAge:60000});}else{alert("Sorry! your browser does not support geolocation.");}
return false;}
function updateFormLocation(position){$('#lat').val(position.coords.latitude);$('#long').val(position.coords.longitude);}
function displayError(error){var errorTypes={0:"Unknown error",1:"Permission denied by user",2:"Position is not available",3:"Request timed out"};var errorMessage=errorTypes[error.code];if(error.code==0||error.code==2){errorMessage=errorMessage+" "+error.message;}
alert(errorMessage);} 
if(navigator.geolocation&&navigator.geolocation.getCurrentPosition){$('#useMyLocation').html('<button class="btn btn-info" type="button">Use my location</button>');$('#useMyLocation button').click(function(){updateMyLocation();});} 
$('#download-box input[name="mimeType"]:radio').click(function(){var sensitive=!($('#download-box #kml').prop('checked'));setEnabled($('#download-box #samples'),sensitive);setEnabled($('#download-box #biosamples'),sensitive);$('#params input[name="mimeType"]:hidden').val($(this).val());}); $('#download-box input[name=resultType]').click(function(){var sensitive=!($('#download-box #samples').prop('checked'))&&!($('#download-box #biosamples').prop('checked'));setEnabled($('#download-box #kml'),sensitive);$('#params').attr('action',APP.URLS.getFormUrl($(this).val()));$('#params input[name="resultType"]:hidden').val($(this).val());}); $('#bounding-box input').change(function(){$(APP.DOM.form).find('input[name=bBox]').val(APP.DOM.getBBox());}); $('#show-queries-button').click(function(){
var stationSection="<div class=\"show-query-text\"><b>Sites</b><br><textarea readonly=\"readonly\" rows='6'>"+APP.URLS.getFormUrl('Station')+"</textarea></div>";var resultSection="<div class=\"show-query-text\"><b>Physical/Chemical results</b><br><textarea readonly=\"readonly\" rows='6'>"+APP.URLS.getFormUrl('Result')+"</textarea></div>";var biologicalResultSection="<div class=\"show-query-text\"><b>Biological results</b><br><textarea readonly=\"readonly\" rows='6'>"+APP.URLS.getFormUrl('biologicalresult')+"</textarea></div>";$('#WSFeedback').html(stationSection+resultSection);}); var identifyDialog=new IdentifyDialog('map-info-dialog',APP.URLS.getFormUrl); $('#mapping-div .show-hide-toggle').click(function(){var isVisible=toggleShowHideSections($(this),$('#query-map-box'));var boxIdToggleEl=$('#map-identify-tool');if(isVisible){setEnabled(boxIdToggleEl,true);if(!PORTAL.portalDataMap){PORTAL.portalDataMap=new PortalDataMap('query-results-map','map-loading-div',identifyDialog);$('#cancel-map-button').click(function(){PORTAL.portalDataMap.cancelMapping();});}}
else{setEnabled(boxIdToggleEl,false);}}); $('#map-identify-tool').click(function(){PORTAL.portalDataMap.toggleBoxId();});};var PORTAL=PORTAL||{};PORTAL.MODELS=PORTAL.MODELS||{};PORTAL.MODELS.providers=function(){var ids=[];return{initialize:function(successFnc ,failureFnc ){$.ajax({url:Config.CODES_ENDPOINT+'/providers',data:{mimetype:'xml'},type:'GET',success:function(data,textStatus,jqXHR){ids=[];$(data).find('provider').each(function(){ids.push($(this).text());});successFnc(ids);},error:function(jqXHR,textStatus,error){ids=[];failureFnc(error);}});},getIds:function(){return ids;},formatAvailableProviders:function(availableProviders ){var availableList=availableProviders.split(' ');var resultList=[];var i;for(i=0;i<ids.length;i++){if($.inArray(ids[i],availableList)!==-1){resultList.push(ids[i]);}}
if(resultList.length===0){return null;}
else if(resultList.length===ids.length){return'all';}
else{return resultList.join(', ');}}};}();var PORTAL=PORTAL||{};PORTAL.MODELS=PORTAL.MODELS||{};PORTAL.MODELS.codes=function(spec){var that={};var cachedData=[];var ajaxCalled=false;var ajaxCompleteDeferred=$.Deferred();that.processData=function(processFnc ){if(ajaxCalled){ajaxCompleteDeferred.done(processFnc);}
else{ajaxCalled=true;$.ajax({url:Config.CODES_ENDPOINT+'/'+spec.codes,type:'GET',data:{mimeType:'xml'},success:function(data,textStatus,jqXHR){$(data).find('Code').each(function(){cachedData.push({id:$(this).attr('value'),desc:$(this).attr('desc')||$(this).attr('value'),providers:$(this).attr('providers')});});processFnc(cachedData);ajaxCompleteDeferred.resolve(cachedData);},error:function(jqXHR,textStatus,error){alert('Can\'t  get '+spec.codes+', Server error: '+error);ajaxCalled=false;}});}};return that;};PORTAL.MODELS.codesWithKeys=function(spec){var that={};var cachedData={};var getData=function(keys ){var results={};var i=0;for(i=0;i<keys.length;i++){results[keys[i]]=cachedData[keys[i]];}
return results;};that.processData=function(processFnc ,keys ){var keysToGet=[];var i;var ajaxData={}; for(i=0;i<keys.length;i++){if(!(keys[i]in cachedData)){keysToGet.push(keys[i]);}}
if(keysToGet.length===0){ processFnc(getData(keys));}
else{ajaxData[spec.keyParameter]=keysToGet.join(';');ajaxData.mimeType='xml';$.ajax({url:Config.CODES_ENDPOINT+'/'+spec.codes,type:'GET',data:ajaxData,success:function(data,textStatus,jqXHR){var k;for(k=0;k<keysToGet.length;k++){cachedData[keysToGet[k]]=[];}
$(data).find('Code').each(function(){var thisData={id:$(this).attr('value'),desc:$(this).attr('desc')||$(this).attr('value'),providers:$(this).attr('providers')};var key=spec.parseKey(thisData.id);cachedData[key].push(thisData);});processFnc(getData(keys));},error:function(jqXHR,textStatus,error){alert("Can't get "+spec.codes+', Server error: '+error);}});}};return that;};PORTAL.MODELS.countryCodes=PORTAL.MODELS.codes({codes:'countrycode'});PORTAL.MODELS.stateCodes=PORTAL.MODELS.codesWithKeys({codes:'statecode',keyParameter:'countrycode',parseKey:function(id){return id.split(':')[0];}});PORTAL.MODELS.countyCodes=PORTAL.MODELS.codesWithKeys({codes:'countycode',keyParameter:'statecode',parseKey:function(id){var idArray=id.split(':');return idArray[0]+':'+idArray[1];}});PORTAL.MODELS.siteType=PORTAL.MODELS.codes({codes:'sitetype'});PORTAL.MODELS.organization=PORTAL.MODELS.codes({codes:'organization'});PORTAL.MODELS.sampleMedia=PORTAL.MODELS.codes({codes:'samplemedia'});PORTAL.MODELS.characteristicType=PORTAL.MODELS.codes({codes:'characteristictype'});PORTAL.MODELS.characteristicName=PORTAL.MODELS.codes({codes:'characteristicname'});var DataSourceUtils={getCountsFromHeader:function(headers ,dataSources ){function formatCount(key){
var countHeader=headers.get(key);if(countHeader.length>0&&countHeader[0].value!=='0'){return $.formatNumber(countHeader[0].value,{format:'#,###',locale:'us'});}
else{return'0';}}
var result={};for(var i=0;i<dataSources.length;i++){var id=dataSources[i];result[id]={sites:formatCount(id+'-Site-Count'),results:formatCount(id+'-Result-Count')};}
result.total={sites:formatCount('Total-Site-Count'),results:formatCount('Total-Result-Count')};return result;}};var PORTAL=PORTAL||{};PORTAL.VIEWS=PORTAL.VIEWS||{};PORTAL.VIEWS.placeSelects=function(countryEl,stateEl,countyEl){var that={};that.getCountries=function(){var results=countryEl.select2('val');if(results.length===0){return['US'];}
else{return results;}};that.getStates=function(){return stateEl.select2('val');};that.getCounties=function(){return countyEl.select2('val');};that.isCountryMatch=function(data,searchTerm){if(searchTerm){var search=searchTerm.toUpperCase();return((data.id.toUpperCase().indexOf(search)>-1)||(data.desc.toUpperCase().indexOf(search)>-1));}
else{return true;}};that.isStateMatch=function(data,searchTerm){if(searchTerm){var search=searchTerm.toUpperCase();var codes=data.id.split(':');var stateDesc=data.desc.split(',');var stateName=stateDesc[stateDesc.length-1].toUpperCase();return((codes[0]==='US')&&(stateFIPS.getPostalCode(codes[1]).indexOf(search)>-1)||(stateName.indexOf(search)>-1));}
else{return true;}};that.isCountyMatch=function(data,searchTerm){if(searchTerm){var codes=data.desc.split(',');return(codes[codes.length-1].toUpperCase().indexOf(searchTerm.toUpperCase())>-1);}
else{return true;}};var countrySpec={model:PORTAL.MODELS.countryCodes,isMatch:that.isCountryMatch};PORTAL.VIEWS.createCodeSelect(countryEl,countrySpec,{});countryEl.on('change',function(e){var states=stateEl.select2('data');var newStates=[];for(var i=0;i<states.length;i++){var keep=false;for(var j=0;j<e.val.length;j++){if(states[i].id.split(':')[0]===e.val[j]){keep=true;break;}}
if(keep){newStates.push(states[i]);}}
stateEl.select2('data',newStates,true);});var stateSpec={model:PORTAL.MODELS.stateCodes,isMatch:that.isStateMatch,getKeys:that.getCountries};PORTAL.VIEWS.createCodeSelect(stateEl,stateSpec,{formatSelection:function(object,container){var codes=object.id.split(':');if(codes[0]==='US'){return codes[0]+':'+stateFIPS.getPostalCode(codes[1]);}
else{return object.id;}}});stateEl.on('change',function(e){var counties=countyEl.select2('data');var newCounties=[];for(var i=0;i<counties.length;i++){var codes=counties[i].id.split(':');var stateCode=codes[0]+':'+codes[1];var keep=false;for(var j=0;j<e.val.length;j++){if(stateCode===e.val[j]){keep=true;break;}}
if(keep){newCounties.push(counties[i]);}}
countyEl.select2('data',newCounties,true);});var countySpec={model:PORTAL.MODELS.countyCodes,isMatch:that.isCountyMatch,getKeys:that.getStates};PORTAL.VIEWS.createCodeSelect(countyEl,countySpec,{formatSelection:function(object,container){var codes=object.id.split(':');if(codes[0]==='US'){return codes[0]+':'+stateFIPS.getPostalCode(codes[1])+':'+codes[2];}
else{return object.id;}}});countyEl.on('select2-opening',function(e){if(that.getStates().length===0){alert('Please select at least one state');e.preventDefault();}});return that;};var PORTAL=PORTAL||{};PORTAL.MODELS=PORTAL.MODELS||{};
PORTAL.MODELS.help={country:{placement:'auto',title:'Country Help',content:'\
        <div>Countries represented in the database can be selected from the drop down list. \
        The available data sources are listed in parenthesis for each country. Multiple countries\
        may be selected. \
        </div>'},state:{placement:'auto',title:'State Help',content:'\
        <div>States or provinces for the selected countries can be selected from the drop down list. \
        If the countries select is clear, then US states are available. Selections are shown as XX:YY where \
        XX is the country code and YY is the FIPS code with the exception that postal code is shown for US states. \n\
        The available data sources are listed in parenthesis for each state. Multiple states may be selected. \
        </div>'},county:{placement:'auto',title:'County Help',content:'\
        <div>Counties for the selected states can be selected from the drop down list. \
        Selections are shown as XX:YY:ZZZ where XX is the country code, YY is the FIPS or postal code and \
        ZZZ is the county postal code. The available data sources are listed in parenthesis for each county. \
        Multiple counties may be selected.\
        </div>'},pointLocation:{placement:'auto',title:'Point Location Help',content:'\
                <div>Enter a latitude and longitude and a radial distance \
                        to create a search area. Distance should be entered in \
                        miles. Latitude and longitude should be entered in \
                        decimal degrees relative to the NAD83 datum. Longitudes \
                        in the western hemisphere should be preceded with a \
                        negative sign ("-"). Many stations outside the continental US do not have latitude and longitude referenced to WGS84 \
                        and therefore cannot be found using these parameters.\
                </div>\
                <br />\
                <div>\
                        <b>Example:</b>\
                        <br/>\
                        20 miles from Latitude 46.12 degrees N, Longitude 89.15 degrees W would be entered as:\
                        <ul>\
                                <li>Distance: 20</li>\
                                <li>Latitude: 46.12</li>\
                                <li>Longitude: -89.15</li>\
                        </ul>\
                </div>'},boundingBox:{placement:'auto',title:'Bounding Box Help',content:'\
                <div>Enter the North and South latitudes and the East and \
                West longitudes to create a bounding box. Latitude \
                and Longitude should be entered in decimal degrees \
                relative to the NAD83 datum. Longitudes in the \
                western hemisphere should be preceded with a negative sign ("-").\
                </div>\
                <br />\
                <div>\
                <b>Example:</b>\
                <ul>\
                        <li>North: 46.12</li>\
                        <li>East: -89.15</li>\
                        <li>South: 45.93</li>\
                        <li>West: -89.68</li>\
                </ul>\
                </div>'},siteType:{placement:'auto',title:'Site Type Help',content:'\
        <div>\
        A site type is a generalized location in the hydrologic cycle, or a man-made \
        feature thought to affect the hydrologic conditions measured at a site. Site types can be selected \
        from the drop down list. The available data sources are listed in parenthesis for each \
        site type. Multiple site types may be selected.\
        </div>'},organization:{placement:'auto',title:'Organization Help',content:'\
            <div>\
            A designator used to identify a unique business establishment within a context. \
            Select from a list of organization IDs represented in the source databases.\
            Multiple IDs may be selected.\
            </div>'},siteID:{placement:'auto',title:'Site ID Help',content:'\
                <div> \
                A site id is a designator used to describe the unique name, number, or code assigned to identify the monitoring\
                location.  Site IDs are case-sensitive and should be entered in the following format: AGENCY-STATION NUMBER.  More\
                than one site ID may be entered, separated by semicolons.  If you are entering an NWIS site, use "USGS" as the AGENCY.\
                </div>\
                <br />\
                <div>\
                <b>Examples:</b>\
                <ul>\
                        <li><i>For NWIS site:</i> USGS-301650084300701</li>\
                        <li><i>For STORET site:</i> R10BUNKER-CUA005-5</li>\
                        <li><i>For multiple sites:</i><br/> IN002-413354086221001;USSCS-311257091521312;USEPA-414007085591501</li>\
                </ul>\
        </div>\
        <p>For further information about NWIS versus STORET site ids, go to the <a href="faqs.jsp#WQPFAQs-SiteIDs" target="FAQWin">FAQs</a> page</p>'},huc:{placement:'auto',title:'HUC Help',content:'\
                <div>A HUC is a federal code used to identify the hydrologic unit of the monitoring location to the cataloging unit\
                level of precision.  Full hydrologic unit codes (HUCs) or partial HUCs using trailing wildcards may be entered.  Only\
                trailing wildcards are accepted.  More than one HUC may be entered, separated by semicolons.\
                The <A href="http://water.usgs.gov/GIS/huc.html" target="_blank">lists and maps of hydrologic units</A>\
                are available from the USGS.</div>\
                <br />\
                <div>\
                <b>Examples:</b>\
                <ul>\
                        <li>01010003;01010004</li>\
                        <li>010801*</li>\
                        <li>01010003;010801*;01010005</li>\
                </ul>\
                </div>'},sampleMedia:{placement:'auto',title:'Sample Media Help',content:'\
        <div>A sample media indicates the environmental medium where a sample was taken. \
        Sample media can be selected \
        from the drop down list. The available data sources are listed in parenthesis for each \
        sample media. Multiple sample media may be selected.\
        </div>'},characteristicGroup:{placement:'auto',title:'Characteristic Group Help',content:'\
        <div>A characteristic group can be selected \
        from the drop down list. The available data sources are listed in parenthesis for each \
        characteristic group. Multiple characteristic groups may be selected.\
        </div>'},characteristicName:{placement:'auto',title:'Characteristics Help',content:'\
        <div>A characteristic identifies different types of environmental measurements. \
        The names are derived from the USEPA \
        <a href="http://iaspub.epa.gov/sor_internet/registry/substreg/home/overview/home.do" target="_blank">Substance Registry System (SRS)</a>. \
        The available data \
        sources are listed in parenthesis for each characteristic. Multiple characteristics may \
        be selected. </div>'},pcode:{placement:'auto',title:'Parameter Code Help',content:'\
                <div>A Parameter Code is a 5-digit number used in NWIS to uniquely identify a specific characteristic.  \
                One or more five-digit USGS parameter codes can be requested, separated by semicolons. For more information on NWIS \n\
                pcodes see <a target="_blank" href="http://nwis.waterdata.usgs.gov/usa/nwis/pmcodes">http://nwis.waterdata.usgs.gov/usa/nwis/pmcodes</a></div>\
                <br>\
                <div class="instructions"><b>Please Note:</b> Specifying a Parameter Code will limit the query to NWIS only.</div>\
                <br />\
                <div>\
                <b>Examples:</b>\
                <ul>\
                        <li>00065</li>\
                        <li>00065;00010</li>\
                </ul>\
                </div>'},xmlSchema:{placement:'auto',title:'WQX-Outbound Schema Info',content:'\
                <div>The Water Quality Portal (WQP) \
                        Web Services conform to the format defined in the below referenced XML schema.\
                </div> \
                <br />\
                <div>\
                <b>WQX-Outbound XML schema information:</b>\
                <ul>\
                        <li><a href="schemas/WQX-Outbound/2_0/index.xsd" target="_blank">WQX-Outbound XML schema</a></li>\
                        <li><a href="schemas/WQX-Outbound/2_0/docs/index.html" target="_blank">WQX-Outbound XML schema documentation</a></li>\
                </ul>\
                </div>'}};var stateFIPS={fipsMap:{'01':{name:'Alabama',postalCode:'AL'},'02':{name:'Alaska',postalCode:'AK'},'04':{name:'Arizona',postalCode:'AZ'},'05':{name:'Arkansas',postalCode:'AR'},'06':{name:'California',postalCode:'CA'},'08':{name:'Colorado',postalCode:'CO'},'09':{name:'Connecticut',postalCode:'CT'},'10':{name:'Delaware',postalCode:'DE'},'11':{name:'District of Columbia',postalCode:'DC'},'12':{name:'Florida',postalCode:'FL'},'13':{name:'Georgia',postalCode:'GA'},'15':{name:'Hawaii',postalCode:'HI'},'16':{name:'Idaho',postalCode:'ID'},'17':{name:'Illinois',postalCode:'IL'},'18':{name:'Indiana',postalCode:'IN'},'19':{name:'Iowa',postalCode:'IA'},'20':{name:'Kansas',postalCode:'KS'},'21':{name:'Kentucky',postalCode:'KY'},'22':{name:'Louisiana',postalCode:'LA'},'23':{name:'Maine',postalCode:'ME'},'24':{name:'Maryland',postalCode:'MD'},'25':{name:'Massachusetts',postalCode:'MA'},'26':{name:'Michigan',postalCode:'MI'},'27':{name:'Minnesota',postalCode:'MN'},'28':{name:'Mississippi',postalCode:'MS'},'29':{name:'Missouri',postalCode:'MO'},'30':{name:'Montana',postalCode:'MT'},'31':{name:'Nebraska',postalCode:'NE'},'32':{name:'Nevada',postalCode:'NV'},'33':{name:'New Hampshire',postalCode:'NH'},'34':{name:'New Jersey',postalCode:'NJ'},'35':{name:'New Mexico',postalCode:'NM'},'36':{name:'New York',postalCode:'NY'},'37':{name:'North Carolina',postalCode:'NC'},'38':{name:'North Dakota',postalCode:'ND'},'39':{name:'Ohio',postalCode:'OH'},'40':{name:'Oklahoma',postalCode:'OK'},'41':{name:'Oregon',postalCode:'OR'},'42':{name:'Pennsylvania',postalCode:'PA'},'44':{name:'Rhode Island',postalCode:'RI'},'45':{name:'South Carolina',postalCode:'SC'},'46':{name:'South Dakota',postalCode:'SD'},'47':{name:'Tennessee',postalCode:'TN'},'48':{name:'Texas',postalCode:'TX'},'49':{name:'Utah',postalCode:'UT'},'50':{name:'Vermont',postalCode:'VT'},'51':{name:'Virginia',postalCode:'VA'},'53':{name:'Washington',postalCode:'WA'},'54':{name:'West Virginia',postalCode:'WV'},'55':{name:'Wisconsin',postalCode:'WI'},'56':{name:'Wyoming',postalCode:'WY'},'60':{name:'American Samoa',postalCode:'AS'},'64':{name:'Federated States of Micronesia',postalCode:'FM'},'66':{name:'Guam',postalCode:'GU'},'68':{name:'Marshall Islands',postalCode:'MH'},'69':{name:'Northern Mariana Islands',postalCode:'MP'},'70':{name:'Palau',postalCode:'PW'},'72':{name:'Puerto Rico',postalCode:'PR'},'74':{name:'U.S. Minor Outlying Islands',postalCode:'UM'},'78':{name:'Virgin Islands of the U.S.',postalCode:'VI'}},getPostalCode:function(fips ){if(stateFIPS.fipsMap[fips]){return stateFIPS.fipsMap[fips].postalCode;}
else{return'';}},getName:function(fips ){if(stateFIPS.fipsMap[fips]){return stateFIPS.fipsMap[fips].name;}
else{return'';}},getFromPostalCode:function(postalCode ){for(var fips in stateFIPS.fipsMap){if(stateFIPS.fipsMap[fips].postalCode===postalCode){return fips;}}
return'';}};var PORTAL=PORTAL||{};PORTAL.dateValidator=function(){var DELIM='-';var sepRegExp=new RegExp('/','g');var INVALID={isValid:false,errorMessage:'Dates should be entered as mm-dd-yyyy, mm-yyyy, or yyyy'};var VALID={isValid:true};var that={};that.validate=function(value){

var dateValues;var i;if(value){dateValues=value.replace(sepRegExp,'-').split('-');if(dateValues.length>3){return INVALID;}
else
 
for(i=0;i<dateValues.length;i++){if(!dateValues[i]||isNaN(dateValues[i])){return INVALID;}}
if(dateValues.length===3){if(dateValues[0].length<3&&dateValues[1].length<3&&dateValues[2].length===4){return VALID;}}
else if(dateValues.length===2){if(dateValues[0].length<3&&dateValues[1].length===4){return VALID;}}
else{if(dateValues[0].length===4){return VALID;}}
return INVALID;}
else{return VALID;}};that.format=function(value,isLow){
var getZeroFilled=function(n,width){
var result=n;var i;if(n.length<width){for(i=0;i<width-n.length;i++){result='0'+result;}}
return result;};var month,day,year;var dateValues;if(value){dateValues=value.replace(sepRegExp,'-').split('-');if(dateValues.length===3){month=getZeroFilled(dateValues[0],2);day=getZeroFilled(dateValues[1],2);year=dateValues[2];}
else if(dateValues.length===2){ month=getZeroFilled(dateValues[0],2);year=dateValues[1];if(isLow){day='01';}
else{ day=(new Date(year,month,0)).getDate();}}
else if(dateValues.length===1){year=dateValues[0];if(isLow){day='01';month='01';}
else{day='31';month='12';}}
return month+DELIM+day+DELIM+year;}
else{return'';}};return that;}();var PORTAL=PORTAL||{};PORTAL.VIEWS=PORTAL.VIEWS||{};PORTAL.VIEWS.downloadProgressDialog=function(el){var that={}; var DIALOG={map:{title:'Map Sites Status',continueMessage:'map the sites',cancelDownload:function(sitesCount){var intSiteCount=parseInt(sitesCount.split(',').join(''));return(intSiteCount>250000);},cancelMessage:'Your query is returning more than 250,000 sites and can not be mapped.'},download:{title:'Download Status',continueMessage:'download the data',cancelDownload:function(counts,fileFormat){return(fileFormat==='xlsx')&&(parseInt(counts.split(',').join(''))>1048575);},cancelMessage:'Your query is returning more than 1,048,575 results which exceeds Excel\'s limit.'}};var continueFnc;var opKind;var buttonHtml=function(id,label){return'<button id="'+id+'" type="button" class="btn btn-default">'+label+'</button>';};that.show=function(thisOpKind,thisContinueFnc){continueFnc=thisContinueFnc;opKind=thisOpKind;el.find('.modal-body').html('Validating query ... Please wait.');el.find('.modal-header h4').html(DIALOG[opKind].title);el.modal('show');};that.hide=function(){el.modal('hide');};that.updateProgress=function(options){if('totalCounts'in options){if(DIALOG[opKind].cancelDownload(options.totalCounts,options.fileFormat)){el.find('.modal-body').html(options.message+DIALOG[opKind].cancelMessage);el.find('.modal-footer').html(buttonHtml('progress-ok-btn','Ok'));$('#progress-ok-btn').click(function(){el.modal('hide');});}
else{el.find('.modal-body').html(options.message+'<p>Click Continue to '+DIALOG[opKind].continueMessage);el.find('.modal-footer').html(buttonHtml('progress-cancel-btn','Cancel')+
buttonHtml('progress-continue-btn','Continue'));$('#progress-cancel-btn').click(function(){el.modal('hide');});$('#progress-continue-btn').click(function(){el.modal('hide');continueFnc(options.totalCounts);});}}
else{el.find('.modal-body').html('Request canceled: <br>'+options.message);el.find('.modal-footer').html(buttonHtml('progress-ok-btn','Ok'));$('#progress-ok-btn').click(function(){el.modal('hide');});}};return that;}
var PORTAL=PORTAL||{};PORTAL.CONTROLLER=PORTAL.CONTROLLER||{};PORTAL.CONTROLLER.retrieveSiteIdInfo=function(siteIds,updateFnc,successFnc){if(!successFnc){successFnc=function(){return;};}
if(siteIds.length>0){var idsToGet=siteIds.slice(0,Math.min(siteIds.length,50));updateFnc('Retrieving site ID data');$.ajax({url:Config.QUERY_URLS.Station,type:'GET',data:'siteid='+encodeURIComponent(idsToGet.join(';')),success:function(data,textStatus,jqXHR){var detailHtml='';var orgEls=$(data).find('Organization');if(siteIds.length>50){detailHtml+='Retrieved '+siteIds.length+' sites, only showing 50<br />';}
orgEls.each(function(){var orgId=$(this).find('OrganizationIdentifier').text();var orgName=$(this).find('OrganizationFormalName').text();$(this).find('MonitoringLocation').each(function(){detailHtml+='<br />';detailHtml+='<table>';detailHtml+='<tr><th>Station ID: </th><td class="details-site-id">'+$(this).find('MonitoringLocationIdentifier').text()+'</td></tr>';detailHtml+='<tr><th>Name: </th><td>'+$(this).find('MonitoringLocationName').text()+'</td></tr>';detailHtml+='<tr><th>Type: </th><td>'+$(this).find('MonitoringLocationTypeName').text()+'</td></tr>';detailHtml+='<tr><th>HUC 8: </th><td>'+$(this).find('HUCEightDigitCode').text()+'</td></tr>';detailHtml+='<tr><th>Org ID: </th><td>'+orgId+'</td></tr>';detailHtml+='<tr><th>Org Name: </th><td>'+orgName+'</td></tr>';detailHtml+='</table>';});});updateFnc(detailHtml);successFnc();},error:function(jqXHR,textStatus,error){updateFnc('Unable to retrieve site information');}});}
else{updateFnc('No sites at selection point');}};var PORTAL=PORTAL||{};PORTAL.VIEWS=PORTAL.VIEWS||{};




PORTAL.VIEWS.inputValidation=function(spec){spec.inputEl.change(function(){var inputValue=$(this).val();var result=spec.validationFnc(inputValue);var parent=$(this).parent();parent.find('.error-message').remove();if(result.isValid){parent.removeClass('alert alert-danger');if(spec.updateFnc){$(this).val(spec.updateFnc(inputValue));}}
else{parent.addClass('alert alert-danger');parent.append('<div class="error-message">'+result.errorMessage+'</div>');}});};var PORTAL=PORTAL||{};PORTAL.validators=function(){var that={};that.siteIdValidator=function(value){var dashIndex;if(value){dashIndex=value.indexOf('-');if(dashIndex===-1||dashIndex===0||dashIndex===value.length-1){return{isValid:false,errorMessage:'Format is AGENCY-STATION. NWIS sites should use "USGS" as the AGENCY.'};}
else{return{isValid:true};}}
else{return{isValid:true};}};that.realNumberValidator=function(value){if(value){if(isNaN(value)){return{isValid:false,errorMessage:'Enter a floating point number.'};}
else{return{isValid:true};}}
else{return{isValid:true};}};return that;}();var PORTAL=PORTAL||{};PORTAL.CONTROLLERS=PORTAL.CONTROLLERS||{};PORTAL.CONTROLLERS.validatePointLocation=function(spec){


 var within=spec.withinEl.val();var lat=spec.latEl.val();var lon=spec.lonEl.val();if((within)&&(lat)&&(lon)){return{isValid:true};}
else if((within)||(lat)||(lon)){return{isValid:false,errorMessage:'In Point Location all parameters must be blank or all parameters must have a non-blank value'};}
else{return{isValid:true};}};PORTAL.CONTROLLERS.validateBoundingBox=function(spec){


 var north=spec.northEl.val();var south=spec.southEl.val();var east=spec.eastEl.val();var west=spec.westEl.val();if((north)&&(south)&&(east)&&(west)){if(parseFloat(south)>=parseFloat(north)){return{isValid:false,errorMessage:'In Bounding Box, north must be greater than south'};}
else if(parseFloat(west)>=parseFloat(east)){return{isValid:false,errorMessage:'In Bounding Box, east must be greater than west'};}
else{return{isValid:true};}}
else if((north)||(south)||(east)||(west)){return{isValid:false,errorMessage:'In Bounding Box, all parameters must be blank or all must have a non-blank value.'};}
else{return{isValid:true};}};PORTAL.CONTROLLERS.validateDateRange=function(spec){

var getDate=function(value){dateArray=value.split('-');return new Date(dateArray[2],dateArray[0]-1,dateArray[1],0,0,0,0);};var fromDateStr=spec.fromDateEl.val();var toDateStr=spec.toDateEl.val();if((fromDateStr)&&(toDateStr)){if(getDate(fromDateStr)<getDate(toDateStr)){return{isValid:true};}
else{return{isValid:false,errorMessage:'From date must be before to date'};}}
else{return{isValid:true};}};PORTAL.CONTROLLERS.validateDownloadForm=function(){ var validateModalEl=$('#validate-download-dialog');var showModal=function(message){validateModalEl.find('.modal-body').html(message);validateModalEl.modal('show');}; if($('#params .error-message').length>0){showModal('Need to correct input validation errors on form');return false;}
var result;result=PORTAL.CONTROLLERS.validatePointLocation({withinEl:$('#within'),latEl:$('#lat'),lonEl:$('#long')});if(!result.isValid){showModal(result.errorMessage);return false;}
result=PORTAL.CONTROLLERS.validateBoundingBox({northEl:$('#north'),southEl:$('#south'),eastEl:$('#east'),westEl:$('#west')});if(!result.isValid){showModal(result.errorMessage);return false;}
result=PORTAL.CONTROLLERS.validateDateRange({fromDateEl:$('#startDateLo'),toDateEl:$('#startDateHi')});if(!result.isValid){showModal(result.errorMessage);return false;}
return true;};var PORTAL=PORTAL||{};PORTAL.hucValidator=function(){var INVALID={isValid:false,errorMessage:'HUCs should be entered as semi-colon separated numbers with 2, 4, 6 or 8 digits with optional \'*\' wildcard'};var VALID={isValid:true};var starReg=/\*$/g;var that={};that.validate=function(value){

var i;var thisHuc;var hucArray=value.split(';');for(i=0;i<hucArray.length;i++){if(hucArray[i]){if(hucArray[i].length>8){return INVALID;}
thisHuc=hucArray[i].replace(starReg,'');if(isNaN(thisHuc)){return INVALID;}
if(thisHuc.length!==2&&thisHuc.length!==4&&thisHuc.length!==6&&thisHuc.length!==8){return INVALID;}}}
return VALID;};that.format=function(value){ var i;var resultArray=[];var hucArray=value.split(';');for(i=0;i<hucArray.length;i++){if(hucArray[i]){if(hucArray[i].search(starReg)===-1&&hucArray[i].length<8){resultArray.push(hucArray[i]+'*');}
else{resultArray.push(hucArray[i]);}}}
return resultArray.join(';');};return that;}();