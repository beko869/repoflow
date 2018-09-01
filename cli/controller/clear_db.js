const inquirer = require("inquirer");
const chalk = require("chalk");

const api = require( '../routes/api_calls.js' );
const generalController = require( './general_ctrl.js' );

const askQuestions = () => {
    const questions = [
        {
            name: "CONFIRM_TRUNCATE_DATABASE",
            type: "input",
            message: "Are you sure you want to truncate the database?"
        }
    ];
    return inquirer.prompt(questions);
};

const success = () => {
    console.log(
        chalk.white.bgGreen.bold(`Done! Database truncated.`)
    );
};

const error = () => {
    console.log(
        chalk.white.bgRed.bold(`Error! Database could not be truncated!`)
    );
};

const abort = () => {
    console.log(
        chalk.white.bgRed.bold(`Aborted! Database is not truncated`)
    );
};

const run = async () => {
    generalController.init();
    const answers = await askQuestions();
    const {CONFIRM_TRUNCATE_DATABASE} = answers;

    if( CONFIRM_TRUNCATE_DATABASE == 'y' || CONFIRM_TRUNCATE_DATABASE == 'Y' || CONFIRM_TRUNCATE_DATABASE == 'yes'
        || CONFIRM_TRUNCATE_DATABASE == 'Yes' )
    {
        api.clearDatabase( CONFIRM_TRUNCATE_DATABASE )
            .then( (result) => {
                if( result.status == 200 ) {
                    success();
                } else {
                    error();
                }
            }, ()=>{
                error();
            });
    }
    else
    {
        abort();
    }
};

module.exports.run = run;