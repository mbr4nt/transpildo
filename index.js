module.exports = new(function(fs, glob, async, fileContentProcessor) {
    this.run = function(callback) {

        glob("**/*.tpildo", null, function(err, files) {

            if (err) {
                console.dir(err);
                return;
            }


            async.map(files, processFile, function(err) {
                callback(err);
            });

        });
    }

    function processFile(filename, callback) {
        fs.readFile(filename, "utf-8", function(err, fileContent) {
            if (err) {
                callback(err);
            }
            processContent(filename, fileContent, callback);
        })
    }

    function processContent(filename, fileContent, callback) {
        fileContentProcessor.process(fileContent, function(err, fileContent){
            if(err) callback(err);
            else writeFile(filename, fileContent, callback);
        });
    }

    function writeFile(filename, fileContent, callback) {
        filename = renameFile(filename);
        fs.writeFile(filename, fileContent, callback);
    }

    function renameFile(filename) {
        return filename.replace(".tpildo", ".cm");
    }
})(require("fs"), require("glob"), require("async"), require("./fileContentProcessor.js"));