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

05 Client

### GroupUrl

/v3/api-docs/05 Client

### GroupLocation

/v3/api-docs/05 Client

### count

POST
25
PATCH
3
GET
27
DELETE
1

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#knife4jDocument)
- [Client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#Client)
  - [Get all client list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getGridAllClients)
  - [Get client list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getGridActiveClients)
  - [Get client info](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientDetail)
  - [Set name for given client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#updateClientName)
  - [Set ratelimit setting for given client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#updateClientRateLimitSetting)
  - [Set ip setting for given client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#modifyClientIpSetting)
  - [Lock the given client to aps](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#updateClientLockToApSetting)
  - [Reconnect the client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#reconnectClient)
  - [Block the client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#blockClient)
  - [Unblock the client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#unblockClient)
  - [Disconnect the client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#disconnectClient)
  - [Delete client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#deleteClient)
  - [Get client list filtering options](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientFilteringOptions)
  - [Batch delete clients](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#deleteClients)
  - [Batch config clients](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#batchModifyClientSetting)
  - [Reboot the client](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#rebootClient)
  - [Export client list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#exportClient)
  - [Export global client list.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#exportClientListGlobalByCloudAccess)
  - [Get client correction options list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientCorrectionList)
  - [Get History data retention config.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientHistoryDataEnable)
  - [Get client link topology](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientTopology)
  - [Get Client history.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getGridClientHistory)
  - [Get client connection histories](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientJourney)
  - [Get client timeline events](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientTimeline)
  - [Export all client list in GLOBAL view](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#globalExportAllClientList)
  - [Get client statistical data details at a 5-minute interval.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientDetailStat5Min)
  - [Get client statistical data details at a hourly interval.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientDetailStatHourly)
  - [Get client statistical data details at a daily interval.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientDetailStatDaily)
  - [Get VIGI device link topology](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getVigiTopology)
  - [Get VIGI device connection histories](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getVigiJourney)
  - [Get VIGI device timeline events](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getVigiTimeline)
  - [Get VIGI device statistical data details at a 5-minute interval.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getVigiDetailStat5Min)
  - [Get VIGI device statistical data details at a hourly interval.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getVigiDetailStatHourly)
  - [Get VIGI device statistical data details at a daily interval.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getVigiDetailStatDaily)
  - [Get global client statistics by device.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#globalClientStatByDevice)
  - [Get msp client statistics by device.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#mspClientStatByDevice)
- [Client Insight](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#Client%20Insight)
  - [Get client past connection list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getGridPastConnections)
  - [Get known clients list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getGridKnownClients)
  - [Get client activity](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientActivity)
  - [Get past client number.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getPastClientNum)
  - [Get client distribution.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsDistribution)
  - [Get most active client.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getMostActiveClients)
  - [Get device client 5 min stat.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getDeviceClient5MinStat)
  - [Get the msp overview diagram of client.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getMspDashboardOverall)
  - [Get the Msp customers' client count.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientNumberForCustomerList)
  - [Get current client number.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getCurrentClientNum)
  - [Get clients ssid distribution.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsSsidDistribution)
  - [Get clients freq distribution.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsFreqDistribution)
  - [Get longest client uptime.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getLongestClientUptime)
  - [Get clients association activities.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsAssociationActivities)
  - [Get clients rssi distribution.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsRssiDistribution)
  - [Get clients bubble.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsBubble)
  - [Get ap density.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getApDensity)
  - [Get stack client stat.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getStackClientStat)
  - [Get clients signal distribution.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsBandDistribution)
  - [Get clients association time distribution.](https://omada-northbound-docs.tplinkcloud.com/6.2.10/05%20Client.html#getClientsAssociationTimeDistribution)

# Client

Get all client list


POST/openapi/v2/{omadacId}/sites/{siteId}/clients

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


Get all clients, including online offline blocked and all list.

The interface requires one of the permissions:

Site Clients Manager View Only

Site Device Manager View Only

Example


```
{
  "page": 0,
  "pageSize": 0,
  "sorts": {},
  "searchKey": "",
  "filters": {
    "wireless": true,
    "ipcNvr": true,
    "ipExist": true,
    "guest": [],
    "radioId": [],
    "deviceMac": [],
    "device": [],
    "deviceType": [],
    "model": "",
    "vendor": [],
    "ssid": [],
    "network": [],
    "vid": "",
    "timeStart": 0,
    "timeEnd": 0,
    "authStatus": [],
    "authType": "",
    "sourceTime": 0,
    "health": 0
  },
  "scope": 0
}
```

Params


Status


Response Params


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
				"mac": "",\
				"name": "",\
				"hostName": "",\
				"vendor": "",\
				"deviceType": "",\
				"deviceCategory": "",\
				"osName": "",\
				"model": "",\
				"ip": "",\
				"ipv6List": [],\
				"connectType": 0,\
				"connectDevType": "",\
				"connectedToWirelessRouter": true,\
				"wireless": true,\
				"ssid": "",\
				"signalLevel": 0,\
				"healthScore": 0,\
				"signalRank": 0,\
				"wifiMode": 0,\
				"apName": "",\
				"apMac": "",\
				"radioId": 0,\
				"channel": 0,\
				"rxRate": 0,\
				"txRate": 0,\
				"powerSave": true,\
				"rssi": 0,\
				"snr": 0,\
				"switchMac": "",\
				"switchName": "",\
				"supportLocate": true,\
				"locateEnable": true,\
				"gatewayMac": "",\
				"gatewayName": "",\
				"vid": 0,\
				"networkName": "",\
				"dot1xIdentity": "",\
				"dot1xVlan": 0,\
				"port": 0,\
				"portName": "",\
				"lagId": 0,\
				"switchPortsInLag": [],\
				"stPortsInLag": [],\
				"activity": 0,\
				"uploadActivity": 0,\
				"trafficDown": 0,\
				"trafficUp": 0,\
				"uptime": 0,\
				"lastSeen": 0,\
				"authStatus": 0,\
				"blocked": true,\
				"guest": true,\
				"active": true,\
				"manager": true,\
				"ipSetting": {\
					"useFixedAddr": true,\
					"netId": "",\
					"ip": "",\
					"serverType": "",\
					"serverMac": "",\
					"serverStackId": ""\
				},\
				"downPacket": 0,\
				"upPacket": 0,\
				"rateLimit": {\
					"rateLimitId": "",\
					"enable": true,\
					"upEnable": true,\
					"upUnit": 0,\
					"upLimit": 0,\
					"downEnable": true,\
					"downUnit": 0,\
					"downLimit": 0\
				},\
				"clientLockToApSetting": {\
					"enable": true,\
					"aps": [\
						{\
							"name": "",\
							"mac": ""\
						}\
					]\
				},\
				"support5g2": true,\
				"multiLink": [\
					{\
						"radioId": 0,\
						"wifiMode": 0,\
						"channel": 0,\
						"rxRate": 0,\
						"txRate": 0,\
						"powerSave": true,\
						"rssi": 0,\
						"snr": 0,\
						"signalLevel": 0,\
						"signalRank": 0,\
						"upPacket": 0,\
						"downPacket": 0,\
						"trafficDown": 0,\
						"trafficUp": 0,\
						"activity": 0,\
						"signalLevelAndRank": 0\
					}\
				],\
				"unit": 0,\
				"standardPort": "",\
				"systemName": "",\
				"description": "",\
				"capabilities": [],\
				"blockDisable": true,\
				"dhcpLeaseTime": 0,\
				"stackableSwitch": true,\
				"stackId": "",\
				"stackName": "",\
				"ppskProfileName": "",\
				"authInfo": [\
					{\
						"authType": 0,\
						"info": ""\
					}\
				]\
			}\
		],
		"clientStat": {
			"total": 0,
			"wireless": 0,
			"wired": 0,
			"numOffline": 0,
			"num2g": 0,
			"num5g": 0,
			"num6g": 0,
			"numUser": 0,
			"numGuest": 0,
			"ipc": 0,
			"numWirelessUser": 0,
			"numWirelessGuest": 0,
			"num2gUser": 0,
			"num5gUser": 0,
			"num6gUser": 0,
			"num2gGuest": 0,
			"num5gGuest": 0,
			"num6gGuest": 0,
			"poor": 0,
			"fair": 0,
			"noData": 0,
			"good": 0
		},
		"clientTypeStat": {
			"total": 0,
			"mobile": 0,
			"office": 0,
			"camera": 0,
			"audioVideo": 0,
			"smartHome": 0,
			"network": 0,
			"other": 0
		}
	}
}
```

Get client list


GET/openapi/v1/{omadacId}/sites/{siteId}/clients

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get all clients.

The interface requires one of the permissions:

Site Clients Manager View Only

Site Device Manager View Only

Params


Status


Response Params


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
				"mac": "",\
				"name": "",\
				"hostName": "",\
				"vendor": "",\
				"deviceType": "",\
				"deviceCategory": "",\
				"osName": "",\
				"model": "",\
				"ip": "",\
				"ipv6List": [],\
				"connectType": 0,\
				"connectDevType": "",\
				"connectedToWirelessRouter": true,\
				"wireless": true,\
				"ssid": "",\
				"signalLevel": 0,\
				"healthScore": 0,\
				"signalRank": 0,\
				"wifiMode": 0,\
				"apName": "",\
				"apMac": "",\
				"radioId": 0,\
				"channel": 0,\
				"rxRate": 0,\
				"txRate": 0,\
				"powerSave": true,\
				"rssi": 0,\
				"snr": 0,\
				"switchMac": "",\
				"switchName": "",\
				"supportLocate": true,\
				"locateEnable": true,\
				"gatewayMac": "",\
				"gatewayName": "",\
				"vid": 0,\
				"networkName": "",\
				"dot1xIdentity": "",\
				"dot1xVlan": 0,\
				"port": 0,\
				"portName": "",\
				"lagId": 0,\
				"switchPortsInLag": [],\
				"stPortsInLag": [],\
				"activity": 0,\
				"uploadActivity": 0,\
				"trafficDown": 0,\
				"trafficUp": 0,\
				"uptime": 0,\
				"lastSeen": 0,\
				"authStatus": 0,\
				"blocked": true,\
				"guest": true,\
				"active": true,\
				"manager": true,\
				"ipSetting": {\
					"useFixedAddr": true,\
					"netId": "",\
					"ip": "",\
					"serverType": "",\
					"serverMac": "",\
					"serverStackId": ""\
				},\
				"downPacket": 0,\
				"upPacket": 0,\
				"rateLimit": {\
					"rateLimitId": "",\
					"enable": true,\
					"upEnable": true,\
					"upUnit": 0,\
					"upLimit": 0,\
					"downEnable": true,\
					"downUnit": 0,\
					"downLimit": 0\
				},\
				"clientLockToApSetting": {\
					"enable": true,\
					"aps": [\
						{\
							"name": "",\
							"mac": ""\
						}\
					]\
				},\
				"support5g2": true,\
				"multiLink": [\
					{\
						"radioId": 0,\
						"wifiMode": 0,\
						"channel": 0,\
						"rxRate": 0,\
						"txRate": 0,\
						"powerSave": true,\
						"rssi": 0,\
						"snr": 0,\
						"signalLevel": 0,\
						"signalRank": 0,\
						"upPacket": 0,\
						"downPacket": 0,\
						"trafficDown": 0,\
						"trafficUp": 0,\
						"activity": 0,\
						"signalLevelAndRank": 0\
					}\
				],\
				"unit": 0,\
				"standardPort": "",\
				"systemName": "",\
				"description": "",\
				"capabilities": [],\
				"blockDisable": true,\
				"dhcpLeaseTime": 0,\
				"stackableSwitch": true,\
				"stackId": "",\
				"stackName": "",\
				"ppskProfileName": "",\
				"authInfo": [\
					{\
						"authType": 0,\
						"info": ""\
					}\
				]\
			}\
		],
		"clientStat": {
			"total": 0,
			"wireless": 0,
			"wired": 0,
			"numOffline": 0,
			"num2g": 0,
			"num5g": 0,
			"num6g": 0,
			"numUser": 0,
			"numGuest": 0,
			"ipc": 0,
			"numWirelessUser": 0,
			"numWirelessGuest": 0,
			"num2gUser": 0,
			"num5gUser": 0,
			"num6gUser": 0,
			"num2gGuest": 0,
			"num5gGuest": 0,
			"num6gGuest": 0,
			"poor": 0,
			"fair": 0,
			"noData": 0,
			"good": 0
		},
		"clientTypeStat": {
			"total": 0,
			"mobile": 0,
			"office": 0,
			"camera": 0,
			"audioVideo": 0,
			"smartHome": 0,
			"network": 0,
			"other": 0
		}
	}
}
```

Get client info


GET/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client info.

The interface requires one of the permissions:

Site Clients Manager View Only

Site Device Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"id": "",
		"mac": "",
		"name": "",
		"hostName": "",
		"vendor": "",
		"deviceType": "",
		"deviceCategory": "",
		"osName": "",
		"model": "",
		"ip": "",
		"ipv6List": [],
		"connectType": 0,
		"connectDevType": "",
		"connectedToWirelessRouter": true,
		"wireless": true,
		"ssid": "",
		"signalLevel": 0,
		"signalRank": 0,
		"wifiMode": 0,
		"apName": "",
		"apMac": "",
		"radioId": 0,
		"channel": 0,
		"rxRate": 0,
		"txRate": 0,
		"powerSave": true,
		"rssi": 0,
		"snr": 0,
		"switchMac": "",
		"switchName": "",
		"gatewayMac": "",
		"gatewayName": "",
		"vid": 0,
		"networkName": "",
		"dot1xIdentity": "",
		"dot1xVlan": 0,
		"port": 0,
		"lagId": 0,
		"activity": 0,
		"uploadActivity": 0,
		"trafficDown": 0,
		"trafficUp": 0,
		"uptime": 0,
		"lastSeen": 0,
		"authStatus": 0,
		"blocked": true,
		"guest": true,
		"active": true,
		"manager": true,
		"ipSetting": {
			"useFixedAddr": true,
			"netId": "",
			"ip": "",
			"serverType": "",
			"serverMac": "",
			"serverStackId": ""
		},
		"downPacket": 0,
		"upPacket": 0,
		"rateLimit": {
			"rateLimitId": "",
			"enable": true,
			"upEnable": true,
			"upUnit": 0,
			"upLimit": 0,
			"downEnable": true,
			"downUnit": 0,
			"downLimit": 0
		},
		"clientLockToApSetting": {
			"enable": true,
			"aps": [\
				{\
					"name": "",\
					"mac": ""\
				}\
			]
		},
		"multiLink": [\
			{\
				"radioId": 0,\
				"wifiMode": 0,\
				"channel": 0,\
				"rxRate": 0,\
				"txRate": 0,\
				"powerSave": true,\
				"rssi": 0,\
				"snr": 0,\
				"signalLevel": 0,\
				"signalRank": 0,\
				"upPacket": 0,\
				"downPacket": 0,\
				"trafficDown": 0,\
				"trafficUp": 0,\
				"activity": 0,\
				"signalLevelAndRank": 0\
			}\
		],
		"unit": 0,
		"standardPort": "",
		"blockDisable": true,
		"dhcpLeaseTime": 0,
		"systemName": "",
		"description": "",
		"capabilities": [],
		"authInfo": [\
			{\
				"authType": 0,\
				"info": ""\
			}\
		],
		"supportLocate": true,
		"locateEnable": true,
		"stackId": "",
		"switchPortsInLag": [],
		"stPortsInLag": [],
		"clientSupportNatTraversal": true
	}
}
```

Set name for given client


PATCH/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/name

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


Set name for given client.

The interface requires one of the permissions:

Site Clients Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-41011 - This client does not exist.

Example


```
{
  "name": ""
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Set ratelimit setting for given client


PATCH/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/ratelimit

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


Set ratelimit setting for given client.

The interface requires one of the permissions:

Site Clients Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33732 - The Rate Limit profile does not exist.

-41008 - The number of clients to be configured with Rate Limit has reached the limit.

-41011 - This client does not exist.

Example


```
{
  "mode": 0,
  "rateLimitProfileId": "",
  "customRateLimit": {
    "upEnable": true,
    "upUnit": 0,
    "upLimit": 0,
    "downEnable": true,
    "downUnit": 0,
    "downLimit": 0
  }
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Set ip setting for given client


PATCH/openapi/v1/{omadacId}/network/sites/{siteId}/cmd/clients/{clientMac}/update-ipSetting

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


Set ip setting for given client.

The interface requires one of the permissions:

Site Clients Manager Modify

Example


```
{
  "useFixedAddr": true,
  "netId": "",
  "ip": "",
  "serverType": "",
  "serverMac": "",
  "serverStackId": ""
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Lock the given client to aps


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/lock-to-ap

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


Lock the given client to aps.

The interface requires one of the permissions:

Site Clients Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-41011 - This client does not exist.

-41020 - Only wireless clients support Lock to wireless device.

-41021 - The number of Lock to wireless device entries has reached the upper limit.

-41022 - Blocked clients cannot be locked to wireless device.

Example


```
{
  "enable": true,
  "aps": []
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Reconnect the client


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/reconnect

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Reconnect the client.

The interface requires one of the permissions:

Site Clients Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-41011 - This client does not exist.

-41025 - Unable to reconnect wired client.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Block the client


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/block

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Block the client.

The interface requires one of the permissions:

Site Clients Manager Modify

Site Insight Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-41002 - This client does not exist.

-41003 - The number of clients to be blocked has reached the limit.

-41023 - Clients locked to wireless device cannot be blocked.

-41024 - This device is installed with the controller and cannot be blocked.

-41026 - The Agile Series Switch cannot block clients.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Unblock the client


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/unblock

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Unblock the client.

The interface requires one of the permissions:

Site Clients Manager Modify

Site Insight Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-41004 - This client does not exist.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Disconnect the client


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/disconnect

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Disconnect the client.

The interface requires one of the permissions:

Site Clients Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-41011 - This client does not exist.

-41027 - Unable to disconnect wired client.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Delete client


DELETE/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Delete client.

The interface requires one of the permissions:

Site Device Manager View Only

Site Clients Manager Modify

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Get client list filtering options


GET/openapi/v1/{omadacId}/sites/{siteId}/clients/search-fields-options

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client list filtering options.

The interface requires one of the permissions:

Site Clients Manager View Only

Site Device Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"deviceType": [\
			{\
				"category": "",\
				"type": []\
			}\
		],
		"vendor": [],
		"device": [],
		"network": [],
		"ssid": [],
		"deviceDetail": [\
			{\
				"mac": "",\
				"name": "",\
				"stack": true,\
				"stackName": ""\
			}\
		]
	}
}
```

Batch delete clients


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/delete

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


Batch delete clients.

The interface requires one of the permissions:

Site Device Manager View Only

Site Clients Manager Modify

Example


```
{
  "start": 0,
  "end": 0,
  "wireless": true,
  "guest": true,
  "rateLimit": true,
  "block": true,
  "connectSuccess": true,
  "searchKey": ""
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"id": "",
		"mac": "",
		"name": "",
		"hostName": "",
		"vendor": "",
		"deviceType": "",
		"deviceCategory": "",
		"osName": "",
		"model": "",
		"ip": "",
		"ipv6List": [],
		"connectType": 0,
		"connectDevType": "",
		"connectedToWirelessRouter": true,
		"wireless": true,
		"ssid": "",
		"signalLevel": 0,
		"signalRank": 0,
		"wifiMode": 0,
		"apName": "",
		"apMac": "",
		"radioId": 0,
		"channel": 0,
		"rxRate": 0,
		"txRate": 0,
		"powerSave": true,
		"rssi": 0,
		"snr": 0,
		"switchMac": "",
		"switchName": "",
		"gatewayMac": "",
		"gatewayName": "",
		"vid": 0,
		"networkName": "",
		"dot1xIdentity": "",
		"dot1xVlan": 0,
		"port": 0,
		"lagId": 0,
		"activity": 0,
		"uploadActivity": 0,
		"trafficDown": 0,
		"trafficUp": 0,
		"uptime": 0,
		"lastSeen": 0,
		"authStatus": 0,
		"blocked": true,
		"guest": true,
		"active": true,
		"manager": true,
		"ipSetting": {
			"useFixedAddr": true,
			"netId": "",
			"ip": "",
			"serverType": "",
			"serverMac": "",
			"serverStackId": ""
		},
		"downPacket": 0,
		"upPacket": 0,
		"rateLimit": {
			"rateLimitId": "",
			"enable": true,
			"upEnable": true,
			"upUnit": 0,
			"upLimit": 0,
			"downEnable": true,
			"downUnit": 0,
			"downLimit": 0
		},
		"clientLockToApSetting": {
			"enable": true,
			"aps": [\
				{\
					"name": "",\
					"mac": ""\
				}\
			]
		},
		"multiLink": [\
			{\
				"radioId": 0,\
				"wifiMode": 0,\
				"channel": 0,\
				"rxRate": 0,\
				"txRate": 0,\
				"powerSave": true,\
				"rssi": 0,\
				"snr": 0,\
				"signalLevel": 0,\
				"signalRank": 0,\
				"upPacket": 0,\
				"downPacket": 0,\
				"trafficDown": 0,\
				"trafficUp": 0,\
				"activity": 0,\
				"signalLevelAndRank": 0\
			}\
		],
		"unit": 0,
		"standardPort": "",
		"blockDisable": true,
		"dhcpLeaseTime": 0,
		"systemName": "",
		"description": "",
		"capabilities": [],
		"authInfo": [\
			{\
				"authType": 0,\
				"info": ""\
			}\
		],
		"supportLocate": true,
		"locateEnable": true,
		"stackId": "",
		"switchPortsInLag": [],
		"stPortsInLag": [],
		"clientSupportNatTraversal": true
	}
}
```

Batch config clients


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/config

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


Batch config clients.

The interface requires one of the permissions:

Site Device Manager View Only

Site Clients Manager Modify

Example


```
{
  "macList": [],
  "ipSetting": {
    "useFixedAddr": true,
    "netId": "",
    "serverType": "",
    "serverMac": "",
    "serverStackId": "",
    "ipList": [\
      {\
        "mac": "",\
        "ip": ""\
      }\
    ]
  },
  "rateLimit": {
    "mode": 0,
    "rateLimitProfileId": "",
    "customRateLimit": {
      "upEnable": true,
      "upUnit": 0,
      "upLimit": 0,
      "downEnable": true,
      "downUnit": 0,
      "downLimit": 0
    }
  },
  "lockToAp": {
    "enable": true,
    "aps": []
  }
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"id": "",
		"mac": "",
		"name": "",
		"hostName": "",
		"vendor": "",
		"deviceType": "",
		"deviceCategory": "",
		"osName": "",
		"model": "",
		"ip": "",
		"ipv6List": [],
		"connectType": 0,
		"connectDevType": "",
		"connectedToWirelessRouter": true,
		"wireless": true,
		"ssid": "",
		"signalLevel": 0,
		"signalRank": 0,
		"wifiMode": 0,
		"apName": "",
		"apMac": "",
		"radioId": 0,
		"channel": 0,
		"rxRate": 0,
		"txRate": 0,
		"powerSave": true,
		"rssi": 0,
		"snr": 0,
		"switchMac": "",
		"switchName": "",
		"gatewayMac": "",
		"gatewayName": "",
		"vid": 0,
		"networkName": "",
		"dot1xIdentity": "",
		"dot1xVlan": 0,
		"port": 0,
		"lagId": 0,
		"activity": 0,
		"uploadActivity": 0,
		"trafficDown": 0,
		"trafficUp": 0,
		"uptime": 0,
		"lastSeen": 0,
		"authStatus": 0,
		"blocked": true,
		"guest": true,
		"active": true,
		"manager": true,
		"ipSetting": {
			"useFixedAddr": true,
			"netId": "",
			"ip": "",
			"serverType": "",
			"serverMac": "",
			"serverStackId": ""
		},
		"downPacket": 0,
		"upPacket": 0,
		"rateLimit": {
			"rateLimitId": "",
			"enable": true,
			"upEnable": true,
			"upUnit": 0,
			"upLimit": 0,
			"downEnable": true,
			"downUnit": 0,
			"downLimit": 0
		},
		"clientLockToApSetting": {
			"enable": true,
			"aps": [\
				{\
					"name": "",\
					"mac": ""\
				}\
			]
		},
		"multiLink": [\
			{\
				"radioId": 0,\
				"wifiMode": 0,\
				"channel": 0,\
				"rxRate": 0,\
				"txRate": 0,\
				"powerSave": true,\
				"rssi": 0,\
				"snr": 0,\
				"signalLevel": 0,\
				"signalRank": 0,\
				"upPacket": 0,\
				"downPacket": 0,\
				"trafficDown": 0,\
				"trafficUp": 0,\
				"activity": 0,\
				"signalLevelAndRank": 0\
			}\
		],
		"unit": 0,
		"standardPort": "",
		"blockDisable": true,
		"dhcpLeaseTime": 0,
		"systemName": "",
		"description": "",
		"capabilities": [],
		"authInfo": [\
			{\
				"authType": 0,\
				"info": ""\
			}\
		],
		"supportLocate": true,
		"locateEnable": true,
		"stackId": "",
		"switchPortsInLag": [],
		"stPortsInLag": [],
		"clientSupportNatTraversal": true
	}
}
```

Reboot the client


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/reboot

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


Reboot the client.

The interface requires one of the permissions:

Site Clients Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

-41031 - Unable to reboot.

Example


```
{
  "deviceId": ""
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Export client list


POST/openapi/v1/{omadacId}/files/sites/{siteId}/clients/export

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


Export client list.

The interface requires one of the permissions:

Site Clients Manager View Only

Site Export Data Access

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30333 - XLSX Export Limit Exceeded. The number of items to be exported to XLSX exceeds 1 million. Please export data via separate modules or in CSV format.

Example


```
{
  "format": 0,
  "tables": []
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": ""
}
```

Export global client list.


POST/openapi/v1/{omadacId}/files/client-list

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


Export global client list.

The interface requires one of the permissions:

Global Export Data Access

Example


```
{
  "siteIds": [],
  "mode": 0,
  "clientsDisplay": [],
  "format": 0,
  "queryDataVO": {
    "page": 0,
    "pageSize": 0,
    "sorts": {},
    "searchKey": "",
    "filters": {},
    "searchField": ""
  }
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Get client correction options list


GET/openapi/v1/{omadacId}/correction-list

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client correction options list

The interface requires one of the permissions:

Site Clients Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"typeList": [\
			{\
				"name": "",\
				"key": "",\
				"icon": ""\
			}\
		],
		"vendorList": [\
			{\
				"name": "",\
				"key": "",\
				"icon": ""\
			}\
		]
	}
}
```

Get History data retention config.


GET/openapi/v1/{omadacId}/controller/client/history-enable

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get history data retention config.

The interface requires one of the permissions:

Global Other Setting View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"clientsDataEnable": true,
		"clientStatEnable": true
	}
}
```

Get client link topology


POST/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/client-link-topology

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client link topology.

The interface requires one of the permissions:

Site Clients Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"nodeType": 0,\
			"clientNode": {\
				"mac": "",\
				"name": "",\
				"ip": "",\
				"wireless": true,\
				"guest": true,\
				"clientType": "",\
				"upDeviceType": 0,\
				"authStatus": 0,\
				"model": "",\
				"manager": true,\
				"devTxRate": 0,\
				"devRxRate": 0,\
				"healthScore": 0,\
				"upOswInfo": {\
					"port": 0,\
					"standardPort": "",\
					"lagId": "",\
					"linkSpeed": 0,\
					"duplex": 0,\
					"trafficDown": 0,\
					"trafficUp": 0\
				},\
				"upApInfo": {\
					"port": 0,\
					"name": "",\
					"lagId": 0,\
					"channel": 0,\
					"ssid": "",\
					"radio": 0,\
					"support5g2": true,\
					"rssi": 0,\
					"trafficDown": 0,\
					"trafficUp": 0,\
					"txRate": 0,\
					"rxRate": 0,\
					"multiLink": [\
						{\
							"radioId": 0,\
							"channel": 0,\
							"rssi": 0,\
							"trafficDown": 0,\
							"trafficUp": 0,\
							"txRate": 0,\
							"rxRate": 0\
						}\
					]\
				}\
			},\
			"deviceNode": {\
				"deviceType": 0,\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"showModel": "",\
				"ip": "",\
				"ipv6List": [],\
				"status": 0,\
				"statusCategory": 0,\
				"devTxRate": 0,\
				"devRxRate": 0,\
				"stackGroup": true,\
				"stackId": "",\
				"healthScore": 0,\
				"apInfo": {\
					"wiredUpLink": {\
						"upPort": {\
							"port": "",\
							"standardPort": "",\
							"lagId": "",\
							"mlagId": "",\
							"poePower": 0,\
							"poePowerDecimal": 0,\
							"lagPorts": [],\
							"mlagPorts": [],\
							"standardLagPorts": [],\
							"standardMlagPorts": [],\
							"name": "",\
							"multiSwitchNum": 0,\
							"uplinkName": "",\
							"multiSwitchRole": 0\
						},\
						"upLinkPort": {\
							"port": "",\
							"standardPort": "",\
							"lagId": "",\
							"mlagId": "",\
							"poePower": 0,\
							"poePowerDecimal": 0,\
							"lagPorts": [],\
							"mlagPorts": [],\
							"standardLagPorts": [],\
							"standardMlagPorts": [],\
							"name": "",\
							"multiSwitchNum": 0,\
							"uplinkName": "",\
							"multiSwitchRole": 0\
						},\
						"linkSpeed": 0,\
						"duplex": 0,\
						"rxDropPkts": 0,\
						"txDropPkts": 0,\
						"rxErrPkts": 0,\
						"txErrPkts": 0\
					},\
					"wirelessUpLink": {\
						"txRate": "",\
						"rxRate": "",\
						"rssi": 0,\
						"rssiPercent": 0,\
						"rxDropPkts": 0,\
						"txDropPkts": 0,\
						"rxErrPkts": 0,\
						"txErrPkts": 0,\
						"snr": 0\
					}\
				},\
				"switchInfo": {\
					"upPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"upLinkPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"linkSpeed": 0,\
					"duplex": 0,\
					"rxDropPkts": 0,\
					"txDropPkts": 0,\
					"rxErrPkts": 0,\
					"txErrPkts": 0\
				},\
				"gatewayInfo": {\
					"upPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"upLinkPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"linkSpeed": 0,\
					"duplex": 0,\
					"rxDropPkts": 0,\
					"txDropPkts": 0,\
					"rxErrPkts": 0,\
					"txErrPkts": 0\
				},\
				"ap": true,\
				"osg": true,\
				"osw": true\
			},\
			"client": true\
		}\
	]
}
```

Get Client history.


GET/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/client-history

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get Client history.

The interface requires one of the permissions:

Site Clients Manager View Only

Params


Status


Response Params


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
				"mac": "",\
				"download": 0,\
				"upload": 0,\
				"duration": 0,\
				"lastSeen": 0,\
				"name": "",\
				"ssid": "",\
				"port": 0,\
				"vid": 0,\
				"reason": "",\
				"reasonType": 0,\
				"guest": true,\
				"deviceName": "",\
				"associationTime": 0,\
				"associated": 0,\
				"ip": "",\
				"ipv6List": [],\
				"authInfo": [\
					{\
						"authType": 0,\
						"info": ""\
					}\
				]\
			}\
		]
	}
}
```

Get client connection histories


GET/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/client-connection

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client connection histories.

The interface requires one of the permissions:

Site Clients Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"connections": [\
			{\
				"start": 0,\
				"end": 0,\
				"duration": 0\
			}\
		],
		"roamings": [\
			{\
				"start": 0,\
				"duration": 0\
			}\
		]
	}
}
```

Get client timeline events


GET/openapi/v1/{omadacId}/sites/{siteId}/clients/{clientMac}/client-timeline

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client timeline events.

The interface requires one of the permissions:

Site Clients Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"mac": "",\
			"start": 0,\
			"end": 0,\
			"events": [\
				{\
					"time": 0,\
					"eventType": 0,\
					"content": "",\
					"attributes": {}\
				}\
			]\
		}\
	]
}
```

Export all client list in GLOBAL view


POST/openapi/v1/{omadacId}/files/all-client-list

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


Export all client list in GLOBAL view, .

The interface requires one of the permissions:

Global Export Data Access

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30333 - XLSX Export Limit Exceeded. The number of items to be exported to XLSX exceeds 1 million. Please export data via separate modules or in CSV format.

Example


```
{
  "format": 0,
  "clientsDisplay": [],
  "clientsDisplayOverride": {},
  "mode": 0,
  "selectType": "",
  "siteIds": []
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {}
}
```

Get client statistical data details at a 5-minute interval.


POST/openapi/v1/{omadacId}/sites/{siteId}/client-stat-detail/{clientMac}/5Min

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


Get client statistical data details at a 5-minute interval.

The interface requires one of the permissions:

Site Clients Manager View Only

Example


```
{
  "startSec": 0,
  "endSec": 0
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalDown": 0,
		"totalUp": 0,
		"avgDownRate": 0,
		"avgUpRate": 0,
		"avgTxR": 0,
		"avgRxR": 0,
		"avgSignal": {},
		"totalTxFP": 0,
		"stats": [\
			{\
				"mac": "",\
				"wireless": true,\
				"time": 0,\
				"down": 0,\
				"up": 0,\
				"downRate": 0,\
				"upRate": 0,\
				"txR": 0,\
				"rxR": 0,\
				"signal": 0,\
				"radioId": 0,\
				"txFP": 0,\
				"multiLinks": [\
					{\
						"radioId": 0,\
						"signal": 0\
					}\
				]\
			}\
		]
	}
}
```

Get client statistical data details at a hourly interval.


POST/openapi/v1/{omadacId}/sites/{siteId}/client-stat-detail/{clientMac}/hourly

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


Get client statistical data details at a hourly interval.

The interface requires one of the permissions:

Site Clients Manager View Only

Example


```
{
  "startSec": 0,
  "endSec": 0
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalDown": 0,
		"totalUp": 0,
		"avgDownRate": 0,
		"avgUpRate": 0,
		"avgTxR": 0,
		"avgRxR": 0,
		"avgSignal": {},
		"totalTxFP": 0,
		"stats": [\
			{\
				"mac": "",\
				"wireless": true,\
				"time": 0,\
				"down": 0,\
				"up": 0,\
				"downRate": 0,\
				"upRate": 0,\
				"txR": 0,\
				"rxR": 0,\
				"signal": 0,\
				"radioId": 0,\
				"txFP": 0,\
				"multiLinks": [\
					{\
						"radioId": 0,\
						"signal": 0\
					}\
				]\
			}\
		]
	}
}
```

Get client statistical data details at a daily interval.


POST/openapi/v1/{omadacId}/sites/{siteId}/client-stat-detail/{clientMac}/daily

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


Get client statistical data details at a daily interval.

The interface requires one of the permissions:

Site Clients Manager View Only

Example


```
{
  "startSec": 0,
  "endSec": 0
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalDown": 0,
		"totalUp": 0,
		"avgDownRate": 0,
		"avgUpRate": 0,
		"avgTxR": 0,
		"avgRxR": 0,
		"avgSignal": {},
		"totalTxFP": 0,
		"stats": [\
			{\
				"mac": "",\
				"wireless": true,\
				"time": 0,\
				"down": 0,\
				"up": 0,\
				"downRate": 0,\
				"upRate": 0,\
				"txR": 0,\
				"rxR": 0,\
				"signal": 0,\
				"radioId": 0,\
				"txFP": 0,\
				"multiLinks": [\
					{\
						"radioId": 0,\
						"signal": 0\
					}\
				]\
			}\
		]
	}
}
```

Get VIGI device link topology


POST/openapi/v1/{omadacId}/sites/{siteId}/vigis/{vigiMac}/vigi-link-topology

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get VIGI device link topology.

The interface requires one of the permissions:

Site Device Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"nodeType": 0,\
			"clientNode": {\
				"mac": "",\
				"name": "",\
				"ip": "",\
				"wireless": true,\
				"guest": true,\
				"clientType": "",\
				"upDeviceType": 0,\
				"authStatus": 0,\
				"model": "",\
				"manager": true,\
				"devTxRate": 0,\
				"devRxRate": 0,\
				"healthScore": 0,\
				"upOswInfo": {\
					"port": 0,\
					"standardPort": "",\
					"lagId": "",\
					"linkSpeed": 0,\
					"duplex": 0,\
					"trafficDown": 0,\
					"trafficUp": 0\
				},\
				"upApInfo": {\
					"port": 0,\
					"name": "",\
					"lagId": 0,\
					"channel": 0,\
					"ssid": "",\
					"radio": 0,\
					"support5g2": true,\
					"rssi": 0,\
					"trafficDown": 0,\
					"trafficUp": 0,\
					"txRate": 0,\
					"rxRate": 0,\
					"multiLink": [\
						{\
							"radioId": 0,\
							"channel": 0,\
							"rssi": 0,\
							"trafficDown": 0,\
							"trafficUp": 0,\
							"txRate": 0,\
							"rxRate": 0\
						}\
					]\
				}\
			},\
			"deviceNode": {\
				"deviceType": 0,\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"showModel": "",\
				"ip": "",\
				"ipv6List": [],\
				"status": 0,\
				"statusCategory": 0,\
				"devTxRate": 0,\
				"devRxRate": 0,\
				"stackGroup": true,\
				"stackId": "",\
				"healthScore": 0,\
				"apInfo": {\
					"wiredUpLink": {\
						"upPort": {\
							"port": "",\
							"standardPort": "",\
							"lagId": "",\
							"mlagId": "",\
							"poePower": 0,\
							"poePowerDecimal": 0,\
							"lagPorts": [],\
							"mlagPorts": [],\
							"standardLagPorts": [],\
							"standardMlagPorts": [],\
							"name": "",\
							"multiSwitchNum": 0,\
							"uplinkName": "",\
							"multiSwitchRole": 0\
						},\
						"upLinkPort": {\
							"port": "",\
							"standardPort": "",\
							"lagId": "",\
							"mlagId": "",\
							"poePower": 0,\
							"poePowerDecimal": 0,\
							"lagPorts": [],\
							"mlagPorts": [],\
							"standardLagPorts": [],\
							"standardMlagPorts": [],\
							"name": "",\
							"multiSwitchNum": 0,\
							"uplinkName": "",\
							"multiSwitchRole": 0\
						},\
						"linkSpeed": 0,\
						"duplex": 0,\
						"rxDropPkts": 0,\
						"txDropPkts": 0,\
						"rxErrPkts": 0,\
						"txErrPkts": 0\
					},\
					"wirelessUpLink": {\
						"txRate": "",\
						"rxRate": "",\
						"rssi": 0,\
						"rssiPercent": 0,\
						"rxDropPkts": 0,\
						"txDropPkts": 0,\
						"rxErrPkts": 0,\
						"txErrPkts": 0,\
						"snr": 0\
					}\
				},\
				"switchInfo": {\
					"upPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"upLinkPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"linkSpeed": 0,\
					"duplex": 0,\
					"rxDropPkts": 0,\
					"txDropPkts": 0,\
					"rxErrPkts": 0,\
					"txErrPkts": 0\
				},\
				"gatewayInfo": {\
					"upPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"upLinkPort": {\
						"port": "",\
						"standardPort": "",\
						"lagId": "",\
						"mlagId": "",\
						"poePower": 0,\
						"poePowerDecimal": 0,\
						"lagPorts": [],\
						"mlagPorts": [],\
						"standardLagPorts": [],\
						"standardMlagPorts": [],\
						"name": "",\
						"multiSwitchNum": 0,\
						"uplinkName": "",\
						"multiSwitchRole": 0\
					},\
					"linkSpeed": 0,\
					"duplex": 0,\
					"rxDropPkts": 0,\
					"txDropPkts": 0,\
					"rxErrPkts": 0,\
					"txErrPkts": 0\
				},\
				"ap": true,\
				"osg": true,\
				"osw": true\
			},\
			"client": true\
		}\
	]
}
```

Get VIGI device connection histories


GET/openapi/v1/{omadacId}/sites/{siteId}/vigis/{vigiMac}/vigi-connection

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get VIGI device connection histories.

The interface requires one of the permissions:

Site Device Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"connections": [\
			{\
				"start": 0,\
				"end": 0,\
				"duration": 0\
			}\
		],
		"roamings": [\
			{\
				"start": 0,\
				"duration": 0\
			}\
		]
	}
}
```

Get VIGI device timeline events


GET/openapi/v1/{omadacId}/sites/{siteId}/vigis/{vigiMac}/vigi-timeline

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get VIGI device timeline events.

The interface requires one of the permissions:

Site Device Manager View Only

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"mac": "",\
			"start": 0,\
			"end": 0,\
			"events": [\
				{\
					"time": 0,\
					"eventType": 0,\
					"content": "",\
					"attributes": {}\
				}\
			]\
		}\
	]
}
```

Get VIGI device statistical data details at a 5-minute interval.


POST/openapi/v1/{omadacId}/sites/{siteId}/vigi-stat-detail/{vigiMac}/5Min

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


Get VIGI device statistical data details at a 5-minute interval.

The interface requires one of the permissions:

Site Device Manager View Only

Example


```
{
  "startSec": 0,
  "endSec": 0
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalDown": 0,
		"totalUp": 0,
		"avgDownRate": 0,
		"avgUpRate": 0,
		"avgTxR": 0,
		"avgRxR": 0,
		"avgSignal": {},
		"totalTxFP": 0,
		"stats": [\
			{\
				"mac": "",\
				"wireless": true,\
				"time": 0,\
				"down": 0,\
				"up": 0,\
				"downRate": 0,\
				"upRate": 0,\
				"txR": 0,\
				"rxR": 0,\
				"signal": 0,\
				"radioId": 0,\
				"txFP": 0,\
				"multiLinks": [\
					{\
						"radioId": 0,\
						"signal": 0\
					}\
				]\
			}\
		]
	}
}
```

Get VIGI device statistical data details at a hourly interval.


POST/openapi/v1/{omadacId}/sites/{siteId}/vigi-stat-detail/{vigiMac}/hourly

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


Get VIGI device statistical data details at a hourly interval.

The interface requires one of the permissions:

Site Device Manager View Only

Example


```
{
  "startSec": 0,
  "endSec": 0
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalDown": 0,
		"totalUp": 0,
		"avgDownRate": 0,
		"avgUpRate": 0,
		"avgTxR": 0,
		"avgRxR": 0,
		"avgSignal": {},
		"totalTxFP": 0,
		"stats": [\
			{\
				"mac": "",\
				"wireless": true,\
				"time": 0,\
				"down": 0,\
				"up": 0,\
				"downRate": 0,\
				"upRate": 0,\
				"txR": 0,\
				"rxR": 0,\
				"signal": 0,\
				"radioId": 0,\
				"txFP": 0,\
				"multiLinks": [\
					{\
						"radioId": 0,\
						"signal": 0\
					}\
				]\
			}\
		]
	}
}
```

Get VIGI device statistical data details at a daily interval.


POST/openapi/v1/{omadacId}/sites/{siteId}/vigi-stat-detail/{vigiMac}/daily

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


Get VIGI device statistical data details at a daily interval.

The interface requires one of the permissions:

Site Device Manager View Only

Example


```
{
  "startSec": 0,
  "endSec": 0
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalDown": 0,
		"totalUp": 0,
		"avgDownRate": 0,
		"avgUpRate": 0,
		"avgTxR": 0,
		"avgRxR": 0,
		"avgSignal": {},
		"totalTxFP": 0,
		"stats": [\
			{\
				"mac": "",\
				"wireless": true,\
				"time": 0,\
				"down": 0,\
				"up": 0,\
				"downRate": 0,\
				"upRate": 0,\
				"txR": 0,\
				"rxR": 0,\
				"signal": 0,\
				"radioId": 0,\
				"txFP": 0,\
				"multiLinks": [\
					{\
						"radioId": 0,\
						"signal": 0\
					}\
				]\
			}\
		]
	}
}
```

Get global client statistics by device.


POST/openapi/v1/{omadacId}/clients/stat/devices

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


Get global client statistics by device.

The interface requires one of the permissions:

Site Device Manager View Only

Example


```
{
  "devices": [\
    {\
      "mac": "",\
      "siteId": ""\
    }\
  ]
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"siteId": "",\
			"mac": "",\
			"clientNum": 0,\
			"clientNum2g": 0,\
			"clientNum5g": 0,\
			"clientNum5g2": 0,\
			"clientNum6g": 0\
		}\
	]
}
```

Get msp client statistics by device.


POST/openapi/v1/msp/{mspId}/clients/stat/devices

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


Get Msp level client statistics by device.

The interface requires one of the permissions:

MSP Device Manager View Only

Example


```
{
  "devices": [\
    {\
      "mac": "",\
      "siteId": "",\
      "customerId": ""\
    }\
  ]
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"customerId": "",\
			"siteId": "",\
			"mac": "",\
			"clientNum": 0,\
			"clientNum2g": 0,\
			"clientNum5g": 0,\
			"clientNum5g2": 0,\
			"clientNum6g": 0\
		}\
	]
}
```

# Client Insight

Get client past connection list


GET/openapi/v1/{omadacId}/sites/{siteId}/insight/past-connection

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client past connection list.

The interface requires one of the permissions:

Site Insight Manager View Only

Site Clients Manager View Only

Params


Status


Response Params


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
				"mac": "",\
				"download": 0,\
				"upload": 0,\
				"duration": 0,\
				"firstSeen": 0,\
				"lastSeen": 0,\
				"name": "",\
				"ssid": "",\
				"port": 0,\
				"guest": true,\
				"deviceName": "",\
				"associationTime": 0,\
				"ip": "",\
				"ipv6List": [],\
				"authInfo": [\
					{\
						"authType": 0,\
						"info": ""\
					}\
				]\
			}\
		]
	}
}
```

Get known clients list


GET/openapi/v1/{omadacId}/sites/{siteId}/insight/clients

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get known clients list.

The interface requires one of the permissions:

Site Insight Manager View Only

Site Clients Manager View Only

Params


Status


Response Params


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
				"name": "",\
				"mac": "",\
				"wireless": true,\
				"guest": true,\
				"download": 0,\
				"upload": 0,\
				"duration": 0,\
				"lastSeen": 0,\
				"block": true,\
				"manager": true,\
				"lockToAp": true,\
				"blockDisable": true,\
				"vid": 0\
			}\
		]
	}
}
```

Get client activity


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-activity

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client activity with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"newEapClientNum": 0,\
			"newSwitchClientNum": 0,\
			"activeEapClientNum": 0,\
			"activeSwitchClientNum": 0,\
			"disconnectEapClientNum": 0,\
			"disconnectSwitchClientNum": 0,\
			"time": 0\
		}\
	]
}
```

Get past client number.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/past-client-num

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get past client number with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"total": 0,
		"wiredClient": 0,
		"wirelessClient": 0
	}
}
```

Get client distribution.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-distribution

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get client distribution with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"eapDistribution": {
			"eaps": [\
				{\
					"name": "",\
					"totalClients": 0,\
					"totalDistribution": 0,\
					"clients2g": 0,\
					"distribution2g": 0,\
					"clients5g": 0,\
					"distribution5g": 0,\
					"clients6g": 0,\
					"distribution6g": 0,\
					"wiredClients": 0,\
					"wiredDistribution": 0\
				}\
			],
			"others": {
				"name": "",
				"totalClients": 0,
				"totalDistribution": 0,
				"clients2g": 0,
				"distribution2g": 0,
				"clients5g": 0,
				"distribution5g": 0,
				"clients6g": 0,
				"distribution6g": 0,
				"wiredClients": 0,
				"wiredDistribution": 0
			},
			"totalEapClients": 0,
			"totalEapDistribution": 0
		},
		"switchDistribution": {
			"switches": [\
				{\
					"name": "",\
					"totalClients": 0,\
					"totalDistribution": 0\
				}\
			],
			"others": {
				"name": "",
				"totalClients": 0,
				"totalDistribution": 0
			},
			"totalSwitchClients": 0,
			"totalSwitchDistribution": 0
		}
	}
}
```

Get most active client.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/active-clients

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get most active clients with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"name": "",\
			"wireless": true,\
			"type": "",\
			"model": "",\
			"mac": "",\
			"totalTraffic": 0\
		}\
	]
}
```

Get device client 5 min stat.


POST/openapi/v1/{omadacId}/sites/{siteId}/stat/{deviceMac}/client-stat-5min

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


Obtain the 5-minute sampling statistics of the clients.

The interface requires one of the permissions:

Site Statics Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": []
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"clients": 0,\
			"time": 0\
		}\
	]
}
```

Get the msp overview diagram of client.


GET/openapi/v1/msp/{mspId}/dashboard/client/overview-diagram

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get the msp overview diagram of client

The interface requires one of the permissions:

MSP Dashboard View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalClientNum": 0,
		"wiredUser": 0,
		"wirelessUser": 0,
		"wirelessGuest": 0
	}
}
```

Get the Msp customers' client count.


POST/openapi/v1/msp/{mspId}/customers/client-count

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


Get the Msp customers' client count.

The interface requires one of the permissions:

MSP Dashboard View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Example


```
{
  "customerIds": []
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"customerId": "",\
			"wiredUser": 0,\
			"wirelessUser": 0,\
			"wirelessGuest": 0\
		}\
	]
}
```

Get current client number.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/current-client-num

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get current client number with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"total": 0,
		"wiredClient": 0,
		"wirelessClient": 0
	}
}
```

Get clients ssid distribution.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-ssid-distribution

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients ssid distribution with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"total": 0,
		"wiredClient": 0,
		"wirelessClient": 0
	}
}
```

Get clients freq distribution.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-freq-distribution

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients freq distribution with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"total": 0,
		"wiredClient": 0,
		"wirelessClient": 0
	}
}
```

Get longest client uptime.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/longest-uptime

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get longest client uptime with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"total": 0,
		"wiredClient": 0,
		"wirelessClient": 0
	}
}
```

Get clients association activities.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-association-activities

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients association activities with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"total": 0,
		"wiredClient": 0,
		"wirelessClient": 0
	}
}
```

Get clients rssi distribution.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-rssi-distribution

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients rssi distribution with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"lessThan72": 0,
		"from71To65": 0,
		"from65To55": 0,
		"from55To45": 0,
		"moreThan45": 0,
		"distribution2G": {
			"lessThan72": 0,
			"from71To65": 0,
			"from65To55": 0,
			"from55To45": 0,
			"moreThan45": 0
		},
		"distribution5G": {
			"lessThan72": 0,
			"from71To65": 0,
			"from65To55": 0,
			"from55To45": 0,
			"moreThan45": 0
		},
		"distribution6G": {
			"lessThan72": 0,
			"from71To65": 0,
			"from65To55": 0,
			"from55To45": 0,
			"moreThan45": 0
		}
	}
}
```

Get clients bubble.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/clients-bubble

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients bubble with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"name": "",\
			"type": "",\
			"mac": "",\
			"apName": "",\
			"traffic": 0,\
			"trafficPercent": 0,\
			"upload": 0,\
			"uploadPercent": 0,\
			"download": 0,\
			"downloadPercent": 0,\
			"healthScore": 0,\
			"txRate": 0,\
			"snr": 0,\
			"wifiProtocol": "",\
			"rssi": 0,\
			"signalLevel": 0,\
			"channel": 0,\
			"radioId": 0,\
			"bandWidth": 0\
		}\
	]
}
```

Get ap density.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/ap-density

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get ap density with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"existAp": true,
		"existApClient": true,
		"lessThan90": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from90To85": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from85To80": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from80To75": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from75To70": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from70To65": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from65To60": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from60To55": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from55To50": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from50To45": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from45To40": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from40To35": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"from35To30": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		],
		"moreThan30": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"type": "",\
				"modelVersion": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"clientsCount": 0,\
				"healthScore": 0,\
				"signalLevel": 0,\
				"rssi": 0\
			}\
		]
	}
}
```

Get stack client stat.


POST/openapi/v1/{omadacId}/sites/{siteId}/stat/stacks/{stackId}/client-stat

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


Obtain the sampling statistics of the clients.

The interface requires one of the permissions:

Site Statics Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": []
}
```

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"clients": 0,\
			"time": 0\
		}\
	]
}
```

Get clients signal distribution.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-signal-distribution

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients signal distribution with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"poorSignal": {
			"totalClients": 0,
			"clientsPercent": 0,
			"clients2g": 0,
			"clients5g": 0,
			"clients6g": 0
		},
		"weakSignal": {
			"totalClients": 0,
			"clientsPercent": 0,
			"clients2g": 0,
			"clients5g": 0,
			"clients6g": 0
		},
		"averageSignal": {
			"totalClients": 0,
			"clientsPercent": 0,
			"clients2g": 0,
			"clients5g": 0,
			"clients6g": 0
		},
		"stableSignal": {
			"totalClients": 0,
			"clientsPercent": 0,
			"clients2g": 0,
			"clients5g": 0,
			"clients6g": 0
		},
		"strongSignal": {
			"totalClients": 0,
			"clientsPercent": 0,
			"clients2g": 0,
			"clients5g": 0,
			"clients6g": 0
		}
	}
}
```

Get clients association time distribution.


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/client-association-time-distribution

produces
\[\
"application/x-www-form-urlencoded"\
\]
consumes
\[\
"\*/\*"\
\]


Note


Get clients association time distribution with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Params


Status


Response Params


Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"lessThan2sNum": 0,
		"from2To4sNum": 0,
		"from4To6sNum": 0,
		"from6To8sNum": 0,
		"from8To10sNum": 0,
		"moreThan10sNum": 0,
		"fails": 0,
		"lessThan10sPercent": 0
	}
}
```