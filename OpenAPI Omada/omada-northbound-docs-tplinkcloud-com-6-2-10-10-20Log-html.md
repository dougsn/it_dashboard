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

10 Log

### GroupUrl

/v3/api-docs/10 Log

### GroupLocation

/v3/api-docs/10 Log

### count

POST


5

GET


14

PATCH


6

DELETE


4

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#knife4jDocument)
- [Log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#Log)
  - [Get global log notification v2](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getLogSettingForGlobalV2)
  - [Modify global log notification v2](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#modifyLogSettingGlobalV2)
  - [Reset global log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#resetLogSettingGlobal)
  - [Get site log notification v2](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getLogSettingForSiteV2)
  - [Modify site log notification v2](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#modifyLogSettingSiteV2)
  - [Reset site log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#resetLogSettingSite)
  - [Get global event log list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getEventLogsForGlobal)
  - [Get site event log list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getEventLogsForSite)
  - [Get global alert log list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getAlertLogsForGlobal)
  - [Get site alert log list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getAlertLogsForSite)
  - [Resolve site alert log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#resolveAlertForSite)
  - [Delete global event log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#deleteEventLogsForGlobal)
  - [Delete global alert log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#deleteAlertLogsForGlobal)
  - [Delete site event log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#deleteEventLogsForSite)
  - [Delete site alert log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#deleteAlertLogsForSite)
  - [Export log list in global view](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#exportLogListForGlobal)
  - [Get site remote logging setting tip](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getRemoteLoggingSettingTip)
  - [Get customer remote logging tip](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getRemoteLoggingTip)
  - [Get global log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getLogSettingForGlobal)
  - [Modify global log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#modifyLogSettingGlobal)
  - [Get site log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getLogSettingForSite)
  - [Modify site log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#modifyLogSettingSite)
- [Audit Log](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#Audit%20Log)
  - [Get site audit log list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getAuditLogsForSite)
  - [Get global audit log list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getAuditLogsForGlobal)
  - [Get global audit log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getAuditLogSettingForGlobal)
  - [Get site audit log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#getAuditLogSettingForMsp)
  - [Modify global audit log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#modifyAuditLogSettingGlobal)
  - [Modify site audit log notification](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#modifyAuditLogSettingSite)
  - [Export audit log list in global view](https://omada-northbound-docs.tplinkcloud.com/6.2.10/10%20Log.html#exportAuditLogListForGlobal)

# Log

Get global log notification v2


GET/openapi/v2/{omadacId}/log-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get global log notification.

The interface requires one of the permissions:

Global Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseLogNotificationSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | LogNotificationSettingOpenApiVO | LogNotificationSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"webhookConfig": {
			"webhookEnable": false,
			"webhookId": ""
		},
		"logNotifications": [\
			{\
				"key": "LOGIN_OK",\
				"shortMsg": "User Logged In",\
				"alert": false,\
				"event": true,\
				"email": true,\
				"webhook": false\
			}\
		],
		"alertEmailSetting": {
			"alertEmailEnable": false,
			"delayEnable": false,
			"delay": 30
		}
	}
}
```

Modify global log notification v2


PATCH/openapi/v2/{omadacId}/log-notification

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


Modify global log notification.

The interface requires one of the permissions:

Global Log & Audit Log Manager Modify

Example


```
{
  "webhookConfig": {
    "webhookEnable": false,
    "webhookId": ""
  },
  "alertNotifications": [\
    {\
      "key": "LOGIN_OK",\
      "enable": true,\
      "email": true,\
      "webhook": false\
    }\
  ],
  "eventNotifications": [\
    {\
      "key": "LOGIN_OK",\
      "enable": true,\
      "email": true,\
      "webhook": false\
    }\
  ],
  "alertEmailSetting": {
    "alertEmailEnable": false,
    "delayEnable": false,
    "delay": 30
  },
  "eventEmailSetting": {
    "alertEmailEnable": false,
    "delayEnable": false,
    "delay": 30
  }
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| logNotificationSettingEditOpenApiV2VO | LogNotificationSettingEditOpenApiV2VO | body | true | LogNotificationSettingEditOpenApiV2VO | LogNotificationSettingEditOpenApiV2VO |

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

Reset global log notification


POST/openapi/v1/{omadacId}/reset/log-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Reset global log notification.

The interface requires one of the permissions:

Global Log & Audit Log Manager Modify

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

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

Get site log notification v2


GET/openapi/v2/{omadacId}/sites/{siteId}/site/log-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site log notification.

The interface requires one of the permissions:

Site Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseLogNotificationSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | LogNotificationSettingOpenApiVO | LogNotificationSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"webhookConfig": {
			"webhookEnable": false,
			"webhookId": ""
		},
		"logNotifications": [\
			{\
				"key": "LOGIN_OK",\
				"shortMsg": "User Logged In",\
				"alert": false,\
				"event": true,\
				"email": true,\
				"webhook": false\
			}\
		],
		"alertEmailSetting": {
			"alertEmailEnable": false,
			"delayEnable": false,
			"delay": 30
		}
	}
}
```

Modify site log notification v2


PATCH/openapi/v2/{omadacId}/sites/{siteId}/site/log-notification

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


Modify site log notification.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "webhookConfig": {
    "webhookEnable": false,
    "webhookId": ""
  },
  "alertNotifications": [\
    {\
      "key": "LOGIN_OK",\
      "enable": true,\
      "email": true,\
      "webhook": false\
    }\
  ],
  "eventNotifications": [\
    {\
      "key": "LOGIN_OK",\
      "enable": true,\
      "email": true,\
      "webhook": false\
    }\
  ],
  "alertEmailSetting": {
    "alertEmailEnable": false,
    "delayEnable": false,
    "delay": 30
  },
  "eventEmailSetting": {
    "alertEmailEnable": false,
    "delayEnable": false,
    "delay": 30
  }
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| logNotificationSettingEditOpenApiV2VO | LogNotificationSettingEditOpenApiV2VO | body | true | LogNotificationSettingEditOpenApiV2VO | LogNotificationSettingEditOpenApiV2VO |

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

Reset site log notification


POST/openapi/v1/{omadacId}/sites/{siteId}/site/reset/log-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Reset site log notification.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

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

Get global event log list


GET/openapi/v1/{omadacId}/logs/events

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get logs in global event log page.

The interface requires one of the permissions:

Global Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000.(value:10,15,20,30,50,100) | query | true | integer(int32) |  |
| filters.timeStart | Filter query parameters, support field 1679297710438 | query | true | integer(int64) |  |
| filters.timeEnd | Filter query parameters, support field 1681889710438 | query | true | integer(int64) |  |
| filters.module | Filter query parameters, support field module, it should be a value as follows: System, Device | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseEventLogGridVOEventLogOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | EventLogGridVOEventLogOpenApiVO | EventLogGridVOEventLogOpenApiVO |

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
				"key": "",\
				"module": "",\
				"content": "",\
				"time": 0\
			}\
		],
		"eventLogStat": {
			"totalLogNum": 0,
			"systemLogNum": 0,
			"deviceLogNum": 0,
			"clientLogNum": 0
		}
	}
}
```

Get site event log list


GET/openapi/v1/{omadacId}/sites/{siteId}/logs/events

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get logs in site event log page.

The interface requires one of the permissions:

Site Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000.(value:10,15,20,30,50,100) | query | true | integer(int32) |  |
| filters.timeStart | Filter query parameters, support field 1679297710438 | query | true | integer(int64) |  |
| filters.timeEnd | Filter query parameters, support field 1681889710438 | query | true | integer(int64) |  |
| filters.module | Filter query parameters, support field module, it should be a value as follows: System, Device, Client | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseEventLogGridVOEventLogOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | EventLogGridVOEventLogOpenApiVO | EventLogGridVOEventLogOpenApiVO |

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
				"key": "",\
				"module": "",\
				"content": "",\
				"time": 0\
			}\
		],
		"eventLogStat": {
			"totalLogNum": 0,
			"systemLogNum": 0,
			"deviceLogNum": 0,
			"clientLogNum": 0
		}
	}
}
```

Get global alert log list


GET/openapi/v1/{omadacId}/logs/alerts

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get logs in global alert log page.

The interface requires one of the permissions:

Global Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000.(value:10,15,20,30,50,100) | query | true | integer(int32) |  |
| filters.timeStart | Filter query parameters, support field 1679297710438 | query | true | integer(int64) |  |
| filters.timeEnd | Filter query parameters, support field 1681889710438 | query | true | integer(int64) |  |
| filters.module | Filter query parameters, support field module, it should be a value as follows: System, Device | query | false | string |  |
| filters.resolved | Filter query parameters, support field resolved, it should be a value as follows: true, false | query | false | boolean |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseAlertLogGridVOAlertLogOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | AlertLogGridVOAlertLogOpenApiVO | AlertLogGridVOAlertLogOpenApiVO |

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
				"key": "",\
				"module": "",\
				"content": "",\
				"time": 0,\
				"level": ""\
			}\
		],
		"alertLogStat": {
			"totalLogNum": 0,
			"unResolvedLogNum": 0,
			"resolvedLogNum": 0,
			"systemLogNum": 0,
			"deviceLogNum": 0
		}
	}
}
```

Get site alert log list


GET/openapi/v1/{omadacId}/sites/{siteId}/logs/alerts

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get logs in site alert log page.

The interface requires one of the permissions:

Site Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000.(value:10,15,20,30,50,100) | query | true | integer(int32) |  |
| filters.timeStart | Filter query parameters, support field 1679297710438 | query | true | integer(int64) |  |
| filters.timeEnd | Filter query parameters, support field 1681889710438 | query | true | integer(int64) |  |
| filters.module | Filter query parameters, support field module, it should be a value as follows: System, Device, Client | query | false | string |  |
| filters.resolved | Filter query parameters, support field resolved, it should be a value as follows: true, false | query | false | boolean |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseAlertLogGridVOAlertLogOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | AlertLogGridVOAlertLogOpenApiVO | AlertLogGridVOAlertLogOpenApiVO |

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
				"key": "",\
				"module": "",\
				"content": "",\
				"time": 0,\
				"level": ""\
			}\
		],
		"alertLogStat": {
			"totalLogNum": 0,
			"unResolvedLogNum": 0,
			"resolvedLogNum": 0,
			"systemLogNum": 0,
			"deviceLogNum": 0
		}
	}
}
```

Resolve site alert log


POST/openapi/v1/{omadacId}/sites/{siteId}/logs/alerts/resolve

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


Resolve site alert log.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "logs": [],
  "selectType": "",
  "startTime": 0,
  "endTime": 0,
  "filterModule": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| resolveSiteLogListOpenApiVO | ResolveSiteLogListOpenApiVO | body | true | ResolveSiteLogListOpenApiVO | ResolveSiteLogListOpenApiVO |

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

Delete global event log


DELETE/openapi/v1/{omadacId}/logs/events/delete

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


Delete global event log.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "logs": [],
  "selectType": "",
  "startTime": 0,
  "endTime": 0,
  "filterModule": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| deleteGlobalEventLogListOpenApiVO | DeleteGlobalEventLogListOpenApiVO | body | true | DeleteGlobalEventLogListOpenApiVO | DeleteGlobalEventLogListOpenApiVO |

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

Delete global alert log


DELETE/openapi/v1/{omadacId}/logs/alerts/delete

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


Delete global alert log.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "logs": [],
  "selectType": "",
  "startTime": 0,
  "endTime": 0,
  "filterModule": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| deleteGlobalAlertLogListOpenApiVO | DeleteGlobalAlertLogListOpenApiVO | body | true | DeleteGlobalAlertLogListOpenApiVO | DeleteGlobalAlertLogListOpenApiVO |

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

Delete site event log


DELETE/openapi/v1/{omadacId}/sites/{siteId}/logs/events/delete

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


Delete site event log.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "logs": [],
  "selectType": "",
  "startTime": 0,
  "endTime": 0,
  "filterModule": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deleteSiteEventLogListOpenApiVO | DeleteSiteEventLogListOpenApiVO | body | true | DeleteSiteEventLogListOpenApiVO | DeleteSiteEventLogListOpenApiVO |

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

Delete site alert log


DELETE/openapi/v1/{omadacId}/sites/{siteId}/logs/alerts/delete

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


Delete site alert log.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "logs": [],
  "selectType": "",
  "startTime": 0,
  "endTime": 0,
  "filterModule": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deleteSiteAlertLogListOpenApiVO | DeleteSiteAlertLogListOpenApiVO | body | true | DeleteSiteAlertLogListOpenApiVO | DeleteSiteAlertLogListOpenApiVO |

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

Export log list in global view


POST/openapi/v1/{omadacId}/logs/export

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


Export log list in global view.

The interface requires one of the permissions:

Global Export Data Access

Example


```
{
  "siteIds": [],
  "format": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| exportLogOpenApiVO | ExportLogOpenApiVO | body | true | ExportLogOpenApiVO | ExportLogOpenApiVO |

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

Get site remote logging setting tip


GET/openapi/v1/{omadacId}/sites/{siteId}/remote-logging/tip

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site remote logging setting tip.

The interface requires one of the permissions:

Site Settings Manager View Only

Site Map Manager View Only

Site Hotspot Manager View Only

Site Device Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1300 - Failed to get site information.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | site\_id | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSiteRemoteLoggingSetting |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SiteRemoteLoggingSetting | SiteRemoteLoggingSetting |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"remoteLog": {
			"enable": true,
			"host": "",
			"port": 0,
			"moreClientLog": true,
			"resource": 0
		}
	}
}
```

Get customer remote logging tip


GET/openapi/v1/{omadacId}/global/controller/setting/syslog/tip

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get customer remote logging tip.

The interface requires one of the permissions:

Global Other Setting View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseCustomerRemoteLogTipOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | CustomerRemoteLogTipOpenApiVO | CustomerRemoteLogTipOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"enable": true,
		"host": "",
		"port": 0
	}
}
```

Get global log notification


GET/openapi/v1/{omadacId}/log-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get global log notification.This interface has been deprecated. Please use the following interface instead: Get global log notification v2

The interface requires one of the permissions:

Global Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseLogNotificationSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | LogNotificationSettingOpenApiVO | LogNotificationSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"webhookConfig": {
			"webhookEnable": false,
			"webhookId": ""
		},
		"logNotifications": [\
			{\
				"key": "LOGIN_OK",\
				"shortMsg": "User Logged In",\
				"alert": false,\
				"event": true,\
				"email": true,\
				"webhook": false\
			}\
		],
		"alertEmailSetting": {
			"alertEmailEnable": false,
			"delayEnable": false,
			"delay": 30
		}
	}
}
```

Modify global log notification


PATCH/openapi/v1/{omadacId}/log-notification

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


Modify global log notification.This interface has been deprecated. Please use the following interface instead: Modify global log notification v2

The interface requires one of the permissions:

Global Log & Audit Log Manager Modify

Example


```
{
  "webhookConfig": {
    "webhookEnable": false,
    "webhookId": ""
  },
  "logNotifications": [\
    {\
      "key": "LOGIN_OK",\
      "alert": false,\
      "event": true,\
      "email": true,\
      "webhook": false\
    }\
  ],
  "alertEmailSetting": {
    "alertEmailEnable": false,
    "delayEnable": false,
    "delay": 30
  }
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| logNotificationSettingEditOpenApiVO | LogNotificationSettingEditOpenApiVO | body | true | LogNotificationSettingEditOpenApiVO | LogNotificationSettingEditOpenApiVO |

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

Get site log notification


GET/openapi/v1/{omadacId}/sites/{siteId}/site/log-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site log notification.This interface has been deprecated. Please use the following interface instead: Get site log notification v2

The interface requires one of the permissions:

Site Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseLogNotificationSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | LogNotificationSettingOpenApiVO | LogNotificationSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"webhookConfig": {
			"webhookEnable": false,
			"webhookId": ""
		},
		"logNotifications": [\
			{\
				"key": "LOGIN_OK",\
				"shortMsg": "User Logged In",\
				"alert": false,\
				"event": true,\
				"email": true,\
				"webhook": false\
			}\
		],
		"alertEmailSetting": {
			"alertEmailEnable": false,
			"delayEnable": false,
			"delay": 30
		}
	}
}
```

Modify site log notification


PATCH/openapi/v1/{omadacId}/sites/{siteId}/site/log-notification

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


Modify site log notification.This interface has been deprecated. Please use the following interface instead: Modify site log notification v2

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "webhookConfig": {
    "webhookEnable": false,
    "webhookId": ""
  },
  "logNotifications": [\
    {\
      "key": "LOGIN_OK",\
      "alert": false,\
      "event": true,\
      "email": true,\
      "webhook": false\
    }\
  ],
  "alertEmailSetting": {
    "alertEmailEnable": false,
    "delayEnable": false,
    "delay": 30
  }
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| logNotificationSettingEditOpenApiVO | LogNotificationSettingEditOpenApiVO | body | true | LogNotificationSettingEditOpenApiVO | LogNotificationSettingEditOpenApiVO |

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

# Audit Log

Get site audit log list


GET/openapi/v1/{omadacId}/sites/{siteId}/audit-logs

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get audit logs in site audit page.

The interface requires one of the permissions:

Site Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000.(value:10,15,20,30,50,100) | query | true | integer(int32) |  |
| sorts.time | Sort parameter may be one of asc or desc. Optional parameter. If it is not carried, it means it is not sorted by this field. When there are more than one, the first one takes effect | query | false | string |  |
| filters.result | Filter query parameters, support field result,it should be a value as follows: 0: successful; 1: failed,example:0 | query | false | integer(int32) |  |
| filters.level | Filter query parameters, support field level,it should be a value as follows: Error; Warning; Information, example:Error | query | false | string |  |
| filters.auditTypes | Filter query parameters, support field auditTypes, for the values of auditLog type, refer to section 5.2.2 of the Open API Access Guide, example:Log,Cloud Access,User Interface. | query | false | string |  |
| filters.times | Filter query parameters, support field times, example:\[{"timeStart":1678060800000,"timeEnd":1678665599999}\](UrlEncode:%5B%7B%22timeStart%22%3A1678060800000%2C%22timeEnd%22%3A1678665599999%7D%5D).If this parameter is not specified (not included or empty array), the interface will query data within the default time period: \[{"timeStart": Current timestamp minus milliseconds of 7 days,"timeEnd": Current timestamp}\]. | query | false | string |  |
| searchKey | Fuzzy query parameters, support field content | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGridVOAuditLogOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GridVOAuditLogOpenApiVO | GridVOAuditLogOpenApiVO |

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
				"time": 1677660067182,\
				"operator": "user1",\
				"resource": "WEB",\
				"ip": "127.0.0.1",\
				"auditType": "Log",\
				"level": "Information",\
				"result": "Succeed",\
				"content": "Dashboard Tab test-Tab added successfully.",\
				"label": "MENU.CLIENTS or /openapi/v1/{omadacId}/sites/{siteId}/site/reset/log-notification",\
				"oldValue": "{\"dpi\":\"false\",\"loggingTraffic\":\"false\"}",\
				"newValue": "{\"dpi\":\"true\",\"loggingTraffic\":\"true\"}"\
			}\
		]
	}
}
```

Get global audit log list


GET/openapi/v1/{omadacId}/audit-logs

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get audit logs in global audit page.

The interface requires one of the permissions:

Global Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000.(value:10,15,20,30,50,100) | query | true | integer(int32) |  |
| sorts.time | Sort parameter may be one of asc or desc. Optional parameter. If it is not carried, it means it is not sorted by this field. When there are more than one, the first one takes effect | query | false | string |  |
| filters.result | Filter query parameters, support field result,it should be a value as follows: 0: successful; 1: failed,example:0 | query | false | integer(int32) |  |
| filters.level | Filter query parameters, support field level,it should be a value as follows: Error; Warning; Information, example:Error | query | false | string |  |
| filters.auditTypes | Filter query parameters, support field auditTypes, for the values of auditLog type, refer to section 5.2.2 of the Open API Access Guide, example:Log,Cloud Access,User Interface. | query | false | string |  |
| filters.times | Filter query parameters, support field times, example:\[{"timeStart":1678060800000,"timeEnd":1678665599999}\](UrlEncode:%5B%7B%22timeStart%22%3A1678060800000%2C%22timeEnd%22%3A1678665599999%7D%5D).If this parameter is not specified (not included or empty array), the interface will query data within the default time period: \[{"timeStart": Current timestamp minus milliseconds of 7 days,"timeEnd": Current timestamp}\]. | query | false | string |  |
| searchKey | Fuzzy query parameters, support field content | query | false | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGridVOAuditLogOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GridVOAuditLogOpenApiVO | GridVOAuditLogOpenApiVO |

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
				"time": 1677660067182,\
				"operator": "user1",\
				"resource": "WEB",\
				"ip": "127.0.0.1",\
				"auditType": "Log",\
				"level": "Information",\
				"result": "Succeed",\
				"content": "Dashboard Tab test-Tab added successfully.",\
				"label": "MENU.CLIENTS or /openapi/v1/{omadacId}/sites/{siteId}/site/reset/log-notification",\
				"oldValue": "{\"dpi\":\"false\",\"loggingTraffic\":\"false\"}",\
				"newValue": "{\"dpi\":\"true\",\"loggingTraffic\":\"true\"}"\
			}\
		]
	}
}
```

Get global audit log notification


GET/openapi/v1/{omadacId}/audit-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get global audit log notification.

The interface requires one of the permissions:

Global Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseAuditLogNotificationSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | AuditLogNotificationSettingOpenApiVO | AuditLogNotificationSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"webhookConfig": {
			"webhookEnable": false,
			"webhookId": ""
		},
		"auditLogNotifications": [\
			{\
				"key": "DASHBOARD",\
				"shortMsg": "Dashboard",\
				"webhook": false\
			}\
		]
	}
}
```

Get site audit log notification


GET/openapi/v1/{omadacId}/sites/{siteId}/site/audit-notification

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site audit log notification.

The interface requires one of the permissions:

Site Log & Audit Log Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseAuditLogNotificationSettingOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | AuditLogNotificationSettingOpenApiVO | AuditLogNotificationSettingOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"webhookConfig": {
			"webhookEnable": false,
			"webhookId": ""
		},
		"auditLogNotifications": [\
			{\
				"key": "DASHBOARD",\
				"shortMsg": "Dashboard",\
				"webhook": false\
			}\
		]
	}
}
```

Modify global audit log notification


PATCH/openapi/v1/{omadacId}/audit-notification

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


Modify global audit log notification.

The interface requires one of the permissions:

Global Log & Audit Log Manager Modify

Example


```
{
  "webhookConfig": {
    "webhookEnable": false,
    "webhookId": ""
  },
  "auditLogNotifications": [\
    {\
      "key": "DASHBOARD",\
      "webhook": false\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| auditLogNotificationSettingEditOpenApiVO | AuditLogNotificationSettingEditOpenApiVO | body | true | AuditLogNotificationSettingEditOpenApiVO | AuditLogNotificationSettingEditOpenApiVO |

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

Modify site audit log notification


PATCH/openapi/v1/{omadacId}/sites/{siteId}/site/audit-notification

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


Modify site audit log notification.

The interface requires one of the permissions:

Site Log & Audit Log Manager Modify

Example


```
{
  "webhookConfig": {
    "webhookEnable": false,
    "webhookId": ""
  },
  "auditLogNotifications": [\
    {\
      "key": "DASHBOARD",\
      "webhook": false\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| auditLogNotificationSettingEditOpenApiVO | AuditLogNotificationSettingEditOpenApiVO | body | true | AuditLogNotificationSettingEditOpenApiVO | AuditLogNotificationSettingEditOpenApiVO |

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

Export audit log list in global view


POST/openapi/v1/{omadacId}/logs/audit/export

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


Export audit log list in global view.

The interface requires one of the permissions:

Global Export Data Access

Example


```
{
  "siteIds": [],
  "format": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| exportLogOpenApiVO | ExportLogOpenApiVO | body | true | ExportLogOpenApiVO | ExportLogOpenApiVO |

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