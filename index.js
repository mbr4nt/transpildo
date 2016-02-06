module.exports = new(function(fs, glob, async, fileContentProcessor, commentRemover, scopeIsolator, _) {
    this.run = function(callback) {

        glob("**/*.cmx", null, function(err, files) {

            if (err) {
                console.dir(err);
                return;
            }


            async.concat(files, extractBehaviors, function(err, behaviors) {
                async.map(files, function(file, callback) {
                    processFile(file, behaviors, callback);
                }, callback(err));
            });

        });
    }

    function processFile(filename, behaviors, callback) {
        fs.readFile(filename, "utf-8", function(err, fileContent) {
            if (err) {
                callback(err);
            }
            processContent(filename, fileContent, behaviors, callback);
        })
    }
    
    function extractBehaviors(filename, callback) {
        fs.readFile(filename, "utf-8", function(err, fileContent) {
            if (err) {
                callback(err);
            }
            commentRemover.process({}, { content: fileContent}, function(err, globals, fileInfo) {
                scopeIsolator.process({}, fileInfo, function(err, globals, fileInfo) {
                    var scopes = fileInfo.units;
                    var behaviorScopes = _.filter(scopes, function(scope) { return scope.type == "behavior"});
                    var behaviors = _.map(behaviorScopes, function(scope) {
                        return {
                            name: scope.name,
                            content: removeHeader(scope.content)
                        }
                    });
                    callback(err, behaviors);
                })
            });
        })
    }
    
    function removeHeader(behaviorContent) {
        //remove the behavior header
        behaviorContent = behaviorContent.replace(/[^\{]*\{/, "");
        //remove last bracket
        var i = behaviorContent.length - 1;
        var done = false;
        while(i > 0 && !done) {
            var char = behaviorContent[i];
            if(char == "}") {
                done = true;
            }
            behaviorContent = behaviorContent.substring(0, i);
            i--;
        }
        
        return behaviorContent;
    }

    function processContent(filename, fileContent, behaviors, callback) {
        fileContentProcessor.process(fileContent, behaviors, function(err, fileContent){
            if(err) callback(err);
            else writeFile(filename, fileContent, callback);
        });
    }

    function writeFile(filename, fileContent, callback) {
        filename = renameFile(filename);
        fs.writeFile(filename, fileContent, callback);
    }

    function renameFile(filename) {
        return filename += ".cm";
    }
})(require("fs"), require("glob"), require("async"), require("./fileContentProcessor.js"), require("cm_modules/pipeline_stages/commentRemover.js"), require("cm_modules/pipeline_stages/scopeIsolator.js"), require("underscore"));