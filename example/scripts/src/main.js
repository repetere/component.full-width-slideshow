'use strict';

var fullWidthSlideshow = require('../../../index'),
	async = require('async'),
	webapp = require('./webapp');

var module1 = webapp,
	fullWidthSlideshow1 = false,
	fullWidthSlideshow2 = false;

window.onload = function(){
	fullWidthSlideshow1 = new fullWidthSlideshow({element:"cbp-fwslider"});
	fullWidthSlideshow2 = new fullWidthSlideshow({element:"cbp-fwslider2"});
	console.log("works");
	// async.parallel({
	//     template: function(callback){
	//     module1.grabTemplate(window.document.getElementById('component-template').innerHTML,callback);
	//     },
	//     componentData: function(callback){
 //            module1.grabData('https://s3.amazonaws.com/gpsampledata/component.list-view-scroll/contentspec.json',callback)
	//     }
	// },
	// function(err, results) {
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	listviewcroll1.render( results.template, results.componentData, "scrollerhtml");

	// 	var data2 = results.componentData;
	// 	data2.config.html.dom_id="anotherScroller";
	// 	listviewcroll2.render( results.template, data2, "anotherscrollerhtml");
	// });
};

// module1.on("grabbedData",function(){
// 	console.log("loaded data")
// });

// module1.on("grabbedTemplate",function(){
// 	console.log("loaded template")
// });

// listviewcroll1.on("renderedComponent",function(){
// 	listviewcroll1.init();
// 	console.log("rendered template");
// });

// listviewcroll2.on("renderedComponent",function(){
// 	listviewcroll2.init({idSelector: 'anotherScroller'});
// 	console.log("@(*#)@(# rendered template");
// });