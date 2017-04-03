var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var color = d3.scale.category20c();

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
    console.log(d);
}

d3.select(self.frameElement).style("height", height + "px");



var updateYear = function(e) {
    year_label.textContent = slider.value;
    
    //OUR AJAX REQUEST TO FLASK FOR DATA
    var input = {'year': slider.value};
    $.get("/getData", input, function(root) {
	root = JSON.parse(root);
	svg.selectAll("path")
	    .data(partition.nodes(root))
	    .enter()
	console.log(currentRoot);
    });
  
    click(currentRoot);
};


var slider = document.getElementById("slider");
var year_label = document.getElementById("year_label");
slider.addEventListener("input", updateYear);

var intervalID;
var button_animate = document.getElementById("animate");
var animate = function(e) {
    slider.value = 2002;
    button_animate.textContent = "Stop";
    this.removeEventListener("click", animate);
    this.addEventListener("click", stop);
    console.log(this);
    intervalID = setInterval( function() {
	slider.value++;
	updateYear(e);
	if (slider.value >= 2015) {
	    clearInterval(intervalID);
	    stop(e);
	}
    }, 200); //change this for timer
}
var stop = function(e) {
    button_animate.textContent = "Animate";
    this.removeEventListener("click", stop);
    this.addEventListener("click", animate);
    console.log(this);
    clearInterval(intervalID);
}
button_animate.addEventListener("click", animate);


window.onload = function() {
    year_label.textContent = slider.value;
    
    var input = {'year': slider.value};
    $.get("/getData", input, function(root) {
	root = JSON.parse(root);
	currentRoot = root;
	svg.selectAll("path")
	    .data(partition.nodes(root))
	    .enter().append("path")
	    .attr("d", arc)
	    .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
	    .on("click", click)
	    .append("title")
	.text(function(d) { return d.name + "\n" + formatNumber(d.value); });
    });
};