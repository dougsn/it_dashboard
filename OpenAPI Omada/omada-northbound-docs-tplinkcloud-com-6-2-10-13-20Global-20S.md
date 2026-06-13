## Omada Open API

### Description

Omada Open API

### Author

### Version

v0.1

### Host

https://127.0.0.1:8043

### basePath

/

### serviceUrl

### GroupName

13 Global Security

### GroupUrl

/v3/api-docs/13 Global Security

### GroupLocation

/v3/api-docs/13 Global Security

### count

POST


7

DELETE


1

GET


3

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#knife4jDocument)
- [Global Security](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#Global%20Security)
  - [Get Global Threat List](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getGlobalThreatList)
  - [Get Global Top Threat List](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getGlobalTopThreatList)
  - [Get Blocked Countries](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getBlockedCountries)
  - [Operate Global Threats](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#operateGlobalThreats)
  - [Delete Global Threat List](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#deleteGlobalThreatList)
  - [Delete blocked countries.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#delBlockedCountry)
  - [Add Blocked Country](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#addBlockedCountry)
  - [Get Threat Count](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getThreatCount)
  - [Get Global Category](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getGlobalCategory)
  - [Get Global Threat Map](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getGlobalThreatMap)
  - [Get Country Threats](https://omada-northbound-docs.tplinkcloud.com/6.2.10/13%20Global%20Security.html#getCountryThreats)

# Global Security

Get Global Threat List


GET/openapi/v1/{omadacId}/security/threat-management

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the global view threat management list

The interface requires one of the permissions:

Global Threat Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| archived | archived | query | true | boolean |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000. | query | true | integer(int32) |  |
| filters.startTime | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| filters.endTime | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| siteList | sites are separated by ','. If no value is passed, all sites are selected by default. | query | false | string |  |
| filters.severity | Threat Severity, such as 0:Critical, 1: Major, 2:Moderate, 3:Minor, 4:Low | query | false | integer(int32) |  |
| sorts.time | Sort parameter may be one of asc or desc. Optional parameter. If it is not carried, it means it is not sorted by this field. When there are more than one, the first one takes effect | query | false | string |  |
| searchKey | Fuzzy query parameters, support field Threat Description/Classification/Classification Description | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGridVOIpsThreatOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GridVOIpsThreatOpenApiVO | GridVOIpsThreatOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalRows": 0,
		"currentPage": 0,
		"currentSize": 0,
		"data": [\
			{\
				"id": "",\
				"omadacId": "",\
				"siteId": "",\
				"siteName": "",\
				"time": 0,\
				"severity": 0,\
				"service": "",\
				"signature": "",\
				"category": 0,\
				"activity": "",\
				"dataUsage": 0,\
				"srcIp": "",\
				"dstIp": "",\
				"srcCountry": "",\
				"dstCountry": "",\
				"protocol": "",\
				"sid": 0,\
				"srcLatitude": 0,\
				"srcLongitude": 0,\
				"dstLatitude": 0,\
				"dstLongitude": 0,\
				"archived": true,\
				"classification": "",\
				"creatTime": 0\
			}\
		]
	}
}
```

Get Global Top Threat List


GET/openapi/v1/{omadacId}/security/threat-management/top

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the number of threats in the global view top5

The interface requires one of the permissions:

Global Threat Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| startTime | Start Time | query | true | integer(int64) |  |
| endTime | End Time | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseTop5ThreatNumOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | Top5ThreatNumOpenApiVO | Top5ThreatNumOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"geo": [\
			{\
				"country": "",\
				"attempts": 0,\
				"source": ""\
			}\
		],
		"classification": [\
			{\
				"classification": "",\
				"attempts": 0\
			}\
		]
	}
}
```

Get Blocked Countries


POST/openapi/v1/{omadacId}/security/blocked-country

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the list of blocked countries

The interface requires one of the permissions:

Global Threat Manager View Only

Example


```
{
  "sites": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteListOpenApiVO | SiteListOpenApiVO | body | true | SiteListOpenApiVO | SiteListOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseBlockedCountryOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | BlockedCountryOpenApiVO | BlockedCountryOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"countries": []
	}
}
```

Operate Global Threats


POST/openapi/v1/{omadacId}/ips/threat/ops

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Perform operations on threats in batches

The interface requires one of the permissions:

Global Threat Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

Example


```
{
  "threatId": [\
    {\
      "time": 0,\
      "id": "",\
      "siteId": ""\
    }\
  ],
  "type": 0,
  "signatureSuppression": {
    "type": 1,
    "direction": 1,
    "trackBy": 0,
    "ip": "192.168.0.1",
    "subnet": "192.168.0.0/24"
  },
  "blockName": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| operateGlobalThreatOpenApiVO | OperateGlobalThreatOpenApiVO | body | true | OperateGlobalThreatOpenApiVO | OperateGlobalThreatOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponse |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | object |  |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Delete Global Threat List


POST/openapi/v1/{omadacId}/ips/threat

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Delete archived threats in batches

The interface requires one of the permissions:

Global Threat Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

Example


```
{
  "threatId": [\
    {\
      "time": 0,\
      "id": "",\
      "siteId": ""\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| deleteGlobalThreatOpenApiVO | DeleteGlobalThreatOpenApiVO | body | true | DeleteGlobalThreatOpenApiVO | DeleteGlobalThreatOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponse |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | object |  |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Delete blocked countries.


DELETE/openapi/v1/{omadacId}/security/blocked-country

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Delete blocked countries.

The interface requires one of the permissions:

Global Threat Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

Example


```
{
  "country": "",
  "sites": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| opsBlockedCountryOpenApiVO | OpsBlockedCountryOpenApiVO | body | true | OpsBlockedCountryOpenApiVO | OpsBlockedCountryOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponse |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | object |  |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Add Blocked Country


POST/openapi/v1/{omadacId}/security/blocked-country/add

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Add blocked countries to list

The interface requires one of the permissions:

Global Threat Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

Example


```
{
  "country": "",
  "sites": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| opsBlockedCountryOpenApiVO | OpsBlockedCountryOpenApiVO | body | true | OpsBlockedCountryOpenApiVO | OpsBlockedCountryOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponse |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | object |  |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Get Threat Count


GET/openapi/v1/{omadacId}/security/threat-management/severity

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the global view of the number of threats by severity level

The interface requires one of the permissions:

Global Threat Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| startTime | Start Time | query | true | integer(int64) |  |
| endTime | End Time | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseThreatSeverityOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | ThreatSeverityOpenApiVO | ThreatSeverityOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"critical": 0,
		"major": 0,
		"moderate": 0,
		"minor": 0,
		"low": 0
	}
}
```

Get Global Category


POST/openapi/v1/{omadacId}/security/threat-map/threat-count

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


The number of threats to attack countries is displayed in categories

The interface requires one of the permissions:

Global Threat Manager View Only

Example


```
{
  "start": 0,
  "end": 0,
  "severity": "",
  "country": "",
  "sites": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| queryThreatMapOpenApiVO | QueryThreatMapOpenApiVO | body | true | QueryThreatMapOpenApiVO | QueryThreatMapOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseThreatMapCategoryOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | ThreatMapCategoryOpenApiVO | ThreatMapCategoryOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"data": [\
			{\
				"country": "",\
				"coords": [],\
				"attempts": []\
			}\
		]
	}
}
```

Get Global Threat Map


POST/openapi/v1/{omadacId}/security/threat-map

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the data for the initial page of the threat map

The interface requires one of the permissions:

Global Threat Manager View Only

Example


```
{
  "start": 0,
  "end": 0,
  "severity": "",
  "country": "",
  "sites": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| queryThreatMapOpenApiVO | QueryThreatMapOpenApiVO | body | true | QueryThreatMapOpenApiVO | QueryThreatMapOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGetThreatMapOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GetThreatMapOpenApiVO | GetThreatMapOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"data": [\
			{\
				"country": "",\
				"coords": [],\
				"attempts": 0\
			}\
		]
	}
}
```

Get Country Threats


POST/openapi/v1/{omadacId}/security/threat-map/threats

produces

\[\
"application/x-www-form-urlencoded",\
"application/json"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get threats from individual countries

The interface requires one of the permissions:

Global Threat Manager View Only

Example


```
{
  "country": "",
  "severity": "",
  "sites": "",
  "currentPage": 0,
  "currentPageSize": 0,
  "searchKey": "",
  "searchField": "",
  "sorts": "",
  "startTime": 0,
  "endTime": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| queryCountryThreatListOpenApiVO | QueryCountryThreatListOpenApiVO | body | true | QueryCountryThreatListOpenApiVO | QueryCountryThreatListOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGridVOIpsThreatOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GridVOIpsThreatOpenApiVO | GridVOIpsThreatOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalRows": 0,
		"currentPage": 0,
		"currentSize": 0,
		"data": [\
			{\
				"id": "",\
				"omadacId": "",\
				"siteId": "",\
				"siteName": "",\
				"time": 0,\
				"severity": 0,\
				"service": "",\
				"signature": "",\
				"category": 0,\
				"activity": "",\
				"dataUsage": 0,\
				"srcIp": "",\
				"dstIp": "",\
				"srcCountry": "",\
				"dstCountry": "",\
				"protocol": "",\
				"sid": 0,\
				"srcLatitude": 0,\
				"srcLongitude": 0,\
				"dstLatitude": 0,\
				"dstLongitude": 0,\
				"archived": true,\
				"classification": "",\
				"creatTime": 0\
			}\
		]
	}
}
```