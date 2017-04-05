var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var color = d3.scale.category20();

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


var currentRoot;
var click = function click(d) {

    currentRoot = d;
    svg.transition()
	.duration(750)
	.tween("scale", function() {
	    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		yd = d3.interpolate(y.domain(), [d.y, 1]),
		yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
	})
	.selectAll("path")
	.attrTween("d", function(d) { return function() { return arc(d); }; });
    // console.log(d);
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
        .attr("color", "black")
        .attr("style", 'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;')
        .text(function(d) { return d.name + "\n" + formatNumber(d.value); });
  
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
    }, 200); //change this for timer
};

var stop = function(e) {
    button_animate.textContent = "Animate";
    button_animate.removeEventListener("click", stop);
    button_animate.addEventListener("click", animate);
//    console.log(this);
    clearInterval(intervalID);
}
button_animate.addEventListener("click", animate);


var setup = function() {
    year_label.textContent = slider.value;
    
    var input = {'year': slider.value};
    $.get("/getData", input, function(root) {
	root = JSON.parse(root);
	currentRoot = root;
	var g = svg.selectAll("g")
	    .data(partition.nodes(root))
	    .enter().append("g");
	var path = g.append("path")    
        .attr("d", arc)
	    .style("fill", function(d) { return color(d.name); })
	    .on("click", click)
    var text = g.append("text")
            .attr("transform", function(d) { 
                return "rotate(" + computeTextRotation(d) + ")"; })
            .attr("x", function(d) { return y(d.y); })
            .attr("dx", "6") // margin
            .attr("dy", ".35em") // vertical-align
            .attr("color", "black")
            .attr("style", 'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;')
            .text(function(d) { return d.name + "\n" + formatNumber(d.value); });

    function click(d) {
       // fade out all text elements
       text.transition().attr("opacity", 0);

       path.transition()
         .duration(750)
         .attrTween("d", arcTween(d))
         .each("end", function(e, i) {
             // check if the animated element's data e lies within the visible angle span given in d
             if (e.x >= d.x && e.x < (d.x + d.dx)) {
               // get a selection of the associated text element
               var arcText = d3.select(this.parentNode).select("text");
               // fade in the text element and recalculate positions
               arcText.transition().duration(750)
                 .attr("opacity", 1)
                 .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                 .attr("x", function(d) { return y(d.y); });
             }
         });
     };
});
};


window.onload = function(){
    setup();
};
