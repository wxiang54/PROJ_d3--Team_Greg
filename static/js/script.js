var color = function(d) {
    if (d.name == "US Citizens")
	return d3.rgb(200, 200, 200);
    if (d.name == "asian")
	return d3.rgb(255, 102, 102);
    if (d.name == "white")
	return d3.rgb(255, 255, 51);
    if (d.name == "black")
	return d3.rgb(0, 255, 100);
    if (d.name == "hispanic")
	return d3.rgb(51, 153, 255);

    //now down to quints
    var pc = color(d.parent);
	
    if (d.name == "quint_one")
	return pc.brighter(1.3);
    if (d.name == "quint_two")
	return pc.brighter(1);
    if (d.name == "quint_three")
	return pc.brighter(0.5)
    if (d.name == "quint_four")
	return pc.darker(0.5);
    if (d.name == "quint_five")	
	return pc.darker(1);

    else return d3.rgb(255, 255, 255);
}

var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


var currentRoot, realRoot, path, text;
var click = function click(d) {
    currentRoot = d;
    svg.transition()
	.duration(0)
	.tween("scale", function() {
	    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		yd = d3.interpolate(y.domain(), [d.y, 1]),
		yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
	})
	.selectAll("path")
	.attrTween("d", function(d) { return function() { return arc(d); }; });
    // console.log(d);
    
    // fade out all text elements
    text.transition()
	.attr("opacity", 0)
	.text(function(d){
	    if (d.name != "US Citizens") {
		return formatNumber(d.value);
	    } else {
		return "";
	    }
	});
    ;
    
    path.transition()
        .duration(450)
        .attrTween("d", arcTween(d))
        .each("end", function(e, i) {
            // check if the animated element's data e lies within the visible angle span given in d
            if (e.x >= d.x && e.x < (d.x + d.dx)) {
		// get a selection of the associated text element
		var arcText = d3.select(this.parentNode).select("text");
		// fade in the text element and recalculate positions
		arcText.transition().duration(50)
                    .attr("opacity", 1)
                    .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                    .attr("x", function(d) { return y(d.y); });
            }
        });
}

d3.select(self.frameElement).style("height", height + "px");

function arcTween(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
	yd = d3.interpolate(y.domain(), [d.y, 1]),
	yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function(d, i) {
	return i
            ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
    };
}

function computeTextRotation(d) {
    return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}

function computeTextRotationR(d) {
    return (x(d.x + d.dx / 2 ) - Math.PI / 2) / Math.PI * 180;
}

var updateYear = function(e) {
    year_label.textContent = slider.value;
    
    //OUR AJAX REQUEST TO FLASK FOR DATA
    var input = {'year': slider.value};
    $.get("/getData", input, function(root) {
	root = JSON.parse(root);
	realRoot = currentRoot = root;
	var g = svg.selectAll("g");
	g.selectAll("text").remove();

	var path = svg.selectAll("path")
	    .data(partition.nodes(root))
	    .enter();

	var nt = g.append("text")
            .attr("transform", function(d) { return "rotate(" + computeTextRotationR(d) + ")"; })
            .attr("x", function(d) { return y(d.y); })
            .attr("y", function(d) { return x(d.x); })
            .attr("dx", "6") // margin
            .attr("dy", ".35em") // vertical-align
	    .attr("color", function(d) {
		if (d.name == "US Citizens") {
		    return "white";
		} 
		else return "black";
	    })
            .attr("style", 'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;')
            .text(function(d) { return formatNumber(d.value); });


	click(currentRoot);
    });
};



var slider = document.getElementById("slider");
var year_label = document.getElementById("year_label");
slider.addEventListener("input", updateYear);

var intervalID;
var button_animate = document.getElementById("animate");
var animate = function(e) {
    slider.value = 2002;
    button_animate.textContent = "Stop";
    button_animate.removeEventListener("click", animate);
    button_animate.addEventListener("click", stop);
    //    console.log(this);
    intervalID = setInterval( function() {
	slider.value++;
	updateYear(e);
	if (slider.value >= 2015) {
	    clearInterval(intervalID);
	    stop(e);
	}
    }, 1000); //change this for timer
};

var stop = function(e) {
    button_animate.textContent = "Animate";
    button_animate.removeEventListener("click", stop);
    button_animate.addEventListener("click", animate);
    //    console.log(this);
    clearInterval(intervalID);
}
button_animate.addEventListener("click", animate);

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRGB(hex) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    var rgb = [r, g, b];
    return rgb;
}

function generateShades(r, g, b){
    var r = r % 256;
    var g = g % 256;
    var b = b % 256;
    var shades = [];
    for(var i = 0; i < 5; i++){
	r += 55;
	g += 55;
	b += 55;
	shades.push(rgbToHex(r, g, b));
    }
    return shades;
}


var setup = function() {
    year_label.textContent = slider.value;

    var input = {'year': slider.value};
    $.get("/getData", input, function(root) {
	root = JSON.parse(root);
	currentRoot = realRoot = root;
	var g = svg.selectAll("g")
	    .data(partition.nodes(root))
	    .enter().append("g");
	path = g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {
		return color(d);
	    })
		    
		    
		//  if (d.children) return color(d.name);
		//  else {
		//    var quint;
		//    if (d.name == "quint_one") quint = 1;
		//    else if (d.name == "quint_two") quint = 2;
		//    else if (d.name == "quint_three") quint = 3;
		//    else if (d.name == "quint_four") quint = 4;
		//    else if (d.name == "quint_five") quint = 5;
		//    var rgb = hexToRGB(color(d.parent.name));
		//    var shades = generateShades(rgb[0], rgb[1], rgb[2]);
		//    console.log(shades);
		//    return shades[quint-1];
		//  }
		   .on("click", click)
		   text = g.append("text")
		   .attr("transform", function(d) {
                return "rotate(" + computeTextRotation(d) + ")"; })
		   .attr("x", function(d) { return y(d.y); })
		   .attr("dx", "6") // margin
		   .attr("dy", ".35em") // vertical-align
		   .attr("color", function(d) {
		       if (d.name == "US Citizens") {
			   console.log("WHITE");
			   return "white";
		       } 
		       else return "black";
		   })
            .attr("style", 'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;')
            .text(function(d) { return formatNumber(d.value); });

    });
};


window.onload = function(){
    setup();
};
