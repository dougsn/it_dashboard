import ping from "ping";

async function testPing() {
    const result = await ping.promise.probe("192.168.0.251", {
        timeout: 5,
        extra: ["-c", "1"]
    });
    console.log("With -c 1:");
    console.log(result);

    const result2 = await ping.promise.probe("192.168.0.251", {
        timeout: 5
    });
    console.log("Without -c 1:");
    console.log(result2);
}

testPing();
