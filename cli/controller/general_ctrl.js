const figlet = require("figlet");
const chalk = require("chalk");

const init = () => {
    console.log(
        chalk.cyan(
            figlet.textSync("REPOFLOW CLI", {
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
};

module.exports.init = init;