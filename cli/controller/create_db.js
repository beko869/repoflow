const inquirer = require("inquirer");
const chalk = require("chalk");

const api = require( '../routes/api_calls.js' );
const generalController = require( './general_ctrl.js' );

const askQuestions = () => {
    const questions = [
        {
            name: "REPOSITORY_DIRECTORY",
            type: "input",
            message: "In which folder is your repository located?"
        }
    ];
    return inquirer.prompt(questions);
};

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
    const answers = await askQuestions();
    const {REPOSITORY_DIRECTORY} = answers;

    let createResult = await api.createDatabase( REPOSITORY_DIRECTORY );

    if( createResult.status == 200 ){
        success();
    } else {
        error();
    }
};

module.exports.run = run;