var nomnoml = nomnoml || {}

nomnoml.parse = function (source){
	function onlyCompilables(line){
		var ok = line[0] != '#' && line.substring(0,2) != '//'
		return ok ? line : ''
	}
	var isDirective = function (line){ return line[0] === '#' }
	var lines = source.split('\n').map(function (s){ return s.trim() })
	var pureDirectives = _.filter(lines, isDirective)
	var directives = _.object(pureDirectives.map(function (line){
		var tokens =  line.substring(1).split(':')
		return [tokens[0].trim(), tokens[1].trim()]
	}))
	var pureDiagramCode = _.map(lines, onlyCompilables).join('\n').trim()
	var ast = nomnoml.transformParseIntoSyntaxTree()
	ast.directives = directives
	return ast
}

nomnoml.intermediateParse = function (x){
	return parser.parse(x)
}

nomnoml.transformParseIntoSyntaxTree = function (){

	var relationId = 0

	function transformRelations(adjacency){
		return  {
            id: 0,
            assoc: '-',
            start: entity.name,
            end: adjacency.end,
            startLabel: adjacency.name,
            endLabel: ""
        }
	}

	function transformAdjacencies(entity){
		_.map(entity.adjacencies, transformRelations)
	}
    
	function transformProperties(propertie){
		return propertie.name + " : " +propertie.returnType
	}

	function transformClassifier(entity){
		var compartmentProperties = nomnoml.Compartment(_.map(entity.properties, transformProperties), [], [])
		var compartmentName = nomnoml.Compartment([entity.name], [], [])		
		return nomnoml.Classifier("CLASS", entity.name, compartmentName.concat(compartmentProperties))		
	}

	return $.getJSON('http://localhost:9002/schema',function(data){
		var classifiers = _.map(data,transformClassifier)
		var adjacencies = _.map(data,transformAdjacencies)
		nomnoml.Compartment([entity.name], classifiers, adjacencies)
	})

}
