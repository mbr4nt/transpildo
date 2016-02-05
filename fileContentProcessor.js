module.exports = new (function(commentRemover, interpolate){
    this.process = function(fileContent, callback) {
        removeCurlyBracketsFromComments(fileContent, callback);
    }
    
    function removeCurlyBracketsFromComments(fileContent, callback) {
        commentRemover.process({}, { content: fileContent}, function(err, globals, fileInfo) {
            var content = extractClassMap(fileInfo.contentWithFixedComments);
            callback(err, content);
        })
        
    }
    
    function extractClassMap(fileContent) {
        var map = [];
        
        var exp = /\bclass\s+(\w)+(\s+extends\s+(\w+))?\s+uses\s+([\w\s\,]+)\s*\{/g;

        fileContent = fileContent.replace(exp, function(match, className, extendsString, parentClass, usesStatement) {
            var data = {
                className: className,
                parentClass: parentClass ? parentClass : "Object",
                usesArray: usesStatement.match(/\w+/g),
                usesString: ""
            };
            
            data.usesArray.forEach(function(uses) {
                if(data.usesString) data.usesString += "_";
                data.usesString += uses;
            });
            data.id = interpolate("Behavior_{usesString}_extends_{parentClass}", data);
            map.push({
                id: data.id,
                behaviors: data.usesArray,
                parent: data.parentClass
            });
            return interpolate("class {className} extends {id}", data);
        });
        
        map.forEach(function(item) {
            fileContent += interpolate("\r\npublic class {id} extends {parent} { }", item);
        });
        
        return fileContent;
    }
})(require("cm_modules/pipeline_stages/commentRemover.js"), require("interpolate"));