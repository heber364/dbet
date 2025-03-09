const hre = require("hardhat");

async function main() {

    // ethers estão disponíveis no escopo global

    const [deployer] = await hre.ethers.getSigners();

    console.log(

        "Implantando os contratos com a conta:",

        await deployer.getAddress()

    );
    //console.log("Account balance:", (await deployer.getBalance()).toString());

    const Turing = await hre.ethers.getContractFactory("Turing");

    const turing = await Turing.deploy();

    await turing.waitForDeployment();

    console.log("turing address:", await turing.getAddress())

}

main()

    .then(() => process.exit(0))

    .catch((error) => {

        console.error(error);

        process.exit(1);

    });