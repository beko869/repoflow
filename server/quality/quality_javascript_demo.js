const jshint    = require('jshint');
const sloc      = require('sloc');

//TODO: Demonstration - this would be the logic in the endpoint (instead of select shaFileArray and updateQuality functions
//TODO: it would make use of the api endpoints) that is calling the repoflow service
//the important part is the construction of the return array - has to look exactly the same for the update function to process

let javascriptQualityDemo = {};

javascriptQualityDemo.computeComplexityWithJsHINT = function computeComplexityWithJsHINT( paraSHAFileArray ){

        let fileArray = paraSHAFileArray;

        let qualityKeyNameArray = [
                                    {'key':'complexity','label':'Cyclomatic Complexity','file_types':['.js']},
                                    {'key':'lines_of_code','label':'Lines of Code','file_types':['.js']}
                                  ];

        let qualityKeyValueArray = [];

        for( let i=0; i<fileArray.length; i++ ) {
            let fileType = fileArray[i].name.slice(-3);

            if( fileType == '.js' ) {
                if( fileArray[i].fileContent != '' ) {
                    jshint.JSHINT(fileArray[i].fileContent.split('\n'), {undef: true, esversion: 6}, {foo: false});
                    let qualityData = jshint.JSHINT.data();
                    let cyclomaticComplexity = 0;

                    if (qualityData.functions.length > 0) {
                        for (let j = 0; j < qualityData.functions.length; j++) {
                            cyclomaticComplexity = cyclomaticComplexity + qualityData.functions[j].metrics.complexity;
                        }
                    }

                    qualityKeyValueArray.push({
                            '_key': fileArray[i]._key,
                            'commitId': fileArray[i].commitId,
                            'complexity': cyclomaticComplexity,
                            'lines_of_code': sloc(fileArray[i].fileContent, 'js').total
                        }
                    );
                }
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

