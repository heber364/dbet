const hre = require("hardhat");

async function main() {

    // ethers estão disponíveis no escopo global

    const [deployer] = await hre.ethers.getSigners();

    console.log(

        "Implantando os contratos com a conta:",

        await deployer.getAddress()

    );
    //console.log("Account balance:", (await deployer.getBalance()).toString());

    const BetFactory = await hre.ethers.getContractFactory("BetFactory");

    const betFactory = await BetFactory.deploy();

    await betFactory.waitForDeployment();

    console.log("betFactory address:", await betFactory.getAddress())

}

main()

    .then(() => process.exit(0))

    .catch((error) => {

        console.error(error);

        process.exit(1);

    });