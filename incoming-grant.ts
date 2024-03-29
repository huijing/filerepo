//@! start chunk 1 | title=Import dependencies
import dotenv from "dotenv";
import { join } from "path";
import { createAuthenticatedClient, isPendingGrant } from "@interledger/open-payments";
import { loadPrivateKey } from "utils/load-private-key";

dotenv.config({ path: join(__dirname, "..", ".env") });

const KEY_ID = process.env.KEY_ID;
const PAYMENT_POINTER = process.env.PAYMENT_POINTER;
//@! end chunk 1

async function run() {
//@! start chunk 2 | title=Initialize Open Payments client
    const client = await createAuthenticatedClient({
        paymentPointerUrl: PAYMENT_POINTER,
        privateKey: loadPrivateKey(),
        keyId: KEY_ID,
    });
//@! end chunk 2
//@! start chunk 3 | title=Get payment pointer information
    const paymentPointer = await client.paymentPointer.get({
        url: PAYMENT_POINTER,
    });
//@! end chunk 3
//@! start chunk 4 | title=Request incoming payment grant
    const grant = await client.grant.request(
        {
            url: paymentPointer.authServer,
        },
        {
            access_token: {
                access: [
                    {
                        type: "incoming-payment",
                        actions: ["list", "list-all", "read", "read-all", "complete", "create"],
                    },
                ],
            },
        },
    );

    if (isPendingGrant(grant)) {
        throw new Error("Expected non-interactive grant");
    }

    console.log("INCOMING_PAYMENT_ACCESS_TOKEN =", grant.access_token.value);
    console.log("INCOMING_PAYMENT_ACCESS_TOKEN_MANAGE_URL = ", grant.access_token.manage);
//@! end chunk 4
}

run();
