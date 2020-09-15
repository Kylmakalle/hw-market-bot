require("./helpers/env");
import 'babel-polyfill';
const bot = require("./HwMarketBot");

const init = async () => {
    //await connect(MONGO);
    await bot.launch();
};

init();