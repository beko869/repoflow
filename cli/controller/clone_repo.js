const inquirer = require("inquirer");
const chalk = require("chalk");

const api = require( '../routes/api_calls.js' );
const generalController = require( './general_ctrl.js' );

const askQuestions = () => {
    const questions = [
        {
            name: "REPOSITORY_URL",
            type: "input",
            message: "What is the URL of the repository to be cloned?"
        },
        {
            name: "REPOSITORY_DIRECTORY",
            type: "input",
            message: "Where should the cloned repository be placed?"
        }
    ];
    return inquirer.prompt(questions);
};

const success = ( paraRepositoryDirectory ) => {
    console.log(
        chalk.white.bgGreen.bold(`Done! Repository cloned at ${paraRepositoryDirectory}`)
    );
};

const error = () => {
    console.log(
        chalk.white.bgRed.bold(`Error! Repository could not be cloned! Maybe the folder already exists or the URL of the repository is incorrect?`)
    );
};

const run = async () => {
    generalController.init();
    const answers = await askQuestions();
    const {REPOSITORY_URL, REPOSITORY_DIRECTORY} = answers;

    api.cloneRepository( REPOSITORY_URL, REPOSITORY_DIRECTORY )
        .then( (result) => {
            if( result.status == 200 ) {
                success( REPOSITORY_DIRECTORY );
            } else {
                error();
            }
        }, ()=>{
            error();
        });
};

module.exports.run = run;