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

08 Maintenance

### GroupUrl

/v3/api-docs/08 Maintenance

### GroupLocation

/v3/api-docs/08 Maintenance

### count

POST


8

GET


8

PATCH


2

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#knife4jDocument)
- [Backup and Restore](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#Backup%20and%20Restore)
  - [Backup multi sites config to file server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#backupSitesFileServer)
  - [Backup multi sites config to self server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#backupSitesSelfServer)
  - [Backup controller config to file server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#backupFileServer)
  - [Backup controller config to cloud server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#backupSelfServer)
  - [Restore multi sites config from file server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#restoreSitesFileServer)
  - [Restore multi sites config from self server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#restoreSitesSelfServer)
  - [Restore controller config from file server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#restoreFileServer)
  - [Restore controller config from cloud server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#restoreSelfServer)
  - [Get site backup result](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getSiteBackupResult)
  - [Get controller backup result](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getBackupResult)
  - [Get controller restore result](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getRestoreResult)
  - [Get controller backup file list in self server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getSelfServerFileList)
  - [Get site backup file list in self server](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getSelfServerSiteFileList)
- [History Data Retention](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#History%20Data%20Retention)
  - [Get history data retention configuration](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getDataRetention)
  - [Modify history data retention configuration](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#modifyRetention)
  - [Get MSP client detail information setting.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#getMspClientDetailInfoSetting)
  - [Modify MSP client detail information setting.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#modifyMspClientDetailInfoSetting)
- [Data Export](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#Data%20Export)
  - [Export site Rogue AP scan results](https://omada-northbound-docs.tplinkcloud.com/6.2.10/08%20Maintenance.html#exportSiteRogueApZipFile)

# Backup and Restore

Backup multi sites config to file server


POST/openapi/v1/{omadacId}/sites/maintenance/multi-backup/file-server

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


Backup multi sites config to file server. At most 300 sites can backup.

The interface requires one of the permissions:

Site Settings Manager Modify

Maintenance Page Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30301 - Backing up...

-30304 - Restoring...

-30309 - Failed to back up the configurations.

-30320 - Failed to connect to the file server. The file server may not exist or it is temporarily unavailable. Please check the information and your network connection, and try again.

Example


```
{
  "serverConfig": {
    "protocol": "",
    "hostname": "",
    "port": 0,
    "username": "",
    "password": ""
  },
  "filePath": "",
  "siteIds": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| fileServerSiteBackupVO | FileServerSiteBackupVO | body | true | FileServerSiteBackupVO | FileServerSiteBackupVO |

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

Backup multi sites config to self server


POST/openapi/v1/{omadacId}/sites/maintenance/multi-backup/self-server

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


Backup multi sites config to self server. At most 300 sites can backup.

The interface requires one of the permissions:

Site Settings Manager Modify

Maintenance Page Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30301 - Backing up...

-30304 - Restoring...

-30309 - Failed to back up the configurations.

Example


```
{
  "siteIds": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| batchSiteBackupVO | BatchSiteBackupVO | body | true | BatchSiteBackupVO | BatchSiteBackupVO |

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

Backup controller config to file server


POST/openapi/v1/{omadacId}/maintenance/backup/file-server

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


Backup controller config to file server.

The interface requires one of the permissions:

Global Other Setting Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30301 - Backing up...

-30304 - Restoring...

-30309 - Failed to back up the configurations.

-30320 - Failed to connect to the file server. The file server may not exist or it is temporarily unavailable. Please check the information and your network connection, and try again.

Example


```
{
  "serverConfig": {
    "protocol": "",
    "hostname": "",
    "port": 0,
    "username": "",
    "password": ""
  },
  "filePath": "",
  "retainUser": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| fileServerGlobalBackupVO | FileServerGlobalBackupVO | body | true | FileServerGlobalBackupVO | FileServerGlobalBackupVO |

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

Backup controller config to cloud server


POST/openapi/v1/{omadacId}/maintenance/backup/self-server

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


Backup controller config to cloud server.

The interface requires one of the permissions:

Global Other Setting Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30301 - Backing up...

-30304 - Restoring...

-30309 - Failed to back up the configurations.

Example


```
{
  "retainUser": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| selfGlobalBackupVO | SelfGlobalBackupVO | body | true | SelfGlobalBackupVO | SelfGlobalBackupVO |

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

Restore multi sites config from file server


POST/openapi/v1/{omadacId}/sites/maintenance/multi-restore/file-server

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


Restore multi sites config from file server. At most 300 sites can be restored.

The interface requires one of the permissions:

Site Settings Manager Modify

Maintenance Page Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30304 - Restoring...

-30305 - Failed to restore because of unexpected errors. Please try again later.

-30320 - Failed to connect to the file server. The file server may not exist or it is temporarily unavailable. Please check the information and your network connection, and try again.

Example


```
{
  "serverConfig": {
    "protocol": "",
    "hostname": "",
    "port": 0,
    "username": "",
    "password": ""
  },
  "siteInfos": [\
    {\
      "filePath": "",\
      "siteId": ""\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| batchSiteFileServerRestoreVO | BatchSiteFileServerRestoreVO | body | true | BatchSiteFileServerRestoreVO | BatchSiteFileServerRestoreVO |

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

Restore multi sites config from self server


POST/openapi/v1/{omadacId}/sites/maintenance/multi-restore/self-server

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


Restore multi sites config from self server. At most 300 sites can be restored.

The interface requires one of the permissions:

Site Settings Manager Modify

Maintenance Page Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30304 - Restoring...

-30305 - Failed to restore because of unexpected errors. Please try again later.

Example


```
{
  "siteRestoreInfos": [\
    {\
      "fileName": "",\
      "siteId": ""\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| batchSiteSelfRestoreVO | BatchSiteSelfRestoreVO | body | true | BatchSiteSelfRestoreVO | BatchSiteSelfRestoreVO |

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

Restore controller config from file server


POST/openapi/v1/{omadacId}/maintenance/restore/file-server

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


Restore controller config from file server.

The interface requires one of the permissions:

Global Other Setting Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30304 - Restoring...

-30305 - Failed to restore because of unexpected errors. Please try again later.

-30320 - Failed to connect to the file server. The file server may not exist or it is temporarily unavailable. Please check the information and your network connection, and try again.

Example


```
{
  "serverConfig": {
    "protocol": "",
    "hostname": "",
    "port": 0,
    "username": "",
    "password": ""
  },
  "filePath": "",
  "skipDevice": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| fileServerGlobalRestoreVO | FileServerGlobalRestoreVO | body | true | FileServerGlobalRestoreVO | FileServerGlobalRestoreVO |

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

Restore controller config from cloud server


POST/openapi/v1/{omadacId}/maintenance/restore/self-server

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


Restore controller config from cloud server.

The interface requires one of the permissions:

Global Other Setting Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30304 - Restoring...

-30305 - Failed to restore because of unexpected errors. Please try again later.

Example


```
{
  "fileName": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| selfGlobalRestoreVO | SelfGlobalRestoreVO | body | true | SelfGlobalRestoreVO | SelfGlobalRestoreVO |

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

Get site backup result


GET/openapi/v1/{omadacId}/sites/{siteId}/backup/result

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site backup result.

The interface requires one of the permissions:

Site Settings Manager View Only

Maintenance Page View Only

Global Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30309 - Failed to back up the configurations.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | BackupResultOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| status | Backup status should be a value as follows: 0: finished or init; 1: backup running. | integer(int32) | integer(int32) |

Response Example


```
{
	"status": 0
}
```

Get controller backup result


GET/openapi/v1/{omadacId}/maintenance/backup/result

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get controller backup result.

The interface requires one of the permissions:

Global Other Setting View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30309 - Failed to back up the configurations.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | BackupResultOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| status | Backup status should be a value as follows: 0: finished or init; 1: backup running. | integer(int32) | integer(int32) |

Response Example


```
{
	"status": 0
}
```

Get controller restore result


GET/openapi/v1/{omadacId}/maintenance/restore/result

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get controller restore result.

The interface requires one of the permissions:

Global Other Setting View Only

Site Settings Manager View Only

Maintenance Page View Only

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30303 - Failed to restore because the file is incompatible.

-30305 - Failed to restore because of unexpected errors. Please try again later.

-30307 - Invalid configuration file. Please select the configuration file of the same integrated gateway model.

-30317 - Cannot restore a site-level backup file into the controller. Please go to global Dashboard > Site List to import

-30318 - Invalid file. To restore controller data, please go to Settings > Maintenance > Backup & Restore.

-30319 - Failed to restore due to database anomaly, please try again later.

-30326 - The devices in the customer configuration file are duplicate with the adopted devices and cannot be imported.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | RestoreResultVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| status | Status should be a value as follows: 0: restore finished; 1: restore prepared; 2: restore running; 3: restore failed | integer(int32) | integer(int32) |

Response Example


```
{
	"status": 0
}
```

Get controller backup file list in self server


GET/openapi/v1/{omadacId}/maintenance/backup/files

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get controller backup file list in self server.

The interface requires one of the permissions:

Global Other Setting View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | BackupFileListVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| fileList | File list of backup files. | array | BackupFileResultVO |

Response Example


```
{
	"fileList": [\
		{\
			"fileName": "",\
			"backupTime": 0,\
			"size": 0\
		}\
	]
}
```

Get site backup file list in self server


GET/openapi/v1/{omadacId}/sites/{siteId}/maintenance/backup/files

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site backup file list in self server.

The interface requires one of the permissions:

Site Settings Manager View Only

Maintenance Page View Only

Global Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | BackupFileListVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| fileList | File list of backup files. | array | BackupFileResultVO |

Response Example


```
{
	"fileList": [\
		{\
			"fileName": "",\
			"backupTime": 0,\
			"size": 0\
		}\
	]
}
```

# History Data Retention

Get history data retention configuration


GET/openapi/v1/{omadacId}/retention

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get data retention configuration.

The interface requires one of the permissions:

Global Other Setting View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30001 - Controller is not configured.

-7131 - Controller ID not exist.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseHistory Retention |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | History Retention | History Retention |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"override": true,
		"clientsDataEnable": true,
		"clientDataTrendEnable": true,
		"clientRecognitionEnable": true,
		"clientHealthEnable": true,
		"knownClientAvailableRetentionDays": [],
		"knownClient": 0,
		"clientHistory": 0,
		"clientHistoryAvailableRetentionDays": [],
		"fiveMin": 0,
		"tenMin": 0,
		"hourly": 0,
		"dailyAvailableRetentionDays": [],
		"daily": 0,
		"weeklyAvailableRetentionDays": [],
		"weekly": 0,
		"portalAuthAvailableRetentionDays": [],
		"portalAuth": 0,
		"logAvailableRetentionDays": [],
		"log": 0,
		"rogueAp": 0,
		"widsData": 0,
		"clientDataTrendDaily": 0,
		"clientTrendAvailableRetentionDays": []
	}
}
```

Modify history data retention configuration


PATCH/openapi/v1/{omadacId}/retention

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


Modify history data retention configuration.

The interface requires one of the permissions:

Global Other Setting Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30001 - Controller is not configured.

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-7131 - Controller ID not exist.

Example


```
{
  "override": true,
  "clientsDataEnable": true,
  "clientDataTrendEnable": true,
  "clientRecognitionEnable": true,
  "clientHealthEnable": true,
  "knownClient": 0,
  "clientHistory": 0,
  "daily": 0,
  "weekly": 0,
  "portalAuth": 0,
  "log": 0,
  "rogueAp": 0,
  "widsData": 0,
  "clientDataTrendDaily": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| modifyHistoryRetentionOpenApiVO | ModifyHistoryRetentionOpenApiVO | body | true | ModifyHistoryRetentionOpenApiVO | ModifyHistoryRetentionOpenApiVO |

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

Get MSP client detail information setting.


GET/openapi/v1/msp/{mspId}/client-detail-information

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get MSP client detail information setting.

The interface requires one of the permissions:

MSP Other Settings View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30001 - Controller is not configured.

-7131 - Controller ID not exist.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| mspId | MSP ID | path | true | string |  |

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

Modify MSP client detail information setting.


PATCH/openapi/v1/msp/{mspId}/client-detail-information

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


Modify MSP client detail information setting.

The interface requires one of the permissions:

MSP Other Settings Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30001 - Controller is not configured.

-7131 - Controller ID not exist.

Example


```
{
  "clientHealthEnable": true,
  "clientHistoryEnable": true,
  "clientDataTrendEnable": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| mspId | MSP ID | path | true | string |  |
| mspClientDetailInfoSettingVO | MspClientDetailInfoSettingVO | body | true | MspClientDetailInfoSettingVO | MspClientDetailInfoSettingVO |

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

# Data Export

Export site Rogue AP scan results


GET/openapi/v1/{omadacId}/sites/{siteId}/rogue-ap/export/{format}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Export site Rogue AP scan results.

The interface requires one of the permissions:

Global Dashboard Manager View Only

Site Export Data Access

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30028 - Operation failed because other operations (backuping, site copying, customer copying, etc.) are being performed on this organization. Please wait and try again later.

-30309 - Failed to back up the configurations.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| format | The type of the exported file. 0: CSV, 1: xlsx. | path | true | string |  |
| page | Start page number. Start from 1. | query | true | integer(int32) |  |
| pageSize | Number of entries per page. It should be within the range of 1–1000. | query | true | integer(int32) |  |

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