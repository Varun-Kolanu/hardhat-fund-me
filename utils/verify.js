const { run } = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        console.log(contractAddress, args);
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (
            error.message &&
            error.message.toLowerCase().includes("already verified")
        ) {
            console.error("Already verified!");
        } else {
            console.error(error);
        }
    }
}

module.exports = { verify };
