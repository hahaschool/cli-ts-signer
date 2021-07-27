import { ApiPromise, WsProvider } from "@polkadot/api";
import { typesBundle } from "moonbeam-types-bundle";
import { createAndSendTx } from "../methods/createAndSendTx";
import { ALITH, BALTATHAR, testnetWs } from "../methods/utils";
import { testSignCLI } from "./sign.spec";
var assert = require("assert");

const testAmount = "1000000000000";

async function getBalance(address: string, api: ApiPromise) {
  const account = await api.query.system.account(address);
  return account.data.free.toString();
}

describe("Create and Send Tx Integration Test", function () {
  it("should increment Baltathar's account balance", async function () {
    this.timeout(40000);
    let api = await ApiPromise.create({
      provider: new WsProvider(testnetWs),
      typesBundle: typesBundle as any,
    });

    // First get initial balance of Baltathar
    const initialBalance = await getBalance(BALTATHAR, api);

    // create and send transfer tx from ALITH
    await createAndSendTx(
      "balances.transfer",
      BALTATHAR + "," + testAmount,
      testnetWs,
      ALITH,
      "moonbase",
      async (payload: string) => {
        return await testSignCLI(payload);
      },
      false
    );

    // Wait for block
    await new Promise((res) => setTimeout(res, 30000));

    // Then check incremented balance of Baltathar
    const finalBalance = await getBalance(BALTATHAR, api);
    assert.equal(finalBalance, (Number(initialBalance) + Number(testAmount)).toString());
  });
});