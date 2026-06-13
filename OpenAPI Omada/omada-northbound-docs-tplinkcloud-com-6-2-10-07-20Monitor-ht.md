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

07 Monitor

### GroupUrl

/v3/api-docs/07 Monitor

### GroupLocation

/v3/api-docs/07 Monitor

### count

POST


20

PUT


2

GET


29

DELETE


2

PATCH


2

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#knife4jDocument)
- [Report v2](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#Report%20v2)
  - [Get report all tabs](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getAllTabs)
  - [Get cards info](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getCardsInfo)
  - [Add new tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#addTabNetworkReport)
  - [Update tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#updateTabNetworkReport)
  - [Batch delete tabs](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#deleteTabNetworkReport)
  - [Get all cards in a tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getTabById)
  - [Reorder the tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#recordTabNetworkReport)
  - [Export report now](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#exportNowLocal)
  - [Export report now for email](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#exportNowEmailV2)
  - [Export report once later](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#exportLaterEmailV2)
  - [Get schedule time info](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getScheduleTimeInfoV2)
  - [Export report for scheduler](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#emailReportScheduleV2)
- [Statistic](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#Statistic)
  - [Get switch statistics](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getSwitchStat)
  - [Get switch statistics chart](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getSwitchStatChart)
  - [Get olt statistics chart](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getOltStatChart)
  - [Get switch stack statistics](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getOswStackDetailStat)
  - [Get switch ranking cards](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getOswRankingCards)
  - [Get device statistic data 5 min](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getDevice5MinStatistic)
  - [Get device statistic data hourly](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getDeviceHourlyStatistic)
  - [Get device statistic data daily](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getDeviceDailyStatistic)
  - [Get stack statistics chart](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getStackStatChart)
- [Dashboard](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#Dashboard)
  - [Get tab without overall tab list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#listTabs)
  - [Get tab list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#listAllTabs)
  - [Create new tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#createTab)
  - [Delete an existing tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#removeTab)
  - [Modify an existing tab](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#updateTab)
  - [Batch set tab config](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#batchConfigTab)
  - [Get site overview diagram info](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getOverview)
  - [Get channel distribution and usage](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getChannels)
  - [Get the most active eap list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getActiveAps)
  - [Get most active switch list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getActiveSwitches)
  - [Get wifi summary](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getWifiSummary)
  - [Get switch summary](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getSwitchSummary)
  - [Get traffic distribution](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getTrafficDistribution)
  - [Get traffic activity](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getTrafficActivities)
  - [Get retried rate and dropped rate](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getRetryAndDroppedRate)
  - [Get top device cpu usage](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getTopCpuUsageWithTimeRange)
  - [Get top device memory usage](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getTopMemoryUsageWithTimeRange)
  - [Get top interference](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getInterference)
  - [Get poe usage](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getPoeUsage)
  - [Get isp load info](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getIspLoad)
  - [Get grid dashboard tunnel statistic list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getGridDashboardTunnelStats)
  - [Get grid dashboard lpsec tunnel statistic list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getGridDashboardIpsecTunnelStats)
  - [Get grid dashboard open vpn tunnel statistic list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getGridDashboardOpenVpnTunnelStats)
  - [Get grid dashboard open network activity statistic list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getAllNetworkActivity)
  - [Get network overview](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getCardTopology)
  - [Get site dashboard isp load inform](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getGatewayIspLoad)
  - [Set site dashboard wan bandwidth](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#configBandwidthForWanPorts)
  - [Get Top 5 Aps](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getTop5Aps)
  - [Get the most active eap list](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getActiveApsV2)
  - [Start Speed Test](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#startSpeedTestV2)
  - [Get Speed Test Result](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getSpeedTestV2Result)
  - [Get date list of speed test results](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#getSpeedTestV2ResultDateList)
- [Network Report](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#Network%20Report)
  - [Email Network Report Schedule](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#emailNetworkReportSchedule)
  - [Email Network Report Later](https://omada-northbound-docs.tplinkcloud.com/6.2.10/07%20Monitor.html#emailNetworkReportLater)

# Report v2

Get report all tabs


GET/openapi/v1/{omadacId}/sites/{siteId}/report/allTabs

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get report all tabs

The interface requires one of the permissions:

Site Network Report Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30212 - Unable to get the tab module information. Please try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListReportTab |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | ReportTab |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"tabId": "",\
			"name": "",\
			"cards": [],\
			"cardGroupList": [\
				{\
					"cardGroupName": "",\
					"cardList": []\
				}\
			],\
			"type": 0,\
			"status": 0,\
			"rank": 0,\
			"defaultKey": "",\
			"defaultTab": "",\
			"cancelCards": []\
		}\
	]
}
```

Get cards info


POST/openapi/v1/{omadacId}/sites/{siteId}/report/cards

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


Get cards info by card names

The interface requires one of the permissions:

Site Network Report Manager View Only

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30212 - Unable to get the tab module information. Please try again later.

Example


```
{
  "omadacId": "",
  "siteId": "",
  "start": 0,
  "end": 0,
  "cards": [\
    {\
      "type": "overviewSummary",\
      "topK": 5\
    }\
  ],
  "requestToken": "",
  "token": ""
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| reportCardQueryVO | ReportCardQueryVO | body | true | ReportCardQueryVO | ReportCardQueryVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseCardInfoVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | CardInfoVO | CardInfoVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"overviewSummary": {
			"siteHealthScore": 0,
			"wifiHealthScore": 0,
			"deviceHealthScore": 0,
			"clientHealthScore": 0,
			"wanHealthScore": 0,
			"totalDevices": 0,
			"totalGateways": 0,
			"totalSwitches": 0,
			"totalAps": 0,
			"totalOlts": 0,
			"totalNvrs": 0,
			"totalIpcs": 0,
			"wiredClients": 0,
			"wirelessClients": 0,
			"totalClients": 0,
			"totalTraffic": 0,
			"wiredTraffic": 0,
			"wirelessTraffic": 0
		},
		"trafficSummary": {
			"totalTraffic": 0,
			"txTraffic": 0,
			"rxTraffic": 0,
			"trafficSummary": [\
				{\
					"time": 0,\
					"txData": 0,\
					"rxData": 0,\
					"totalData": 0\
				}\
			]
		},
		"trafficDistribution": {
			"totalTraffic": 0,
			"wiredTraffic": 0,
			"wirelessTraffic": 0,
			"trafficDistribution": [\
				{\
					"time": 0,\
					"wirelessData": 0,\
					"wiredData": 0,\
					"totalData": 0\
				}\
			]
		},
		"alertSummary": {
			"alertSummary": {
				"totalGradeAlerts": 0,
				"totalTypeAlerts": 0,
				"infoAlerts": 0,
				"errorAlerts": 0,
				"warningAlerts": 0,
				"clientAlerts": 0,
				"operationAlerts": 0,
				"deviceAlerts": 0,
				"systemAlerts": 0,
				"criticalAlerts": 0
			},
			"alertTrend": [\
				{\
					"time": 0,\
					"count": 0\
				}\
			]
		},
		"deviceStatus": [\
			{\
				"time": 0,\
				"total": 0,\
				"online": 0,\
				"offline": 0\
			}\
		],
		"deviceHealthTrend": [\
			{\
				"time": 0,\
				"total": 0,\
				"good": 0,\
				"poor": 0,\
				"noData": 0\
			}\
		],
		"network": {
			"trafficSummary": {},
			"trafficDistribution": {},
			"clientTraffic": {
				"totalTraffic": 0,
				"wiredClientsTraffic": 0,
				"clients2gTraffic": 0,
				"clients5gTraffic": 0,
				"clients6gTraffic": 0,
				"wiredClientsNum": 0,
				"clients2gNum": 0,
				"clients5gNum": 0,
				"clients6gNum": 0
			},
			"upgradeTime": 0
		},
		"gatewaySummary": {
			"gatewayAlert": {
				"totalAlerts": 0,
				"infoAlerts": 0,
				"warningAlerts": 0,
				"errorAlerts": 0,
				"criticalAlerts": 0
			},
			"gatewayUltilization": [\
				{\
					"time": 0,\
					"cpuUtil": 0,\
					"memUtil": 0\
				}\
			]
		},
		"ispLoad": [\
			{\
				"portId": 0,\
				"portName": "",\
				"defaultWan": true,\
				"data": [\
					{\
						"totalRate": 0,\
						"latency": 0,\
						"time": 0,\
						"totalTraffic": 0,\
						"upTraffic": 0,\
						"downTraffic": 0\
					}\
				]\
			}\
		],
		"switchAlertReboot": {
			"switchAlert": {
				"totalAlerts": 0,
				"infoAlerts": 0,
				"warningAlerts": 0,
				"errorAlerts": 0,
				"criticalAlerts": 0
			},
			"switchRebootTimes": {
				"totalSwitchTimes": 0,
				"firstSwitch": {
					"name": "",
					"rebootTimes": 0
				},
				"secondSwitch": {
					"name": "",
					"rebootTimes": 0
				},
				"thirdSwitch": {
					"name": "",
					"rebootTimes": 0
				},
				"fourthSwitch": {
					"name": "",
					"rebootTimes": 0
				},
				"fifthSwitch": {
					"name": "",
					"rebootTimes": 0
				},
				"otherSwitch": {
					"name": "",
					"rebootTimes": 0
				}
			}
		},
		"topSwitchByTrafficAndPoePower": {
			"topSwitchByTraffic": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topSwitchByPoePower": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			]
		},
		"topSwitchCpuMemory": {
			"topSwitchCpu": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topSwitchMemory": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			]
		},
		"poePowerTrend": [\
			{\
				"time": 0,\
				"poePowerTotal": 0\
			}\
		],
		"switchStatus": [\
			{\
				"time": 0,\
				"total": 0,\
				"online": 0,\
				"offline": 0\
			}\
		],
		"switchHealthTrend": [\
			{\
				"time": 0,\
				"total": 0,\
				"good": 0,\
				"poor": 0,\
				"noData": 0\
			}\
		],
		"wanHealthTrend": [\
			{\
				"portId": "",\
				"portName": "",\
				"data": [\
					{\
						"time": 0,\
						"score": 0\
					}\
				]\
			}\
		],
		"wirelessTraffic": {
			"wirelessSummary": {
				"total": 0,
				"rxTotal": 0,
				"txTotal": 0,
				"wireless2gTotal": 0,
				"wireless2gRx": 0,
				"wireless2gTx": 0,
				"wireless5gTotal": 0,
				"wireless5gRx": 0,
				"wireless5gTx": 0,
				"wireless6gTotal": 0,
				"wireless6gRx": 0,
				"wireless6gTx": 0
			},
			"wireless2gTraffic": [\
				{\
					"time": 0,\
					"totalTraffic": 0,\
					"rxTraffic": 0,\
					"txTraffic": 0,\
					"wirelessCount": 0,\
					"wiredCount": 0\
				}\
			],
			"wireless5gTraffic": [\
				{\
					"time": 0,\
					"totalTraffic": 0,\
					"rxTraffic": 0,\
					"txTraffic": 0,\
					"wirelessCount": 0,\
					"wiredCount": 0\
				}\
			],
			"wireless6gTraffic": [\
				{\
					"time": 0,\
					"totalTraffic": 0,\
					"rxTraffic": 0,\
					"txTraffic": 0,\
					"wirelessCount": 0,\
					"wiredCount": 0\
				}\
			],
			"totalTraffic": [\
				{\
					"time": 0,\
					"totalTraffic": 0,\
					"rxTraffic": 0,\
					"txTraffic": 0,\
					"wirelessCount": 0,\
					"wiredCount": 0\
				}\
			]
		},
		"wifiHealth": {
			"accessTimeScore": 0,
			"channelUtilScore": 0,
			"channelInterUtilScore": 0,
			"accessCapacityScore": 0,
			"rssiScore": 0
		},
		"topApByTrafficAndClient": {
			"topApByTrafficMax": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topApByTrafficMin": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topApByClientMax": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topApByClientMin": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			]
		},
		"topApByCpuAndMemory": {
			"topApByCpuUtility": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topApByMemoryUtility": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			]
		},
		"topApByInterference": {
			"topAp2gInterList": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"type": "",\
					"interference": 0,\
					"interUtil": 0,\
					"txUtil": 0,\
					"rxUtil": 0\
				}\
			],
			"topAp5gInterList": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"type": "",\
					"interference": 0,\
					"interUtil": 0,\
					"txUtil": 0,\
					"rxUtil": 0\
				}\
			],
			"topAp6gInterList": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"type": "",\
					"interference": 0,\
					"interUtil": 0,\
					"txUtil": 0,\
					"rxUtil": 0\
				}\
			]
		},
		"topApByRtAndDrop": {
			"topApByRt": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			],
			"topApByDrop": [\
				{\
					"device": "",\
					"model": "",\
					"modelVersion": "",\
					"ip": "",\
					"modelType": "",\
					"type": "",\
					"status": 0,\
					"health": 0,\
					"mac": "",\
					"util": 0,\
					"traffic": 0,\
					"ratio": 0,\
					"poePower": 0,\
					"clientCount": 0\
				}\
			]
		},
		"topSsidByTraffic": [\
			{\
				"ssid": "",\
				"security": "",\
				"channel": "",\
				"traffic": 0,\
				"trafficRatio": 0,\
				"clientCount": 0,\
				"averageSingalStrength": 0\
			}\
		],
		"apStatus": [\
			{\
				"time": 0,\
				"total": 0,\
				"online": 0,\
				"offline": 0\
			}\
		],
		"wirelessTrafficSingle": {
			"totalTraffic": 0,
			"rxTraffic": 0,
			"txTraffic": 0,
			"trafficTrend": [\
				{\
					"time": 0,\
					"totalTraffic": 0,\
					"rxTraffic": 0,\
					"txTraffic": 0,\
					"wirelessCount": 0,\
					"wiredCount": 0\
				}\
			]
		},
		"apHealth": [\
			{\
				"time": 0,\
				"total": 0,\
				"good": 0,\
				"poor": 0,\
				"noData": 0\
			}\
		],
		"clientTraffic": {
			"totalTraffic": 0,
			"wiredClientsTraffic": 0,
			"clients2gTraffic": 0,
			"clients5gTraffic": 0,
			"clients6gTraffic": 0,
			"wiredClientsNum": 0,
			"clients2gNum": 0,
			"clients5gNum": 0,
			"clients6gNum": 0
		},
		"clientConnectionTrend": {
			"clientConnectionSummary": {
				"totalClients": 0,
				"wirelessClients": 0,
				"wiredClients": 0
			},
			"clientConnectionTrend": [\
				{\
					"time": 0,\
					"totalClients": 0,\
					"wirelessClients": 0,\
					"wiredClients": 0\
				}\
			]
		},
		"clientsOverview": {
			"totalClientsNum": 0,
			"clients2gNum": 0,
			"clients5gNum": 0,
			"clients6gNum": 0,
			"wiredClientsNum": 0,
			"wirelessClientsNum": 0,
			"averageClientNum": 0,
			"averageClientTraffic": 0,
			"clientsSsidDistribution": {
				"firstSsid": {
					"ssid": "",
					"clientsNum": 0
				},
				"secondSsid": {
					"ssid": "",
					"clientsNum": 0
				},
				"thirdSsid": {
					"ssid": "",
					"clientsNum": 0
				},
				"fourthSsid": {
					"ssid": "",
					"clientsNum": 0
				},
				"fifthSsid": {
					"ssid": "",
					"clientsNum": 0
				},
				"otherSsid": {
					"ssid": "",
					"clientsNum": 0
				}
			}
		},
		"clientsAssociationActivities": [\
			{\
				"lessThan1sNum": 0,\
				"from1To3sNum": 0,\
				"from3To12sNum": 0,\
				"moreThan12sNum": 0,\
				"time": 0\
			}\
		],
		"clientsWithOnboardingTimes": {
			"lessThan2sNum": 0,
			"from2To4sNum": 0,
			"from4To6sNum": 0,
			"from6To8sNum": 0,
			"from8To10sNum": 0,
			"moreThan10sNum": 0,
			"fails": 0,
			"lessThan10sPercent": 0
		},
		"topClient": {
			"activeClients": [\
				{\
					"name": "",\
					"mac": "",\
					"type": "",\
					"traffic": 0,\
					"trafficPercent": 0\
				}\
			],
			"longestUptimeClients": [\
				{\
					"name": "",\
					"mac": "",\
					"type": "",\
					"totalDuration": 0\
				}\
			]
		},
		"appCategories": {
			"categories": [\
				{\
					"familyId": 0,\
					"familyName": "",\
					"traffic": 0,\
					"percent": 0\
				}\
			],
			"totalTraffic": 0
		},
		"topApplicationByTraffic": [\
			{\
				"applicationId": 0,\
				"applicationName": "",\
				"familyId": 0,\
				"familyName": "",\
				"traffic": 0,\
				"trafficPercent": 0,\
				"down": 0,\
				"up": 0\
			}\
		],
		"internet": {
			"totalTraffic": 0,
			"totalUpload": 0,
			"totalDownload": 0,
			"activityList": [\
				{\
					"time": 0,\
					"upload": 0,\
					"download": 0,\
					"wiredCount": 0,\
					"wirelessCount": 0,\
					"totalData": 0\
				}\
			],
			"existData": true,
			"totalWiredCount": 0,
			"totalWirelessCount": 0,
			"totalClientCount": 0
		},
		"clientHealthTrend": [\
			{\
				"time": 0,\
				"total": 0,\
				"good": 0,\
				"poor": 0,\
				"noData": 0\
			}\
		]
	}
}
```

Add new tab


POST/openapi/v1/{omadacId}/sites/{siteId}/report/tab

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


Add a new tab by user

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30206 - Adding failed. Please try again later.

Example


```
{
  "tabId": "",
  "name": "",
  "cards": [],
  "cardGroupList": [\
    {\
      "cardGroupName": "",\
      "cardList": []\
    }\
  ],
  "type": 0,
  "status": 0,
  "rank": 0,
  "defaultKey": "",
  "defaultTab": "",
  "cancelCards": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| reportTab | ReportTab | body | true | ReportTab | ReportTab |

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

Update tab


PUT/openapi/v1/{omadacId}/sites/{siteId}/report/tab

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


Update the tab config

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30207 - Editing failed. Please try again later.

Example


```
{
  "tabId": "",
  "name": "",
  "cards": [],
  "cardGroupList": [\
    {\
      "cardGroupName": "",\
      "cardList": []\
    }\
  ],
  "type": 0,
  "status": 0,
  "rank": 0,
  "defaultKey": "",
  "defaultTab": "",
  "cancelCards": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| reportTab | ReportTab | body | true | ReportTab | ReportTab |

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

Batch delete tabs


DELETE/openapi/v1/{omadacId}/sites/{siteId}/report/tab/{tabIds}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Batch delete the tabs by id list

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30211 - Deleting failed. Please try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| tabIds | tab ID list | path | true | string |  |

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

Get all cards in a tab


GET/openapi/v1/{omadacId}/sites/{siteId}/report/{tabId}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get all cards in a tab

The interface requires one of the permissions:

Site Network Report Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30212 - Unable to get the tab module information. Please try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| tabId | tab ID | path | true | string |  |

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

Reorder the tab


PUT/openapi/v1/{omadacId}/sites/{siteId}/report/reorder

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


Reorder the tab

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-30207 - Editing failed. Please try again later.

Example


```
[\
  {\
    "tabId": "",\
    "name": "",\
    "cards": [],\
    "cardGroupList": [\
      {\
        "cardGroupName": "",\
        "cardList": []\
      }\
    ],\
    "type": 0,\
    "status": 0,\
    "rank": 0,\
    "defaultKey": "",\
    "defaultTab": "",\
    "cancelCards": []\
  }\
]
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| reportTabs | ReportTab | body | true | array | ReportTab |

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

Export report now


POST/openapi/v2/{omadacId}/files/sites/{siteId}/report/export-now-local

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


Export report

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "start": 0,
  "end": 0,
  "reportName": "",
  "reportType": 0,
  "tabIdList": [],
  "emailList": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| reportExportV2 | ReportExportV2 | body | true | ReportExportV2 | ReportExportV2 |

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

Export report now for email


POST/openapi/v2/{omadacId}/sites/{siteId}/report/export-now-email

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


Export report now for email

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "start": 0,
  "end": 0,
  "reportName": "",
  "reportType": 0,
  "tabIdList": [],
  "emailList": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| reportExportV2 | ReportExportV2 | body | true | ReportExportV2 | ReportExportV2 |

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

Export report once later


POST/openapi/v2/{omadacId}/sites/{siteId}/report/export-later-email

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


Export report once later

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "enable": true,
  "tab": 0,
  "tabIdList": [],
  "cards": "",
  "reportName": "",
  "reportType": 0,
  "emailList": [],
  "minute": 0,
  "hour": 0,
  "time": 0,
  "start": 0,
  "end": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| networkReportScheduleLaterVO | NetworkReportScheduleLaterVO | body | true | NetworkReportScheduleLaterVO | NetworkReportScheduleLaterVO |

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

Get schedule time info


GET/openapi/v2/{omadacId}/sites/{siteId}/report/export-schedule-email

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get schedule time info

The interface requires one of the permissions:

Site Network Report Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

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

Export report for scheduler


POST/openapi/v2/{omadacId}/sites/{siteId}/report/export-schedule-email

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


Export report for scheduler

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "enable": true,
  "tab": 0,
  "tabIdList": [],
  "reportName": "",
  "reportType": 0,
  "emailList": [],
  "time": 0,
  "cards": "",
  "timingType": 0,
  "hour": 0,
  "minute": 0,
  "dayOfWeek": 0,
  "dayOfMonth": 0,
  "monthOfYear": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| networkReportScheduleVO | NetworkReportScheduleVO | body | true | NetworkReportScheduleVO | NetworkReportScheduleVO |

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

# Statistic

Get switch statistics


GET/openapi/v1/{omadacId}/sites/{siteId}/stat/switches/{deviceMac}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get switch statistics

The interface requires one of the permissions:

Site Statics Manager View Only

Site Device Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

-39700 - Switch does not exist

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceMac | Device MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseStatisticsOswVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | StatisticsOswVO | StatisticsOswVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"name": "",
		"status": 0,
		"statusCategory": 0,
		"portNum": 0,
		"ports": [\
			{\
				"port": 0,\
				"name": "",\
				"type": 0,\
				"operation": "",\
				"portStatus": {\
					"linkStatus": 0,\
					"stkStatus": 0,\
					"linkSpeed": 0,\
					"poe": true,\
					"tx": 0,\
					"rx": 0,\
					"total": 0,\
					"stpDiscarding": true\
				},\
				"downlink": {\
					"mac": "",\
					"type": "",\
					"clientType": "",\
					"name": "",\
					"statusCategory": 0,\
					"model": "",\
					"modelVersion": ""\
				},\
				"maxSpeed": 0,\
				"disable": true,\
				"configStack": true,\
				"stackPortsGroupIndex": 0,\
				"configMlagPeerLink": true,\
				"configMlagDad": true,\
				"madUsed": true,\
				"oswStandPort": {\
					"unit": 0,\
					"slot": 0,\
					"port": 0\
				}\
			}\
		],
		"uplink": {
			"port": 0,
			"mac": "",
			"name": "",
			"type": "",
			"statusCategory": 0,
			"model": "",
			"modelVersion": ""
		},
		"supportPoe": true,
		"speeds": [],
		"supportStack": true,
		"supportSTP": true,
		"mlagMsg": {
			"mlagId": "",
			"mlagName": "",
			"role": 0,
			"priority": 0,
			"dadLinkPort": [],
			"peerLinkPort": []
		}
	}
}
```

Get switch statistics chart


POST/openapi/v1/{omadacId}/sites/{siteId}/stat/switches/{deviceMac}/chart

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


Display statistics based on the time granularity calculated by start and end times:
Within 26 hours, 5 minutes of data is displayed
26 hours to 7 days 2 hours, showing hourly statistics
7 days 2 hours to 120 days 2 hours, showing daily statistics
120 days 2 hours or more, showing weekly statistics

The interface requires one of the permissions:

Site Statics Manager View Only

Site Device Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "ports": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceMac | Device MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| oswStatQueryOpenApiDTO | OswStatQueryOpenApiDTO | body | true | OswStatQueryOpenApiDTO | OswStatQueryOpenApiDTO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseOswStatOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | OswStatOpenApiVO | OswStatOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"portMap": {
			"additionalProperties1": {
				"rx": 0,
				"tx": 0,
				"all": 0
			}
		},
		"statList": [\
			{\
				"time": 0,\
				"cpu": 0,\
				"mem": 0,\
				"ports": [\
					{\
						"port": 0,\
						"tx": 0,\
						"rx": 0,\
						"txRate": 0,\
						"rxRate": 0,\
						"txPkts": 0,\
						"rxPkts": 0,\
						"txBroadPkts": 0,\
						"rxBroadPkts": 0,\
						"txMultiPkts": 0,\
						"rxMultiPkts": 0,\
						"dropPkts": 0,\
						"txErrPkts": 0,\
						"rxErrPkts": 0\
					}\
				]\
			}\
		],
		"switchType": 0
	}
}
```

Get olt statistics chart


POST/openapi/v1/{omadacId}/sites/{siteId}/stat/olts/{deviceMac}/chart

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


Display statistics based on the time granularity calculated by start and end times:
Within 26 hours, 5 minutes of data is displayed
26 hours to 7 days 2 hours, showing hourly statistics
7 days 2 hours to 120 days 2 hours, showing daily statistics
120 days 2 hours or more, showing weekly statistics

The interface requires one of the permissions:

Site Statics Manager View Only

Site Device Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "oltPorts": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceMac | Device MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| oltStatQueryOpenApiDTO | OltStatQueryOpenApiDTO | body | true | OltStatQueryOpenApiDTO | OltStatQueryOpenApiDTO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseOltStatOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | OltStatOpenApiVO | OltStatOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"portMap": {
			"additionalProperties1": {
				"rx": 0,
				"tx": 0,
				"all": 0
			}
		},
		"statList": [\
			{\
				"onuCount": 0,\
				"up": 0,\
				"down": 0,\
				"time": 0,\
				"cpu": 0,\
				"mem": 0,\
				"ports": [\
					{\
						"port": "",\
						"tx": 0,\
						"rx": 0,\
						"txPackets": 0,\
						"rxPackets": 0,\
						"txBroadcastPackets": 0,\
						"rxBroadcastPackets": 0,\
						"txMulticastPackets": 0,\
						"rxMulticastPackets": 0,\
						"txRate": 0,\
						"rxRate": 0\
					}\
				]\
			}\
		]
	}
}
```

Get switch stack statistics


POST/openapi/v1/{omadacId}/sites/{siteId}/stat/stack/{stackId}

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


Get switch stack statistics

The interface requires one of the permissions:

Site Statics Manager View Only

Site Device Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

-40200 - This switch stack is not existed.

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "interval": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| stackId | Stack ID | path | true | string |  |
| oswStackStatQueryVO | OswStackStatQueryVO | body | true | OswStackStatQueryVO | OswStackStatQueryVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListOswStackDetailStatVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | OswStackDetailStatVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"time": 0,\
			"cpu": [\
				{\
					"unit": 0,\
					"value": 0\
				}\
			],\
			"mem": [\
				{\
					"unit": 0,\
					"value": 0\
				}\
			],\
			"dropPkts": [\
				{\
					"unit": 0,\
					"value": 0\
				}\
			],\
			"txErrPkts": [\
				{\
					"unit": 0,\
					"value": 0\
				}\
			],\
			"rxErrPkts": [\
				{\
					"unit": 0,\
					"value": 0\
				}\
			]\
		}\
	]
}
```

Get switch ranking cards


POST/openapi/v1/{omadacId}/sites/{siteId}/health/switches/rankingCards

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


Get switch ranking cards

The interface requires one of the permissions:

Site Health & Incident Manager View Only

Example


```
{
  "start": 0,
  "end": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| timeQueryOpenApiVO | TimeQueryOpenApiVO | body | true | TimeQueryOpenApiVO | TimeQueryOpenApiVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseOswRankingCardsOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | OswRankingCardsOpenApiVO | OswRankingCardsOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"topActiveSwitches": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"healthScore": 0,\
				"type": "",\
				"deviceSeriesType": 0,\
				"traffic": 0\
			}\
		],
		"topCpu": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"healthScore": 0,\
				"type": "",\
				"deviceSeriesType": 0,\
				"cpuUtil": 0\
			}\
		],
		"topMem": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"healthScore": 0,\
				"type": "",\
				"deviceSeriesType": 0,\
				"memUtil": 0\
			}\
		],
		"topPacketsLoss": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"healthScore": 0,\
				"type": "",\
				"deviceSeriesType": 0,\
				"portCnt": 0,\
				"pktsLossPortCnt": 0,\
				"lossPkts": 0\
			}\
		],
		"topPacketsError": [\
			{\
				"name": "",\
				"mac": "",\
				"model": "",\
				"modelVersion": "",\
				"healthScore": 0,\
				"type": "",\
				"deviceSeriesType": 0,\
				"portCnt": 0,\
				"errPortCnt": 0,\
				"errPkts": 0\
			}\
		]
	}
}
```

Get device statistic data 5 min


POST/openapi/v2/{omadacId}/sites/{siteId}/stat/{deviceMac}/5min

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


Get device statistic data 5 min

The interface requires one of the permissions:

Site Device Manager View Only

Site Statics Manager View Only

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "ports": [],
  "standardPorts": [],
  "oltPorts": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceMac | Device MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| type | Device Type. Supported type: ap, gateway, switch, olt. | query | true | string |  |
| statQueryVO | StatQueryVO | body | true | StatQueryVO | StatQueryVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseBaseDeviceStatDTO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | BaseDeviceStatDTO | BaseDeviceStatDTO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"time": 0,
		"cpu": 0,
		"mem": 0,
		"rebootTimes": 0,
		"mac": ""
	}
}
```

Get device statistic data hourly


POST/openapi/v2/{omadacId}/sites/{siteId}/stat/{deviceMac}/hourly

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


Get device statistic data hourly

The interface requires one of the permissions:

Site Device Manager View Only

Site Statics Manager View Only

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "ports": [],
  "standardPorts": [],
  "oltPorts": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceMac | Device MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| type | Device Type. Supported type: ap, gateway, switch, olt. | query | true | string |  |
| statQueryVO | StatQueryVO | body | true | StatQueryVO | StatQueryVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseBaseDeviceStatDTO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | BaseDeviceStatDTO | BaseDeviceStatDTO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"time": 0,
		"cpu": 0,
		"mem": 0,
		"rebootTimes": 0,
		"mac": ""
	}
}
```

Get device statistic data daily


POST/openapi/v2/{omadacId}/sites/{siteId}/stat/{deviceMac}/daily

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


Get device statistic data daily

The interface requires one of the permissions:

Site Device Manager View Only

Site Statics Manager View Only

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "ports": [],
  "standardPorts": [],
  "oltPorts": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceMac | Device MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| type | Device Type. Supported type: ap, gateway, switch, olt. | query | true | string |  |
| statQueryVO | StatQueryVO | body | true | StatQueryVO | StatQueryVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseBaseDeviceStatDTO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | BaseDeviceStatDTO | BaseDeviceStatDTO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"time": 0,
		"cpu": 0,
		"mem": 0,
		"rebootTimes": 0,
		"mac": ""
	}
}
```

Get stack statistics chart


POST/openapi/v1/{omadacId}/sites/{siteId}/stat/stack/{stackId}/chart

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


Display statistics based on the time granularity calculated by start and end times:
Within 26 hours, 5 minutes of data is displayed
26 hours to 7 days 2 hours, showing hourly statistics
7 days 2 hours to 120 days 2 hours, showing daily statistics
120 days 2 hours or more, showing weekly statistics

The interface requires one of the permissions:

Site Statics Manager View Only

Site Device Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

Example


```
{
  "start": 0,
  "end": 0,
  "attrs": [],
  "standardPorts": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| stackId | Stack ID | path | true | string |  |
| oswStackStatQueryOpenApiDTO | OswStackStatQueryOpenApiDTO | body | true | OswStackStatQueryOpenApiDTO | OswStackStatQueryOpenApiDTO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListOswStackMemberStatVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | OswStackMemberStatVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"unit": 0,\
			"mac": "",\
			"portMap": {\
				"additionalProperties1": {\
					"rx": 0,\
					"tx": 0,\
					"all": 0\
				}\
			},\
			"statList": [\
				{\
					"time": 0,\
					"cpu": 0,\
					"mem": 0,\
					"rebootTimes": 0,\
					"mac": "",\
					"ports": [\
						{\
							"port": 0,\
							"standardPort": "",\
							"tx": 0,\
							"rx": 0,\
							"txRate": 0,\
							"rxRate": 0,\
							"txPkts": 0,\
							"rxPkts": 0,\
							"txBroadPkts": 0,\
							"rxBroadPkts": 0,\
							"txMultiPkts": 0,\
							"rxMultiPkts": 0,\
							"dropPkts": 0,\
							"txErrPkts": 0,\
							"rxErrPkts": 0,\
							"linkDownCnt": 0\
						}\
					],\
					"poeUtil": 0,\
					"poePower": 0\
				}\
			]\
		}\
	]
}
```

# Dashboard

Get tab without overall tab list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/without-overall-tabs

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get tabs without Overall Tab.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-34700 - The dashboard page does not exist in current site.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListListTabs |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | ListTabs |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"id": "",\
			"name": "",\
			"type": 0,\
			"cards": []\
		}\
	]
}
```

Get tab list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/tabs

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get tab list.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-34700 - The dashboard page does not exist in current site.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListListTabs |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | ListTabs |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"id": "",\
			"name": "",\
			"type": 0,\
			"cards": []\
		}\
	]
}
```

Create new tab


POST/openapi/v1/{omadacId}/sites/{siteId}/dashboard/tabs

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


Create tab.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-34700 - The dashboard page does not exist in current site.

-34702 - This tab name already exists.

-34703 - The number of tabs has reached the limit.

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
| siteId | Site ID | path | true | string |  |
| createTabOpenApiVO | CreateTabOpenApiVO | body | true | CreateTabOpenApiVO | CreateTabOpenApiVO |

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

Delete an existing tab


DELETE/openapi/v1/{omadacId}/sites/{siteId}/dashboard/tabs/{tabId}

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Delete an existing tab.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-34700 - The dashboard page does not exist in current site.

-34705 - Overall tab not allowed to be deleted.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| tabId | Tab ID | path | true | string |  |

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

Modify an existing tab


PATCH/openapi/v1/{omadacId}/sites/{siteId}/dashboard/tabs/{tabId}

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


Modify an existing tab.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-34700 - The dashboard page does not exist in current site.

-34701 - This tab does not exist in the dashboard.

-34702 - This tab name already exists.

-34704 - Non-overall tabs do not allow editing system cards.

Example


```
{
  "name": "",
  "reset": true
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| tabId | Tab ID | path | true | string |  |
| updateTabOpenApiVO | UpdateTabOpenApiVO | body | true | UpdateTabOpenApiVO | UpdateTabOpenApiVO |

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

Batch set tab config


PATCH/openapi/v1/{omadacId}/sites/{siteId}/dashboard/multi-tabs/config

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


Batch set tab configurations, add or delete tabs.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-34700 - The dashboard page does not exist in current site.

-34701 - This tab does not exist in the dashboard.

-34702 - This tab name already exists.

-34704 - Non-overall tabs do not allow editing system cards.

Example


```
{
  "tabs": [\
    {\
      "id": "",\
      "cards": []\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| batchEditTabs | BatchEditTabs | body | true | BatchEditTabs | BatchEditTabs |

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

Get site overview diagram info


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/overview-diagram

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site overview diagram info.

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGetDashboardOverview |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GetDashboardOverview | GetDashboardOverview |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalGatewayNum": 0,
		"connectedGatewayNum": 0,
		"disconnectedGatewayNum": 0,
		"netCapacity": 0,
		"netUsage": 0,
		"totalSwitchNum": 0,
		"connectedSwitchNum": 0,
		"disconnectedSwitchNum": 0,
		"totalPorts": 0,
		"availablePorts": 0,
		"powerConsumption": 0,
		"totalApNum": 0,
		"connectedApNum": 0,
		"isolatedApNum": 0,
		"disconnectedApNum": 0,
		"totalClientNum": 0,
		"wiredClientNum": 0,
		"wirelessClientNum": 0,
		"guestNum": 0
	}
}
```

Get channel distribution and usage


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/channels

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get channel distribution and usage.

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseApChannelStats |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | ApChannelStats | ApChannelStats |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"2g channel stat": [\
			{\
				"channel": 0,\
				"apNum": 0,\
				"clientNum": 0,\
				"channelUtilization": 0\
			}\
		],
		"5g channel stat": [\
			{\
				"channel": 0,\
				"apNum": 0,\
				"clientNum": 0,\
				"channelUtilization": 0\
			}\
		],
		"6g channel stat": [\
			{\
				"channel": 0,\
				"apNum": 0,\
				"clientNum": 0,\
				"channelUtilization": 0\
			}\
		]
	}
}
```

Get the most active eap list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/most-active-eaps

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the top 5 APs with the highest device traffic within the time range (in Bytes)..

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListActiveDevice |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | ActiveDevice |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"status": 0,\
			"name": "",\
			"traffic": 0,\
			"mac": "",\
			"model": "",\
			"modelVersion": ""\
		}\
	]
}
```

Get most active switch list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/most-active-switches

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the top 5 switches with the highest device traffic within the time range (in Bytes)

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListActiveDevice |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | ActiveDevice |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"status": 0,\
			"name": "",\
			"traffic": 0,\
			"mac": "",\
			"model": "",\
			"modelVersion": ""\
		}\
	]
}
```

Get wifi summary


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/wifi-summary

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get wifi summary.

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseWifiSummary |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | WifiSummary | WifiSummary |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"connectedApNum": 0,
		"clients": 0,
		"channelUtilization": 0,
		"totalTraffic": 0
	}
}
```

Get switch summary


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/switch-summary

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get switch summary

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSwitchSummary |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SwitchSummary | SwitchSummary |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"clients": 0,
		"portUtilization": 0,
		"connectedSwitchNum": 0,
		"totalTraffic": 0
	}
}
```

Get traffic distribution


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/traffic-distribution

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain wired/wireless traffic distribution data within the time range

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseTrafficDistribution |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | TrafficDistribution | TrafficDistribution |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"aps": [\
			{\
				"name": "",\
				"mac": "",\
				"traffic": 0,\
				"trafficProportion": 0\
			}\
		],
		"switches": [\
			{\
				"name": "",\
				"mac": "",\
				"traffic": 0,\
				"trafficProportion": 0\
			}\
		]
	}
}
```

Get traffic activity


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/traffic-activities

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain AP and Switch traffic Activities within the time range

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseTrafficActivities |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | TrafficActivities | TrafficActivities |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"apTrafficActivities": [\
			{\
				"time": 0,\
				"txData": 0,\
				"rxData": 0\
			}\
		],
		"switchTrafficActivities": [\
			{\
				"time": 0,\
				"txData": 0,\
				"rxData": 0\
			}\
		]
	}
}
```

Get retried rate and dropped rate


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/retry-dropped-rate

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get retried rate and dropped rate.

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseRetryDropRate |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | RetryDropRate | RetryDropRate |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"retryEaps": [\
			{\
				"retries": [\
					{\
						"time": 0,\
						"retryTimes": 0,\
						"retryRate": 0\
					}\
				],\
				"apMac": "",\
				"name": "",\
				"model": "",\
				"modelVersion": "",\
				"avg": 0,\
				"status": 0\
			}\
		],
		"droppedEaps": [\
			{\
				"dropouts": [\
					{\
						"time": 0,\
						"dropTimes": 0,\
						"dropRate": 0\
					}\
				],\
				"apMac": "",\
				"name": "",\
				"model": "",\
				"modelVersion": "",\
				"avg": 0,\
				"status": 0\
			}\
		]
	}
}
```

Get top device cpu usage


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/top-device-cpu-usage

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the top 5 CPU usage devices within the time range

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListCpuUsage |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | CpuUsage |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"name": "",\
			"mac": "",\
			"cpuUtil": 0,\
			"model": "",\
			"modelVersion": "",\
			"type": ""\
		}\
	]
}
```

Get top device memory usage


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/top-device-memory-usage

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the top 5 memory usage devices within the time range

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListMemUsage |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | MemUsage |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"name": "",\
			"mac": "",\
			"memUsage": 0,\
			"model": "",\
			"modelVersion": "",\
			"type": ""\
		}\
	]
}
```

Get top interference


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/top-interference

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the 5 APs with the highest interference intensity in different frequency bands within the time range

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseApInterferences |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | ApInterferences | ApInterferences |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"apInterference2g": [\
			{\
				"name": "",\
				"mac": "",\
				"interUtil": 0,\
				"model": "",\
				"modelVersion": "",\
				"NearestAp": ""\
			}\
		],
		"apInterference5g": [\
			{\
				"name": "",\
				"mac": "",\
				"interUtil": 0,\
				"model": "",\
				"modelVersion": "",\
				"NearestAp": ""\
			}\
		],
		"apInterference5g2": [\
			{\
				"name": "",\
				"mac": "",\
				"interUtil": 0,\
				"model": "",\
				"modelVersion": "",\
				"NearestAp": ""\
			}\
		],
		"apInterference6g": [\
			{\
				"name": "",\
				"mac": "",\
				"interUtil": 0,\
				"model": "",\
				"modelVersion": "",\
				"NearestAp": ""\
			}\
		]
	}
}
```

Get poe usage


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/poe-usage

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the PoE usage of the switch within the time range

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListPoeUsage |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | PoeUsage |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"mac": "",\
			"name": "",\
			"portNum": 0,\
			"totalPowerUsed": 0,\
			"totalPercentUsed": 0,\
			"totalPower": 0,\
			"poePorts": [\
				{\
					"portId": 0,\
					"poeSupported": true,\
					"poeEnabled": true,\
					"poePower": 0,\
					"poePercent": 0\
				}\
			]\
		}\
	]
}
```

Get isp load info


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/isp-load

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain IPS load data for the gateway within the time range.

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListIspLoad |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | IspLoad |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"portId": 0,\
			"portName": "",\
			"data": [\
				{\
					"totalRate": 0,\
					"latency": 0,\
					"time": 0\
				}\
			]\
		}\
	]
}
```

Get grid dashboard tunnel statistic list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/vpn-tunnel-stats

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get the status, IP address, and other information of the established dashboard tunnel statistic VPN connection

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| type | Type should be a value as follows: 0:Server,1:Client | query | true | integer(int32) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListDashboardVpnStats |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | DashboardVpnStats |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"site": "",\
			"name": "",\
			"status": true,\
			"tunnels": 0,\
			"txData": 0,\
			"rxData": 0\
		}\
	]
}
```

Get grid dashboard lpsec tunnel statistic list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/lpset-tunnel-stats

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the status, IP address, and other information of the established IPsec VPN connection

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListIpsecVpnStats |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | IpsecVpnStats |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"site": "",\
			"name": "",\
			"id": 0,\
			"status": true,\
			"direction": "",\
			"localPeerIp": "",\
			"remotePeerIp": "",\
			"localSa": "",\
			"remoteSa": ""\
		}\
	]
}
```

Get grid dashboard open vpn tunnel statistic list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/open-vpn-tunnel-stats

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the status, traffic, and other information of the established open VPN connection

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| type | type: 0:Server, 1:Client | query | true | integer(int32) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListDashboardVpnStats |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | DashboardVpnStats |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"site": "",\
			"name": "",\
			"status": true,\
			"tunnels": 0,\
			"txData": 0,\
			"rxData": 0\
		}\
	]
}
```

Get grid dashboard open network activity statistic list


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/allNetworkActivity

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseNetworkActivityVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | NetworkActivityVO | NetworkActivityVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"totalTraffic": 0,
		"totalUpload": 0,
		"totalDownload": 0,
		"activityList": [\
			{\
				"time": 0,\
				"upload": 0,\
				"download": 0,\
				"wiredCount": 0,\
				"wirelessCount": 0,\
				"totalData": 0\
			}\
		],
		"existData": true,
		"totalWiredCount": 0,
		"totalWirelessCount": 0,
		"totalClientCount": 0
	}
}
```

Get network overview


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/card/overview

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the statistic info of devices.

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseListCardOverviewOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | array | CardOverviewOpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": [\
		{\
			"type": "",\
			"total": 0,\
			"preConfig": 0,\
			"connected": 0,\
			"disconnectedCount": 0\
		}\
	]
}
```

Get site dashboard isp load inform


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/gateway/isp/load

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get site dashboard isp load inform of the site with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseDashboardIspLoadDetailVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | DashboardIspLoadDetailVO | DashboardIspLoadDetailVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"data": [\
			{\
				"name": "",\
				"mac": "",\
				"status": 0,\
				"ispInfo": {\
					"type": 0,\
					"ispArr": [\
						{\
							"port": 0,\
							"name": "",\
							"portUuid": "",\
							"maxBandwidth": 0,\
							"downloadSpeedSet": 0,\
							"uploadSpeedSet": 0,\
							"downloadSpeed": "",\
							"uploadSpeed": "",\
							"downloadPercent": 0,\
							"uploadPercent": 0,\
							"ip": "",\
							"loadBalance": "",\
							"status": 0,\
							"onLineStatus": 0,\
							"ipv4Proto": ""\
						}\
					]\
				},\
				"speedTestLimit": 0,\
				"supportSpeedTest": true\
			}\
		]
	}
}
```

Set site dashboard wan bandwidth


POST/openapi/v1/{omadacId}/sites/{siteId}/wan/bandwidth

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


Set site dashboard wan bandwidth of the site with the given omadacId and siteId.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "bandwidths": [\
    {\
      "portUuid": "",\
      "rxBandwidth": 0,\
      "txBandwidth": 0\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| wanPortBandwidthVO | WanPortBandwidthVO | body | true | WanPortBandwidthVO | WanPortBandwidthVO |

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

Get Top 5 Aps


GET/openapi/v1/{omadacId}/sites/{siteId}/dashboard/top-aps

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get Top 5 Aps.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseTopApByRtDropVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | TopApByRtDropVO | TopApByRtDropVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"topApByRt": [\
			{\
				"device": "",\
				"model": "",\
				"modelVersion": "",\
				"ip": "",\
				"modelType": "",\
				"type": "",\
				"status": 0,\
				"health": 0,\
				"mac": "",\
				"util": 0,\
				"traffic": 0,\
				"ratio": 0,\
				"poePower": 0,\
				"clientCount": 0\
			}\
		],
		"topApByDrop": [\
			{\
				"device": "",\
				"model": "",\
				"modelVersion": "",\
				"ip": "",\
				"modelType": "",\
				"type": "",\
				"status": 0,\
				"health": 0,\
				"mac": "",\
				"util": 0,\
				"traffic": 0,\
				"ratio": 0,\
				"poePower": 0,\
				"clientCount": 0\
			}\
		]
	}
}
```

Get the most active eap list


GET/openapi/v2/{omadacId}/sites/{siteId}/dashboard/most-active-eaps

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Obtain the top 5 APs with the highest device traffic within the time range (in Bytes)..

The interface requires one of the permissions:

Site Dashboard Manager View Only

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| deviceNum | The number of most active APs acquired. | query | true | integer(int32) |  |
| start | Start timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |
| end | End timestamp, in seconds, such as 1682000000 | query | true | integer(int64) |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGetActiveDeviceV2OpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GetActiveDeviceV2OpenApiVO | GetActiveDeviceV2OpenApiVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"activeAps": [\
			{\
				"status": 0,\
				"name": "",\
				"traffic": 0,\
				"mac": "",\
				"model": "",\
				"modelVersion": ""\
			}\
		],
		"totalTraffic": 0
	}
}
```

Start Speed Test


POST/openapi/v1/{omadacId}/sites/{siteId}/gateways/{gatewayMac}/speedTest

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


Start Speed Test.

The interface requires one of the permissions:

Site Dashboard Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "portUuidList": [],
  "virtualWanIdList": []
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| gatewayMac | Gateway MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| openApiSpeedTestSelectPortsVO | OpenApiSpeedTestSelectPortsVO | body | true | OpenApiSpeedTestSelectPortsVO | OpenApiSpeedTestSelectPortsVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseStartSpeedTestV2ResultVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | StartSpeedTestV2ResultVO | StartSpeedTestV2ResultVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"deviceMac": ""
	}
}
```

Get Speed Test Result


GET/openapi/v1/{omadacId}/sites/{siteId}/gateways/{gatewayMac}/speedTestResult

produces

\[\
"application/x-www-form-urlencoded"\
\]


consumes

\[\
"\*/\*"\
\]


Note


Get Speed Test Result.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| gatewayMac | Gateway MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseSpeedTestV2ResultVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | SpeedTestV2ResultVO | SpeedTestV2ResultVO |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"status": 0,
		"portSpeedResults": [\
			{\
				"portId": 0,\
				"virtualWanEntryId": 0,\
				"time": 0,\
				"portName": "",\
				"isp": "",\
				"serverName": "",\
				"serverLocation": "",\
				"status": 0,\
				"latency": 0,\
				"down": 0,\
				"up": 0,\
				"progress": 0\
			}\
		]
	}
}
```

Get date list of speed test results


POST/openapi/v1/{omadacId}/sites/{siteId}/gateways/{gatewayMac}/speedTestResult/dateList

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


Get date list of speed test results.

The interface requires one of the permissions:

Site Dashboard Manager View Only

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "portUuid": "",
  "virtualWanId": "",
  "currentPage": 0,
  "currentPageSize": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| gatewayMac | Gateway MAC address, like AA-BB-CC-DD-EE-FF | path | true | string |  |
| openApiQuerySpeedTestDateListVO | OpenApiQuerySpeedTestDateListVO | body | true | OpenApiQuerySpeedTestDateListVO | OpenApiQuerySpeedTestDateListVO |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseGridVOSpeedTestV2ResultItemOpenApiVO |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | GridVOSpeedTestV2ResultItemOpenApiVO | GridVOSpeedTestV2ResultItemOpenApiVO |

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
				"portId": 0,\
				"virtualWanEntryId": 0,\
				"time": 0,\
				"isp": "",\
				"status": 0,\
				"serverName": "",\
				"serverLocation": "",\
				"latency": 0,\
				"down": 0,\
				"up": 0\
			}\
		]
	}
}
```

# Network Report

Email Network Report Schedule


POST/openapi/v1/{omadacId}/sites/{siteId}/networkReport/schedule

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


Set the timing task configuration that send reports periodically.This interface has been deprecated. Please use the following interface instead: Export report for scheduler

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "enable": true,
  "tab": 0,
  "reportName": "",
  "reportType": 0,
  "emailList": [],
  "cards": "",
  "timingType": 0,
  "hour": 0,
  "minute": 0,
  "dayOfWeek": 0,
  "dayOfMonth": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| networkReportScheduleOpenApiVO | NetworkReportScheduleOpenApiVO | body | true | NetworkReportScheduleOpenApiVO | NetworkReportScheduleOpenApiVO |

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

Email Network Report Later


POST/openapi/v1/{omadacId}/sites/{siteId}/networkReport/oneTime

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


Set the timing task configuration that send reports latterly.This interface has been deprecated. Please use the following interface instead: Export report once later

The interface requires one of the permissions:

Site Network Report Manager Modify

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-33004 - Operation failed because other operations (site copying, restoring, template synchronizing, etc.) are being performed on this site. Please wait and try again later.

Example


```
{
  "enable": true,
  "tab": 0,
  "cards": "",
  "reportName": "",
  "reportType": 0,
  "emailList": [],
  "minute": 0,
  "hour": 0,
  "time": 0,
  "start": 0,
  "end": 0
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| siteId | Site ID | path | true | string |  |
| networkReportScheduleLaterOpenApiVO | NetworkReportScheduleLaterOpenApiVO | body | true | NetworkReportScheduleLaterOpenApiVO | NetworkReportScheduleLaterOpenApiVO |

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