const chalk = require("chalk");

const api = require( '../routes/api_calls.js' );
const generalController = require( './general_ctrl.js' );

const success = () => {
    console.log(
        chalk.white.bgGreen.bold(`Done! Database created. You can continue with adding quality metrics.`)
    );
};

const error = () => {
    console.log(
        chalk.white.bgRed.bold(`Error! Database could not be created!`)
    );
};

const run = async () => {
    generalController.init();

    api.demoDatabase()
        .then( (result) => {
            if( result.status == 200 ) {
                success();
            } else {
                error();
            }
        }, ()=>{
            error();
        });
};

module.exports.run = run;