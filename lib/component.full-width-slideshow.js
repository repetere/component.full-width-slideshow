/*
 * component.full-width-slideshow
 * http://github.amexpub.com/modules
 *
 * Copyright (c) 2013 Amex Pub. All rights reserved.
 */

'use strict';
require('browsernizr/test/css/transitions');
require('browsernizr/test/css/transforms');
require('browsernizr/lib/prefixed');
require('browsernizr/test/css/transforms3d');

var Modernizr = require('browsernizr'),
	classie = require('classie'),
	extend = require('util-extend'),
	ejs = require('ejs'),
	events = require('events'),
	util = require('util'),
	Hammer = require('hammerjs');

var getEventTarget = function(e) {
    e = e || window.event;
    return e.target || e.srcElement;
};
// window.Modernizr = Modernizr;
var fullWidthSlideshow = function(config){
	// console.log(config);

	this.$el =document.getElementById( config.element ) ;
	this._init( config.options );
};

util.inherits(fullWidthSlideshow,events.EventEmitter);

fullWidthSlideshow.prototype.render = function(template,data,element){
	var componentHTML = ejs.render(template,data);
	document.getElementById(element).innerHTML = componentHTML;
	this.emit("renderedComponent");
};

fullWidthSlideshow.prototype._init = function( options ) {
	var defaults = {
		// default transition speed (ms)
		speed : 500,
		// default transition easing
		easing : 'ease'
	};
	// options = extend( defaults,options );
	// options
	options = options || {};
	this.options = extend( defaults,options );
	// cache some elements and initialize some variables
	this._config();
	// initialize/bind the events
	this._initEvents();
};

fullWidthSlideshow.prototype._config = function() {
	// the list of items
	this.$list = this.$el.getElementsByTagName('ul')[0];
	this.$items = this.$list.getElementsByTagName('li');
	// total number of items
	this.itemsCount = this.$items.length;
	// support for CSS Transitions & transforms

	this.support = Modernizr.csstransitions && Modernizr.csstransforms;
	this.support3d = Modernizr.csstransforms3d;
	// transition end event name and transform name
	// transition end event name
	var transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition' : 'transitionend',
			'OTransition' : 'oTransitionEnd',
			'msTransition' : 'MSTransitionEnd',
			'transition' : 'transitionend'
		},
		transformNames = {
			'WebkitTransform' : '-webkit-transform',
			'MozTransform' : '-moz-transform',
			'OTransform' : '-o-transform',
			'msTransform' : '-ms-transform',
			'transform' : 'transform'
		};

	if( this.support ) {
		this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ] + '.p_c_fws';
		this.transformName = transformNames[ Modernizr.prefixed( 'transform' ) ];
	}
	// current and old item´s index
	this.current = 0;
	this.old = 0;
	// check if the list is currently moving
	this.isAnimating = false;
	// the list (ul) will have a width of 100% x itemsCount
	this.$list.style.width = 100 * this.itemsCount + '%';
	// apply the transition
	if( this.support ) {
		this.$list.style.transition = this.transformName + ' ' + this.options.speed + 'ms ' + this.options.easing ;
	}
	// each item will have a width of 100 / itemsCount

	for(var x in this.$items){
		if(this.$items[x].style){
			this.$items[x].style.width = 100 / this.itemsCount + '%';
		}
	}
	// add navigation arrows and the navigation dots if there is more than 1 item
	if( this.itemsCount > 1 ) {
		// add navigation arrows (the previous arrow is not shown initially):
		var nav = document.createElement('nav');
		nav.innerHTML='<span class="p_c_fws-slideprev" style="display:none;">&lt;</span><span class="p_c_fws-slidenext">&gt;</span>';
		this.$el.appendChild(nav);
		this.$navPrev = this.$el.getElementsByClassName("p_c_fws-slideprev")[0];
		this.$navNext = this.$el.getElementsByClassName("p_c_fws-slidenext")[0];

		var dots = '';
		for( var i = 0; i < this.itemsCount; ++i ) {
			// current dot will have the class p_c_fws-cuurentdot
			var dot = i === this.current ? '<span class="p_c_fws-cuurentdot" data-itr="'+i+'"></span>' : '<span data-itr="'+i+'"></span>';
			dots += dot;
		}
		var navDots = document.createElement('div');
		navDots.setAttribute("class", "p_c_fws-slidedots");
		// console.log("navDots",navDots);
		navDots.innerHTML =dots;
		this.$el.appendChild(navDots);
		this.$navDots = navDots.getElementsByTagName('span');
	}
};

fullWidthSlideshow.prototype._initEvents = function() {
	var self = this;
	if(this.options){
		var hammertime = new Hammer(this.$el,{
	        drag_block_vertical: true,
	        drag_block_horizontal: true
	    });

	    hammertime.on("swiperight", function(ev) {
			this._navigate('previous');
		}.bind(this));

	    hammertime.on("swipeleft", function(ev) {
			this._navigate('next');
		}.bind(this));
	}

	if( this.itemsCount > 1 ) {
		this.$navPrev.addEventListener('click',function(){
				this._navigate('previous');
			}.bind(this));
		this.$navNext.addEventListener('click',function(){
				this._navigate('next');
			}.bind(this));

		this.$navDotDom = this.$el.getElementsByClassName("p_c_fws-slidedots")[0];

		this.$navDotDom.addEventListener('click',function(event){
			var target = getEventTarget(event);
			if(target.tagName==="SPAN"){
				this._jump(target.getAttribute("data-itr"));
			}
		}.bind(this));
	}
};

fullWidthSlideshow.prototype._navigate = function( direction ) {

	// do nothing if the list is currently moving
	if( this.isAnimating ) {
		return false;
	}

	this.isAnimating = true;
	// update old and current values
	this.old = this.current;
	if( direction === 'next' && this.current < this.itemsCount - 1 ) {
		++this.current;
	}
	else if( direction === 'previous' && this.current > 0 ) {
		--this.current;
	}
	this.emit("navigatedComponent",this.current);

	// slide
	this._slide();
	// console.log("this._slide()",this._slide());

};
fullWidthSlideshow.prototype._slide = function() {

	// check which navigation arrows should be shown
	this._toggleNavControls();
	// translate value
	var translateVal = -1 * this.current * 100 / this.itemsCount;

	if( this.support ) {
		this.$list.style[this.transformName]= this.support3d ? 'translate3d(' + translateVal + '%,0,0)' : 'translate(' + translateVal + '%)';
	}
	else {
		this.$list.style['margin-left']= -1 * this.current * 100 + '%';
	}

	var transitionendfn = function() {
		this.isAnimating = false;
	}.bind(this);

	if( this.support ) {
		this.$list.addEventListener(this.transEndEventName, transitionendfn());
	}
	else {
		transitionendfn.call();
	}

};
fullWidthSlideshow.prototype._toggleNavControls = function() {

	// if the current item is the first one in the list, the left arrow is not shown
	// if the current item is the last one in the list, the right arrow is not shown
	switch( this.current ) {
		case 0 : this.$navNext.style.display="block"; this.$navPrev.style.display="none"; break;
		case this.itemsCount - 1 : this.$navNext.style.display="none"; this.$navPrev.style.display="block"; break;
		default : this.$navNext.style.display="block"; this.$navPrev.style.display="block"; break;
	}
	// highlight navigation dot
	classie.remove( this.$navDots[this.old], 'p_c_fws-cuurentdot' );
	classie.add( this.$navDots[this.current], 'p_c_fws-cuurentdot' );

	// this.$navDots[this.old].removeClass( 'p_c_fws-cuurentdot' ).end().eq( this.current ).addClass( 'p_c_fws-cuurentdot' );

};
fullWidthSlideshow.prototype._jump = function( position ) {

	// do nothing if clicking on the current dot, or if the list is currently moving
	if( position === this.current || this.isAnimating ) {
		return false;
	}
	this.isAnimating = true;
	// update old and current values
	this.old = this.current;
	this.current = position;
	// slide
	this._slide();

};
fullWidthSlideshow.prototype.destroy = function() {

	if( this.itemsCount > 1 ) {
		this.$navPrev.parent().remove();
		this.$navDots.parent().remove();
	}
	this.$list.css( 'width', 'auto' );
	if( this.support ) {
		this.$list.css( 'transition', 'none' );
	}
	this.$items.css( 'width', 'auto' );

};
window.fullWidthSlideshow = fullWidthSlideshow;
module.exports = fullWidthSlideshow;