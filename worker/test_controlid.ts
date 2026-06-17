import * as snmp from "net-snmp";

const session = snmp.createSession("192.168.0.225", "public", {
  port: 161,
  version: snmp.Version1,
});

const oids = [
  "1.3.6.1.4.1.49617.1.1.1.0", // firmwareVersion
  "1.3.6.1.4.1.49617.1.1.4.0", // loadAverage
  "1.3.6.1.4.1.49617.1.1.5.0", // cpuUsage
  "1.3.6.1.4.1.49617.1.1.6.0", // cpuTemperature
];

session.get(oids, (error, varbinds) => {
  if (error) {
    console.error("Error:", error);
  } else {
    for (const vb of varbinds) {
      if (snmp.isVarbindError(vb)) {
        console.error(snmp.varbindError(vb));
      } else {
        console.log(vb.oid, "=>", String(vb.value));
      }
    }
  }
  session.close();
});
