window._gaq = [];

var Config = {
	CODES_ENDPOINT : 'http:fakecodesservice/codes',
	STATIC_ENDPOINT : 'base/',
	QUERY_URLS: {
		Station: 'http://fakestationservice/Station',
		Result : 'http://fakeresultservice/Result',
		biologicalresult : 'http://fakebiologicalservice',
		Activity : 'http://fakeresultservice/Activity',
		ActivityMetric : 'http://fakeresultservice/ActivityMetric',
		ResultDetectionQuantitationLimit : 'http://fakeresultservice/ResultDetectionQuantitationLimit'
	},
	SITES_GEOSERVER_ENDPOINT: 'http://faketestserver.com/',
	WQP_MAP_GEOSERVER_ENDPOINT : 'http://faketestserver.com/',
	NWIS_SITE_SLD_URL : 'http://fakenwissitesldservice',
	PUBLIC_SRSNAMES_ENDPOINT: 'http://fakeendpoint.com/names',
	NLDI_SERVICES_ENDPOINT: 'http://fakenldi.com/service/',
	SLD_ENDPOINT : 'http://fakesldendpoint/',
	SEARCH_QUERY_ENDPOINT : 'http://fakesearchservice',
	NAWQA_ONLY_PROJECTS : true,
	NLDI_ENABLED : true
};
