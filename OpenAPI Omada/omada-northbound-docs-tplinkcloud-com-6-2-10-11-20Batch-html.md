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

11 Batch

### GroupUrl

/v3/api-docs/11 Batch

### GroupLocation

/v3/api-docs/11 Batch

### count

POST


1

Hide

- [Home](https://omada-northbound-docs.tplinkcloud.com/6.2.10/11%20Batch.html#knife4jDocument)
- [Batch OpenAPI](https://omada-northbound-docs.tplinkcloud.com/6.2.10/11%20Batch.html#Batch%20OpenAPI)
  - [Batch Processing OpenAPIs](https://omada-northbound-docs.tplinkcloud.com/6.2.10/11%20Batch.html#batchController)

# Batch OpenAPI

Batch Processing OpenAPIs


POST/openapi/v1/{omadacId}/batch

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


Batch processing of multiple OpenAPIs under the same Omada controller through this OpenAPI.

The possible error code for the interface in the returned body is one of the following error codes (non generic error codes):

-1001 - Invalid request parameters.

-1600 - Unsupported request path.

-1619 - Execution has been interrupted due to unsuccessful execution of the pre action request.

-1620 - Error occurred while executing action.

-44112 - The access token has expired. Please re-initiate the refreshToken process to obtain the access token.

-44113 - The Access Token is Invalid.

-7132 - Our server is receiving too many requests now. Please try again later.

Example


```
{
  "interrupt": true,
  "actions": [\
    {\
      "path": "",\
      "method": "",\
      "body": "",\
      "query": ""\
    }\
  ]
}
```

Params


| name | description | in | require | type | schema |
| --- | --- | --- | --- | --- | --- |
| omadacId | Omada ID | path | true | string |  |
| batch request entity | Batch request entity | body | true | Batch request entity | Batch request entity |

Status


| code | description | schema |
| --- | --- | --- |
| 200 | OK | OperationResponseBatch Response Entity |

Response Params


| name | description | type | schema |
| --- | --- | --- | --- |
| errorCode |  | integer(int32) | integer(int32) |
| msg |  | string |  |
| result |  | Batch response entity | Batch response entity |

Response Example


```
{
	"errorCode": 0,
	"msg": "",
	"result": {
		"response": [\
			{\
				"errorCode": 0,\
				"msg": "",\
				"result": {}\
			}\
		]
	}
}
```