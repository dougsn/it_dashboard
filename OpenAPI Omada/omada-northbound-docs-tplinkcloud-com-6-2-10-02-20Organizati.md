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

02 Organization

### GroupUrl

/v3/api-docs/02 Organization

### GroupLocation

/v3/api-docs/02 Organization

### count

GET


13

PUT


2

DELETE


3

POST


7

PATCH


1

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#knife4jDocument)
- [Site](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#Site)
  - [Get site list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getSiteList)
  - [Get site info](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getSiteEntity)
  - [Create new site](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#createNewSite)
  - [Batch create sites by copying from existing site](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#batchSiteCopy)
  - [Batch create sites by importing site backup files from file server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#batchSiteImport)
  - [Create new site from site template](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#createNewSiteByTemplate)
  - [Modify an existing site](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#updateSiteEntity)
  - [Delete an existing site](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#deleteSite)
  - [Get scenario list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getScenarioList)
  - [Create new scenario](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#addScenario)
  - [Delete site scenario](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#deleteScenario)
  - [Get site device account setting](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getSiteDeviceAccountSetting)
  - [Update site device account setting](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#updateSiteDeviceAccountSetting)
  - [Get site tag list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getTags)
  - [Create new site tag](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#addTag)
  - [Modify an existing site tag](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#modifyTag)
  - [Delete an existing site tag](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#deleteTag)
  - [Get scenario list difference](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getScenarioListDifference)
  - [Get sites statistic](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getSiteSummaryStatisticByOpenApi)
  - [Get site url](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getSiteUrlByOpenApi)
  - [Get available site to bind template](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getAvailableSiteToBind)
  - [Get ntp server status](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getNtpServerStatus)
  - [Get template ntp server status](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getNtpServerStatusTemplate)
  - [Obtain the geographic location information of Placed Sites](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getPlacedSitePositions)
  - [Get the details of a site](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getSiteInfoForAbnormal)
  - [Obtain the geographic location information of unplaced Sites](https://omada-northbound-docs.tplinkcloud.com/6.2.10/02%20Organization.html#getUnplacedSitePositions)

# Site

Get site list


GET/openapi/v1/{omadacId}/sites

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site list

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000. | query | true | integer(int32) |  |
| sorts.name | Sort parameter may be one of asc or desc. Optional parameter. If it is not carried, it means it is not sorted by this field. When there are more than one, the first one takes effect | query | false | string |  |
| searchKey | Fuzzy query parameters, support field name | query | false | string |  |
| filters.tag | Filter query parameters, support field tag ID | query | false | string |  |
| filters.type | Filter query parameters, support field site type. 0: basic site; 1: pro site. | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGridVOSiteSummaryInfo |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GridVOSiteSummaryInfo | GridVOSiteSummaryInfo |

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
				"siteId": "",\
				"name": "",\
				"tagIds": [],\
				"region": "",\
				"timeZone": "",\
				"scenario": "",\
				"longitude": 0,\
				"latitude": 0,\
				"address": "",\
				"type": 0,\
				"supportES": true,\
				"supportL2": true,\
				"sitePublicIp": "",\
				"primary": true\
			}\
		]
	}
}
```

Get site info


GET/openapi/v1/{omadacId}/sites/{siteId}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site info

The interface requires one of the permissions:

Global Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSiteEntity |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SiteEntity | SiteEntity |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"siteId": "",
		"name": "",
		"type": 0,
		"tagIds": [],
		"region": "",
		"timeZone": "",
		"ntpEnable": true,
		"ntpServers": [],
		"dst": {
			"enable": true,
			"mode": 0,
			"start": {
				"month": 0,
				"serial": 0,
				"day": 0,
				"hour": 0,
				"minute": 0
			},
			"end": {
				"month": 0,
				"serial": 0,
				"day": 0,
				"hour": 0,
				"minute": 0
			},
			"status": true,
			"startTime": 0,
			"endTime": 0,
			"offset": 0,
			"nextStart": 0,
			"nextEnd": 0,
			"timeZone": "",
			"lastStart": 0,
			"lastEnd": 0
		},
		"scenario": "",
		"longitude": 0,
		"latitude": 0,
		"address": "",
		"supportES": true,
		"supportL2": true
	}
}
```

Create new site


POST/openapi/v1/{omadacId}/sites

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


Create new site

The interface requires one of the permissions:

Global Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33101 - This name already exists. Please enter another name for this site.

-33104 - The number of sites has reached the limit.

Example


```
{
  "name": "",
  "type": 0,
  "region": "",
  "timeZone": "",
  "scenario": "",
  "tagIds": [],
  "longitude": 0,
  "latitude": 0,
  "address": "",
  "deviceAccountSetting": {
    "username": "",
    "password": ""
  },
  "supportES": true,
  "supportL2": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| createSiteEntity | CreateSiteEntity | body | true | CreateSiteEntity | CreateSiteEntity |

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

Batch create sites by copying from existing site


POST/openapi/v1/{omadacId}/sites/copy

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


Batch create sites by copying from existing site

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30304 - Restoring...

-30305 - Failed to restore because of unexpected errors. Please try again later.

Example


```
{
  "sourceSiteId": "",
  "targetSiteNum": 0,
  "siteNamePrefix": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| batchSiteCopyVO | BatchSiteCopyVO | body | true | BatchSiteCopyVO | BatchSiteCopyVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSiteResultVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SiteResultVO | SiteResultVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"successSiteList": []
	}
}
```

Batch create sites by importing site backup files from file server


POST/openapi/v1/{omadacId}/sites/multi-import

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


Batch create sites by importing site backup files from file server.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30304 - Restoring...

-30305 - Failed to restore because of unexpected errors. Please try again later.

Example


```
{
  "fileServerConfig": {
    "protocol": "",
    "hostname": "",
    "port": 0,
    "username": "",
    "password": ""
  },
  "siteImportConfigList": [\
    {\
      "filePath": "",\
      "siteName": "",\
      "skipDevice": true\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| batchSiteImportVO | BatchSiteImportVO | body | true | BatchSiteImportVO | BatchSiteImportVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSiteResultVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SiteResultVO | SiteResultVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"successSiteList": []
	}
}
```

Create new site from site template


POST/openapi/v1/{omadacId}/sites/template

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


Create new site from site template

The interface requires one of the permissions:

Global Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33101 - This name already exists. Please enter another name for this site.

-33104 - The number of sites has reached the limit.

Example


```
{
  "siteTemplateId": "",
  "name": "",
  "region": "",
  "scenario": "",
  "tagIds": [],
  "longitude": 0,
  "latitude": 0,
  "address": "",
  "deviceAccountSetting": {
    "username": "",
    "password": ""
  },
  "supportES": true,
  "supportL2": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| createSiteByTemplate | CreateSiteByTemplate | body | true | CreateSiteByTemplate | CreateSiteByTemplate |

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

Modify an existing site


PUT/openapi/v1/{omadacId}/sites/{siteId}

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


Modify an existing site

The interface requires one of the permissions:

Global Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

-33101 - This name already exists. Please enter another name for this site.

-33104 - The number of sites has reached the limit.

-33809 - This scenario does not exist.

Example


```
{
  "name": "",
  "region": "",
  "timeZone": "",
  "tagIds": [],
  "ntpEnable": true,
  "ntpServers": [\
    {\
      "address": ""\
    }\
  ],
  "dst": {
    "enable": true,
    "mode": 0,
    "start": {
      "month": 0,
      "serial": 0,
      "day": 0,
      "hour": 0,
      "minute": 0
    },
    "end": {
      "month": 0,
      "serial": 0,
      "day": 0,
      "hour": 0,
      "minute": 0
    },
    "offset": 0
  },
  "scenario": "",
  "longitude": 0,
  "latitude": 0,
  "address": "",
  "supportES": true,
  "supportL2": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| updateSiteEntity | UpdateSiteEntity | body | true | UpdateSiteEntity | UpdateSiteEntity |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWithoutResult |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |

Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Delete an existing site


DELETE/openapi/v1/{omadacId}/sites/{siteId}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Delete an existing site

The interface requires one of the permissions:

Global Dashboard Manager Modify

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWithoutResult |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |

Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Get scenario list


GET/openapi/v1/{omadacId}/scenarios

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get scenario list

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListString |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array |  |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": []
}
```

Create new scenario


POST/openapi/v1/{omadacId}/scenarios

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


Create new scenario

The interface requires one of the permissions:

Site Settings Manager Modify

Network Config Page Modify

Example


```
{
  "name": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| scenario | Scenario | body | true | Scenario | Scenario |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListString |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array |  |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": []
}
```

Delete site scenario


DELETE/openapi/v1/{omadacId}/scenarios

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


Delete site scenario

The interface requires one of the permissions:

Site Settings Manager Modify

Network Config Page Modify

Example


```
{
  "name": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| scenario | Scenario | body | true | Scenario | Scenario |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWithoutResult |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |

Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Get site device account setting


GET/openapi/v1/{omadacId}/sites/{siteId}/device-account

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site device account setting

The interface requires one of the permissions:

Global Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseDeviceAccountSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | DeviceAccountSettingOpenApiVO | DeviceAccountSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"username": "",
		"password": ""
	}
}
```

Update site device account setting


PUT/openapi/v1/{omadacId}/sites/{siteId}/device-account

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


Update site device account settin

The interface requires one of the permissions:

Site Settings Manager Modify

Global Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

Example


```
{
  "username": "",
  "password": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceAccountSettingOpenApiVO | DeviceAccountSettingOpenApiVO | body | true | DeviceAccountSettingOpenApiVO | DeviceAccountSettingOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWithoutResult |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |

Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Get site tag list


GET/openapi/v1/{omadacId}/sites/tags

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site tag list.

The interface requires one of the permissions:

Global Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | Site Tag |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| name | Tag name should contain 1 to 128 ASCII characters. | string |  |
| tagId | Tag ID | string |  |

Response Example


```
[\
	{\
		"name": "",\
		"tagId": ""\
	}\
]
```

Create new site tag


POST/openapi/v1/{omadacId}/sites/tags

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


Create new site tag.

The interface requires one of the permissions:

Global Dashboard Manager Modify

Example


```
{
  "name": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| createSiteTagOpenApiVO | CreateSiteTagOpenApiVO | body | true | CreateSiteTagOpenApiVO | CreateSiteTagOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | Site Tag |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| name | Tag name should contain 1 to 128 ASCII characters. | string |  |
| tagId | Tag ID | string |  |

Response Example


```
{
	"name": "",
	"tagId": ""
}
```

Modify an existing site tag


PATCH/openapi/v1/{omadacId}/sites/tags

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


Modify an existing site tag.

The interface requires one of the permissions:

Global Dashboard Manager Modify

Example


```
{
  "name": "",
  "tagId": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| site Tag | Site Tag | body | true | Site Tag | Site Tag |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWithoutResult |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |

Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Delete an existing site tag


DELETE/openapi/v1/{omadacId}/sites/tags

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


Delete an existing site tag.

The interface requires one of the permissions:

Global Dashboard Manager Modify

Example


```
{
  "tagId": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| deleteSiteTagOpenApiVO | DeleteSiteTagOpenApiVO | body | true | DeleteSiteTagOpenApiVO | DeleteSiteTagOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWithoutResult |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |

Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Get scenario list difference


GET/openapi/v1/{omadacId}/scenarios/difference

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get a list of default scenarios for differentiation

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSetScenarioDifferenceVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | ScenarioDifferenceVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"name": "",\
			"isDefault": true\
		}\
	]
}
```

Get sites statistic


POST/openapi/v1/{omadacId}/sites/statistic

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


Get sites statistic

Example


```
{
  "omadaAndSiteIds": [\
    {\
      "omadacId": "",\
      "siteId": ""\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteStatisticList | Site statistic list | body | true | SiteStatisticList | SiteStatisticList |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSiteSummaryStatistic |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SiteSummaryStatistic | SiteSummaryStatistic |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"siteStatisticMap": {
			"additionalProperties1": {
				"id": "",
				"gatewayStatus": 0,
				"preConfigOsgNum": 0,
				"preConfigOswNum": 0,
				"preConfigApNum": 0,
				"preConfigOltNum": 0,
				"lan": true,
				"wlan": true,
				"lanDeviceConnectedNum": 0,
				"lanDeviceDisconnectedNum": 0,
				"wlanDeviceConnectedNum": 0,
				"wlanDeviceDisconnectedNum": 0,
				"wlanDeviceIsolatedNum": 0,
				"oltDeviceConnectedNum": 0,
				"oltDeviceDisconnectedNum": 0,
				"lanUserNum": 0,
				"wlanUserNum": 0,
				"lanGuestNum": 0,
				"wlanGuestNum": 0,
				"deviceAccount": {
					"username": "",
					"password": ""
				},
				"wirelessUpgrade": true,
				"wiredUpgrade": true,
				"issueEvent": {
					"critical": 0,
					"error": 0,
					"warning": 0,
					"info": 0
				},
				"wanHealth": {
					"good": 0,
					"fair": 0,
					"poor": 0,
					"noData": 0,
					"offline": 0
				},
				"wlanHealth": 0,
				"gatewayHealth": 0,
				"switchHealth": {
					"good": 0,
					"fair": 0,
					"poor": 0,
					"noData": 0
				},
				"eapHealth": {
					"good": 0,
					"fair": 0,
					"poor": 0,
					"noData": 0
				},
				"wirelessClientHealth": {
					"good": 0,
					"fair": 0,
					"poor": 0,
					"noData": 0
				},
				"wiredClientHealth": {
					"good": 0,
					"fair": 0,
					"poor": 0,
					"noData": 0
				}
			}
		}
	}
}
```

Get site url


GET/openapi/v1/{omadacId}/sites/{siteId}/url

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site url

The interface requires one of the permissions:

Site Settings Manager View Only

Network Config Page View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-53124 - Device Management Host not enable.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSiteUrlOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SiteUrlOpenApiVO | SiteUrlOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"siteUrl": ""
	}
}
```

Get available site to bind template


GET/openapi/v1/{omadacId}/sitetemplates/{siteTemplateId}/available-bind

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get available site to bind template.

The interface requires one of the permissions:

Global Site Template Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33009 - This site template does not exist.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteTemplateId | Site Template ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000. | query | true | integer(int32) |  |
| searchKey | Fuzzy query parameters, support field name | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSitesSite |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SitesSite | SitesSite |

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
				"name": "",\
				"type": 0\
			}\
		],
		"allSiteIds": []
	}
}
```

Get ntp server status


GET/openapi/v1/{omadacId}/sites/{siteId}/setting/ntp

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get ntp server status.

The interface requires one of the permissions:

Site Health & Incident Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

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

Get template ntp server status


GET/openapi/v1/{omadacId}/sitetemplates/{siteTemplateId}/setting/ntp

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get template ntp server status.

The interface requires one of the permissions:

Global Site Template Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteTemplateId | Site Template ID | path | true | string |  |

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

Obtain the geographic location information of Placed Sites


GET/openapi/v1/{omadacId}/placed-site-position

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the geographic location information of Placed Sites in batches.

The interface requires one of the permissions:

Global Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListPlaced Site |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | placed site |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"id": "",\
			"region": "",\
			"name": "",\
			"longitude": 0,\
			"latitude": 0,\
			"address": ""\
		}\
	]
}
```

Get the details of a site


GET/openapi/v1/{omadacId}/sites/{siteId}/global-dashboard/site-map/abnormal

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the details of a site in the Dashboard - site map

The interface requires one of the permissions:

Global Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

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

Obtain the geographic location information of unplaced Sites


GET/openapi/v1/{omadacId}/unplaced-site-position

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the geographic location information of unplaced Sites.

The interface requires one of the permissions:

Global Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000. | query | true | integer(int32) |  |
| searchKey | Fuzzy query parameters, support field name | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseUnplaced SitesUnplaced Site |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | unplaced sitesUnplaced Site | unplaced sitesUnplaced Site |

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
				"region": "",\
				"id": "",\
				"name": "",\
				"type": 0\
			}\
		],
		"unplacedNum": 0
	}
}
```