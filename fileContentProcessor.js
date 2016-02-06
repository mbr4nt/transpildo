module.exports = new (function(commentRemover, interpolate, _){
    this.process = function(fileContent, behaviors, callback) {
        removeCurlyBracketsFromComments(fileContent, behaviors, callback);
    }
    
    function removeCurlyBracketsFromComments(fileContent, behaviors, callback) {
        commentRemover.process({}, { content: fileContent}, function(err, globals, fileInfo) {
            var content = transpile(fileInfo.contentWithFixedComments, behaviors);
            callback(err, content);
        });
        
    }
    
    function findBehavior(behaviors, behaviorName) {
        return _.find(behaviors, function(behavior) { return behavior.name == behaviorName});
    }
    
    function transpile(fileContent, allBehaviors) {
        var map = [];
        
        var exp = /\bclass\s+(\w+)(\s+extends\s+(\w+))?\s+uses\s+([\w\s\,]+)\s*\{/g;

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
            return interpolate("class {className} extends {id} {", data);
        });
        
        map.forEach(function(item) {
            item.content = "";
            item.behaviors.forEach(function(behaviorName) {
                var behavior = findBehavior(allBehaviors, behaviorName);
                if(behavior) {
                    item.content +=  "\r\n\t/* begin behavior " + behaviorName + "*/\r\n\t" + behavior.content + "\r\n\t/* end behavior " + behaviorName + "*/\r\n";
                }
                else {
                    throw "Behavior " + behaviorName + " doesn't exist.";
                }
            });
            fileContent += interpolate("\r\npublic class {id} extends {parent} { {content} }", item);
        });
        
        return fileContent;
    }
})(require("cm_modules/pipeline_stages/commentRemover.js"), require("interpolate"), require("underscore"));