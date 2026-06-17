import { checkPing } from "./monitors/ping";

async function main() {
    const res = await checkPing("192.168.0.251");
    console.log("checkPing returned:", res);
}

main();
