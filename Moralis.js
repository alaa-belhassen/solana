const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");

const runApp = async () => {
  await Moralis.start({
    apiKey: "W0KoA64NVaSq7g6APikFYGuPxgqwiZYIWcvTM8X7kKbJAzLyf86b9Bn5EsvRrX5x",
    // ...and any other configuration
  });

  const address = "E4H41T3G2gubwFmDAiJxgPPWYEAghYD1C6a5i3LgeEMb";

  const network = SolNetwork.DEVNET;

  const response = await Moralis.SolApi.account.getBalance({
    address,
    network,
  });

  console.log(response.toJSON());
};

runApp();