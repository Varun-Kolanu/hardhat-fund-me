const { run } = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArgsParams: args,
        });
    } catch (error) {
        if (error.message.toLowercase().includes("already verified")) {
            console.error("Already verified!");
        } else {
            console.error(error);
        }
    }
}

module.exports = { verify };
