const { ethers, deployments } = require("hardhat");

async function main() {
    const signer = (await ethers.getSigners())[0];
    const fundMeDeployment = await deployments.get("FundMe");
    const fundMe = await ethers.getContractAt(
        fundMeDeployment.abi,
        fundMeDeployment.address,
        signer,
    );
    const txResponse = await fundMe.withdraw();
    await txResponse.wait(1);
    console.log("Withdrawn...");
}

main()
    .then((_) => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
