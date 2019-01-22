const jshint    = require('jshint');
const sloc      = require('sloc');
const fs        = require('fs');
const escomplex = require('escomplex');


//TODO: Demonstration - this would be the logic in the endpoint (instead of select shaFileArray and updateQuality functions
//TODO: it would make use of the api endpoints) that is calling the repoflow service
//the important part is the construction of the return array - has to look exactly the same for the update function to process

let javascriptQualityDemo = {};

javascriptQualityDemo.computeComplexityWithJsHINT = function computeComplexityWithJsHINT( paraSHAFileArray ){

        let fileArray = paraSHAFileArray;

        let qualityKeyNameArray = [
                                    {'key':'complexity','label':'Cyclomatic Complexity','file_types':['.js']},
                                    {'key':'lines_of_code','label':'Lines of Code','file_types':['.js']},
                                    {'key':'parameters','label':'Parameters','file_types':['.js']},
                                    {'key':'statements','label':'Statements','file_types':['.js']},
                                    {'key':'comments','label':'Comment Lines','file_types':['.js']}
                                  ];

        let qualityKeyValueArray = [];

        for( let i=0; i<fileArray.length; i++ ) {
            let fileType = fileArray[i].name.slice(-3);

        //&& fileArray[i].name != 'frontend/src/assets/diff-match-patch-without-exports/diff-match-patch/test/index.js'

            if( fileType == '.js' ) {
                if( fileArray[i].fileContent != '' ) {

                    //const resultEscomplex = escomplex.analyse(fileArray[i].fileContent);
                    //console.log(result.aggregate);


                    jshint.JSHINT(fileArray[i].fileContent.split('\n'), {undef: true, esversion: 6}, {foo: false});
                    let qualityData = jshint.JSHINT.data();
                    let cyclomaticComplexity = 0;
                    let parameters = 0;
                    let statements = 0;
                    //let halsteadBugs = 0;

                    if (qualityData.functions.length > 0) {
                        for (let j = 0; j < qualityData.functions.length; j++) {
                            cyclomaticComplexity = cyclomaticComplexity + qualityData.functions[j].metrics.complexity;
                            parameters = parameters + qualityData.functions[j].metrics.parameters;
                            statements = statements + qualityData.functions[j].metrics.statements;
                        }
                    }

                    //halsteadBugs = resultEscomplex.aggregate.halstead.bugs;

                    qualityKeyValueArray.push({
                            '_key': fileArray[i]._key,
                            'commitId': fileArray[i].commitId,
                            'complexity': cyclomaticComplexity,
                            'lines_of_code': sloc(fileArray[i].fileContent, 'js').source,
                            'comments': sloc(fileArray[i].fileContent, 'js').comment,
                            'parameters': parameters,
                            'statements' : statements,
                            //'halstead_bugs' : halsteadBugs,
                            'isUpdatedWithQualityMetrics':1
                        }
                    );
                }


                //TODO write content to file in tmp folder
                //TODO analyze
                //TODO delete tmp file

                //fs.writeFile('tmp/mynewfile3.js', 'Hello content!', function (err) {
                //    if (err) throw err;
                //    console.log('Saved!');
                //});

            }
        }

        return [ qualityKeyNameArray, qualityKeyValueArray ];
};

module.exports = javascriptQualityDemo;


/*
//if( entry.sha() == fileResult[i].commitId ) {
let fileType = fileResult[i].name.slice(-3);
let fileContent = String(blob);

if( fileType == '.js' )
{
    //javascript code quality check
    jshint.JSHINT("function(a){ if(a=1){ if(b=2){ a+b=3; } } }", {undef: true,esversion:6}, {foo:false});
    let qualityData = jshint.JSHINT.data();

    console.log("//-----------------------//");
    console.log(qualityData.functions[0]);
    console.log(fileResult[i].name);
    console.log("//-----------------//");
}

/*if( fileType == '.ts' )
{
    try {
        //console.log("its ts");
        let options = {
            fix: false,
            formatter: "json"
        };

        const rawConfig = tslint.Configuration.DEFAULT_CONFIG;

        rawConfig.rules = {
            semicolon: [true, 'always'],
        };

        console.log(rawConfig);

        let linter = new tslint.Linter(options);
        linter.lint(fileResult[i].name, String(blob), rawConfig );
        let result = linter.getResult();

        //console.log(result);
    }catch(e){console.log(e);process.exit(1);}
}*/

