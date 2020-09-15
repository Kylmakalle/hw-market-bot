require("./helpers/env");
const bot = require("./HwMarketBot");

const init = async () => {
    //await connect(MONGO);
    await bot.launch();
};

init();