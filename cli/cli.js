#!/usr/bin/env node

const cloneRepoController = require( './controller/clone_repo.js' );
const createDBController = require( './controller/create_db.js' );
const clearDBController = require( './controller/clear_db.js' );
const demoDBController = require( './controller/demo_db.js' );
const program = require('commander');

program
    .version('1.0.0')
    .usage('repoflow [option]')
    .option('-c, --clone-repository', 'Clone Repository')
    .option('-d, --create-database', 'Create Database')
    .option('-e, --clear-database', 'Clear Database')
    .option('-f, --create-demodatabase', 'Create Demonstration Quality Data')
    //.option('-P, --pineapple', 'Add pineapple')
    //.option('-b, --bbq-sauce', 'Add bbq sauce')
    //.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .parse(process.argv);

if (program.cloneRepository ) {
    cloneRepoController.run();
}

if( program.createDatabase ) {
    createDBController.run();
}

if( program.clearDatabase ) {
    clearDBController.run();
}

if( program.createDemodatabase ) {
    demoDBController.run();
}


//console.log('  - %s cheese', program.cheese);