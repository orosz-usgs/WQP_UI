/** Self-contained HTTPHeader parsing object.
 * Usage: headers = new HTTPHeaders(httpcon.getAllResponseHeaders())
 * 		then headers.get() or headers.get(QWConstants.HEADER_WARNING)
**/
function HTTPHeaders(headersString /* from httpcon.getAllResponseHeaders() */){
	var WARNING_HEADER_REGEX = /((\d{3}) (\w+) "([^"]+)"),*/;
	var HEADER_REGEX = /^([0-9a-zA-Z_-]+): (.+)/;
	//var WHEADER_REGEX = /(\d{3}) (\w+) "([^"]+)",*/;
	headersString = headersString.split("\n");
	/*
	* The browsers return the full set of headers as a single unparsed
	* string, delineated by "\n". However, the line breaks may occur
	* in the middle of a header, so the header lines have to be
	* reconstructed.
	*/
	var mergeLines = function(lines){
		var result = [];

		for  (var i=0; i<lines.length; i++){
			var currentLine = lines[i];
			if (currentLine.match(HEADER_REGEX)){
				result.push(currentLine)
			} else {
				result.push(result.pop() + currentLine);
			}
		}

		return result;
	};

	// The reconstructed lines are then parsed into {key, value} objects
	var parseHeaders = function(mergedLines){
		var result = [];
		for (var i=0; i<mergedLines.length; i++){
			var currentLine = mergedLines[i];
			var matches = currentLine.match(HEADER_REGEX);
			result.push({key: matches[1], value: matches[2]});
		}
		return result;
	}

	// However, where IE returns multiple Warning headers separately,
	// Firefox merges several Warning headers into one, and so
	// needs to be parsed out.
	var separateWarningHeaders = function(parsedHeaders){
		var result = [];
		for (var i=0; i<parsedHeaders.length; i++){
			var header = parsedHeaders[i];
			if (header.key == "Warning"){
				var value = header.value;
				var matches = value.match(WARNING_HEADER_REGEX);
				while (matches != null){
					result.push({key: "Warning", value: matches[1]})
					value = value.substring(matches[0].length);
					matches = value.match(WARNING_HEADER_REGEX);
				}
			} else {
				result.push(header);
			}
		}
		return result;
	}


	this.getWarnings = function(){
		var warnings = this.get("Warning");
		// return warnings by service
		var result = [];
		for (var i=0; i<warnings.length; i++){
			var matches = warnings[i].value.match(WARNING_HEADER_REGEX);
			var warning = {code: matches[2], agent: matches[3], text: matches[4]}; // ignoring date
			result.push(warning);
		}
		return result;
	}

	var headers = separateWarningHeaders(parseHeaders(mergeLines(headersString)));

	this.toString = function(){
		var out="";
		for (var i=0; i<headers.length; i++){
			out += "\n" + headers[i].key + " = " + headers[i].value;
		}
		return out;
	}

	// Returns an array of headers matching the key. All headers are returned if no key specified
	this.get = function(key){
		if (key == null) return headers;
		var result = [];
		for (var i=0; i<headers.length; i++){
			if (headers[i].key == key) result.push(headers[i]);
		}
		return result;
	}

}
