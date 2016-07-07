/*
	BT v4.0.0
	Build:
		Roberta Piga - roberta.piga@mslgroup.com
		Adam Duncan - adam.duncan@mslgroup.com
	Date: 20/05/2015
*/
var Swiper = function (selector, params) {
	'use strict';

	/*=========================
      A little bit dirty but required part for IE8 and old FF support
      ===========================*/
	if (document.body.__defineGetter__) {
		if (HTMLElement) {
			var element = HTMLElement.prototype;
			if (element.__defineGetter__) {
				element.__defineGetter__('outerHTML', function () { return new XMLSerializer().serializeToString(this); });
			}
		}
	}

	if (!window.getComputedStyle) {
		window.getComputedStyle = function (el, pseudo) {
			this.el = el;
			this.getPropertyValue = function (prop) {
				var re = /(\-([a-z]){1})/g;
				if (prop === 'float') prop = 'styleFloat';
				if (re.test(prop)) {
					prop = prop.replace(re, function () {
						return arguments[2].toUpperCase();
					});
				}
				return el.currentStyle[prop] ? el.currentStyle[prop] : null;
			};
			return this;
		};
	}
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (obj, start) {
			for (var i = (start || 0), j = this.length; i < j; i++) {
				if (this[i] === obj) { return i; }
			}
			return -1;
		};
	}
	if (!document.querySelectorAll) {
		if (!window.jQuery) return;
	}
	function $$(selector, context) {
		if (document.querySelectorAll)
			return (context || document).querySelectorAll(selector);
		else
			return jQuery(selector, context);
	}

	/*=========================
      Check for correct selector
      ===========================*/
	if (typeof selector === 'undefined') return;

	if (!(selector.nodeType)) {
		if ($$(selector).length === 0) return;
	}

	/*=========================
	 _this
	 ===========================*/
	var _this = this;

	/*=========================
	 Default Flags and vars
	 ===========================*/
	_this.touches = {
		start: 0,
		startX: 0,
		startY: 0,
		current: 0,
		currentX: 0,
		currentY: 0,
		diff: 0,
		abs: 0
	};
	_this.positions = {
		start: 0,
		abs: 0,
		diff: 0,
		current: 0
	};
	_this.times = {
		start: 0,
		end: 0
	};

	_this.id = (new Date()).getTime();
	_this.container = (selector.nodeType) ? selector : $$(selector)[0];
	_this.isTouched = false;
	_this.isMoved = false;
	_this.activeIndex = 0;
	_this.centerIndex = 0;
	_this.activeLoaderIndex = 0;
	_this.activeLoopIndex = 0;
	_this.previousIndex = null;
	_this.velocity = 0;
	_this.snapGrid = [];
	_this.slidesGrid = [];
	_this.imagesToLoad = [];
	_this.imagesLoaded = 0;
	_this.wrapperLeft = 0;
	_this.wrapperRight = 0;
	_this.wrapperTop = 0;
	_this.wrapperBottom = 0;
	_this.isAndroid = navigator.userAgent.toLowerCase().indexOf('android') >= 0;
	var wrapper, slideSize, wrapperSize, direction, isScrolling, containerSize;

	/*=========================
      Default Parameters
      ===========================*/
	var defaults = {
		eventTarget: 'wrapper', // or 'container'
		mode: 'horizontal', // or 'vertical'
		touchRatio: 1,
		speed: 300,
		freeMode: false,
		freeModeFluid: false,
		momentumRatio: 1,
		momentumBounce: true,
		momentumBounceRatio: 1,
		slidesPerView: 1,
		slidesPerGroup: 1,
		slidesPerViewFit: true, //Fit to slide when spv "auto" and slides larger than container
		simulateTouch: true,
		followFinger: true,
		shortSwipes: true,
		longSwipesRatio: 0.5,
		moveStartThreshold: false,
		onlyExternal: false,
		createPagination: true,
		pagination: false,
		paginationElement: 'span',
		paginationClickable: false,
		paginationAsRange: true,
		resistance: true, // or false or 100%
		scrollContainer: false,
		preventLinks: true,
		preventLinksPropagation: false,
		noSwiping: false, // or class
		noSwipingClass: 'swiper-no-swiping', //:)
		initialSlide: 0,
		keyboardControl: false,
		mousewheelControl: false,
		mousewheelControlForceToAxis: false,
		useCSS3Transforms: true,
		// Autoplay
		autoplay: false,
		autoplayDisableOnInteraction: true,
		autoplayStopOnLast: false,
		//Loop mode
		loop: false,
		loopAdditionalSlides: 0,
		// Round length values
		roundLengths: false,
		//Auto Height
		calculateHeight: false,
		cssWidthAndHeight: false,
		//Images Preloader
		updateOnImagesReady: true,
		//Form elements
		releaseFormElements: true,
		//Watch for active slide, useful when use effects on different slide states
		watchActiveIndex: false,
		//Slides Visibility Fit
		visibilityFullFit: false,
		//Slides Offset
		offsetPxBefore: 0,
		offsetPxAfter: 0,
		offsetSlidesBefore: 0,
		offsetSlidesAfter: 0,
		centeredSlides: false,
		//Queue callbacks
		queueStartCallbacks: false,
		queueEndCallbacks: false,
		//Auto Resize
		autoResize: true,
		resizeReInit: false,
		//DOMAnimation
		DOMAnimation: true,
		//Slides Loader
		loader: {
			slides: [], //array with slides
			slidesHTMLType: 'inner', // or 'outer'
			surroundGroups: 1, //keep preloaded slides groups around view
			logic: 'reload', //or 'change'
			loadAllSlides: false
		},
		//Namespace
		slideElement: 'div',
		slideClass: 'swiper-slide',
		slideActiveClass: 'swiper-slide-active',
		slideVisibleClass: 'swiper-slide-visible',
		slideDuplicateClass: 'swiper-slide-duplicate',
		wrapperClass: 'swiper-wrapper',
		paginationElementClass: 'swiper-pagination-switch',
		paginationActiveClass: 'swiper-active-switch',
		paginationVisibleClass: 'swiper-visible-switch'
	};
	params = params || {};
	for (var prop in defaults) {
		if (prop in params && typeof params[prop] === 'object') {
			for (var subProp in defaults[prop]) {
				if (!(subProp in params[prop])) {
					params[prop][subProp] = defaults[prop][subProp];
				}
			}
		}
		else if (!(prop in params)) {
			params[prop] = defaults[prop];
		}
	}
	_this.params = params;
	if (params.scrollContainer) {
		params.freeMode = true;
		params.freeModeFluid = true;
	}
	if (params.loop) {
		params.resistance = '100%';
	}
	var isH = params.mode === 'horizontal';

	/*=========================
      Define Touch Events
      ===========================*/
	var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
	if (_this.browser.ie10) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
	if (_this.browser.ie11) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];

	_this.touchEvents = {
		touchStart: _this.support.touch || !params.simulateTouch ? 'touchstart' : desktopEvents[0],
		touchMove: _this.support.touch || !params.simulateTouch ? 'touchmove' : desktopEvents[1],
		touchEnd: _this.support.touch || !params.simulateTouch ? 'touchend' : desktopEvents[2]
	};

	/*=========================
      Wrapper
      ===========================*/
	for (var i = _this.container.childNodes.length - 1; i >= 0; i--) {
		if (_this.container.childNodes[i].className) {
			var _wrapperClasses = _this.container.childNodes[i].className.split(/\s+/);
			for (var j = 0; j < _wrapperClasses.length; j++) {
				if (_wrapperClasses[j] === params.wrapperClass) {
					wrapper = _this.container.childNodes[i];
				}
			}
		}
	}

	_this.wrapper = wrapper;
	/*=========================
      Slide API
      ===========================*/
	_this._extendSwiperSlide = function (el) {
		el.append = function () {
			if (params.loop) {
				el.insertAfter(_this.slides.length - _this.loopedSlides);
			}
			else {
				_this.wrapper.appendChild(el);
				_this.reInit();
			}

			return el;
		};
		el.prepend = function () {
			if (params.loop) {
				_this.wrapper.insertBefore(el, _this.slides[_this.loopedSlides]);
				_this.removeLoopedSlides();
				_this.calcSlides();
				_this.createLoop();
			}
			else {
				_this.wrapper.insertBefore(el, _this.wrapper.firstChild);
			}
			_this.reInit();
			return el;
		};
		el.insertAfter = function (index) {
			if (typeof index === 'undefined') return false;
			var beforeSlide;

			if (params.loop) {
				beforeSlide = _this.slides[index + 1 + _this.loopedSlides];
				if (beforeSlide) {
					_this.wrapper.insertBefore(el, beforeSlide);
				}
				else {
					_this.wrapper.appendChild(el);
				}
				_this.removeLoopedSlides();
				_this.calcSlides();
				_this.createLoop();
			}
			else {
				beforeSlide = _this.slides[index + 1];
				_this.wrapper.insertBefore(el, beforeSlide);
			}
			_this.reInit();
			return el;
		};
		el.clone = function () {
			return _this._extendSwiperSlide(el.cloneNode(true));
		};
		el.remove = function () {
			_this.wrapper.removeChild(el);
			_this.reInit();
		};
		el.html = function (html) {
			if (typeof html === 'undefined') {
				return el.innerHTML;
			}
			else {
				el.innerHTML = html;
				return el;
			}
		};
		el.index = function () {
			var index;
			for (var i = _this.slides.length - 1; i >= 0; i--) {
				if (el === _this.slides[i]) index = i;
			}
			return index;
		};
		el.isActive = function () {
			if (el.index() === _this.activeIndex) return true;
			else return false;
		};
		if (!el.swiperSlideDataStorage) el.swiperSlideDataStorage = {};
		el.getData = function (name) {
			return el.swiperSlideDataStorage[name];
		};
		el.setData = function (name, value) {
			el.swiperSlideDataStorage[name] = value;
			return el;
		};
		el.data = function (name, value) {
			if (typeof value === 'undefined') {
				return el.getAttribute('data-' + name);
			}
			else {
				el.setAttribute('data-' + name, value);
				return el;
			}
		};
		el.getWidth = function (outer, round) {
			return _this.h.getWidth(el, outer, round);
		};
		el.getHeight = function (outer, round) {
			return _this.h.getHeight(el, outer, round);
		};
		el.getOffset = function () {
			return _this.h.getOffset(el);
		};
		return el;
	};

	//Calculate information about number of slides
	_this.calcSlides = function (forceCalcSlides) {
		var oldNumber = _this.slides ? _this.slides.length : false;
		_this.slides = [];
		_this.displaySlides = [];
		for (var i = 0; i < _this.wrapper.childNodes.length; i++) {
			if (_this.wrapper.childNodes[i].className) {
				var _className = _this.wrapper.childNodes[i].className;
				var _slideClasses = _className.split(/\s+/);
				for (var j = 0; j < _slideClasses.length; j++) {
					if (_slideClasses[j] === params.slideClass) {
						_this.slides.push(_this.wrapper.childNodes[i]);
					}
				}
			}
		}
		for (i = _this.slides.length - 1; i >= 0; i--) {
			_this._extendSwiperSlide(_this.slides[i]);
		}
		if (oldNumber === false) return;
		if (oldNumber !== _this.slides.length || forceCalcSlides) {

			// Number of slides has been changed
			removeSlideEvents();
			addSlideEvents();
			_this.updateActiveSlide();
			if (_this.params.pagination) _this.createPagination();
			_this.callPlugins('numberOfSlidesChanged');
		}
	};

	//Create Slide
	_this.createSlide = function (html, slideClassList, el) {
		slideClassList = slideClassList || _this.params.slideClass;
		el = el || params.slideElement;
		var newSlide = document.createElement(el);
		newSlide.innerHTML = html || '';
		newSlide.className = slideClassList;
		return _this._extendSwiperSlide(newSlide);
	};

	//Append Slide
	_this.appendSlide = function (html, slideClassList, el) {
		if (!html) return;
		if (html.nodeType) {
			return _this._extendSwiperSlide(html).append();
		}
		else {
			return _this.createSlide(html, slideClassList, el).append();
		}
	};
	_this.prependSlide = function (html, slideClassList, el) {
		if (!html) return;
		if (html.nodeType) {
			return _this._extendSwiperSlide(html).prepend();
		}
		else {
			return _this.createSlide(html, slideClassList, el).prepend();
		}
	};
	_this.insertSlideAfter = function (index, html, slideClassList, el) {
		if (typeof index === 'undefined') return false;
		if (html.nodeType) {
			return _this._extendSwiperSlide(html).insertAfter(index);
		}
		else {
			return _this.createSlide(html, slideClassList, el).insertAfter(index);
		}
	};
	_this.removeSlide = function (index) {
		if (_this.slides[index]) {
			if (params.loop) {
				if (!_this.slides[index + _this.loopedSlides]) return false;
				_this.slides[index + _this.loopedSlides].remove();
				_this.removeLoopedSlides();
				_this.calcSlides();
				_this.createLoop();
			}
			else _this.slides[index].remove();
			return true;
		}
		else return false;
	};
	_this.removeLastSlide = function () {
		if (_this.slides.length > 0) {
			if (params.loop) {
				_this.slides[_this.slides.length - 1 - _this.loopedSlides].remove();
				_this.removeLoopedSlides();
				_this.calcSlides();
				_this.createLoop();
			}
			else _this.slides[_this.slides.length - 1].remove();
			return true;
		}
		else {
			return false;
		}
	};
	_this.removeAllSlides = function () {
		for (var i = _this.slides.length - 1; i >= 0; i--) {
			_this.slides[i].remove();
		}
	};
	_this.getSlide = function (index) {
		return _this.slides[index];
	};
	_this.getLastSlide = function () {
		return _this.slides[_this.slides.length - 1];
	};
	_this.getFirstSlide = function () {
		return _this.slides[0];
	};

	//Currently Active Slide
	_this.activeSlide = function () {
		return _this.slides[_this.activeIndex];
	};

	/*=========================
     Wrapper for Callbacks : Allows additive callbacks via function arrays
     ===========================*/
	_this.fireCallback = function () {
		var callback = arguments[0];
		if (Object.prototype.toString.call(callback) === '[object Array]') {
			for (var i = 0; i < callback.length; i++) {
				if (typeof callback[i] === 'function') {
					callback[i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
				}
			}
		} else if (Object.prototype.toString.call(callback) === '[object String]') {
			if (params['on' + callback]) _this.fireCallback(params['on' + callback], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
		} else {
			callback(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
		}
	};
	function isArray(obj) {
		if (Object.prototype.toString.apply(obj) === '[object Array]') return true;
		return false;
	}

	/**
     * Allows user to add callbacks, rather than replace them
     * @param callback
     * @param func
     * @return {*}
     */
	_this.addCallback = function (callback, func) {
		var _this = this, tempFunc;
		if (_this.params['on' + callback]) {
			if (isArray(this.params['on' + callback])) {
				return this.params['on' + callback].push(func);
			} else if (typeof this.params['on' + callback] === 'function') {
				tempFunc = this.params['on' + callback];
				this.params['on' + callback] = [];
				this.params['on' + callback].push(tempFunc);
				return this.params['on' + callback].push(func);
			}
		} else {
			this.params['on' + callback] = [];
			return this.params['on' + callback].push(func);
		}
	};
	_this.removeCallbacks = function (callback) {
		if (_this.params['on' + callback]) {
			_this.params['on' + callback] = null;
		}
	};

	/*=========================
      Plugins API
      ===========================*/
	var _plugins = [];
	for (var plugin in _this.plugins) {
		if (params[plugin]) {
			var p = _this.plugins[plugin](_this, params[plugin]);
			if (p) _plugins.push(p);
		}
	}
	_this.callPlugins = function (method, args) {
		if (!args) args = {};
		for (var i = 0; i < _plugins.length; i++) {
			if (method in _plugins[i]) {
				_plugins[i][method](args);
			}
		}
	};

	/*=========================
      Windows Phone 8 Fix
      ===========================*/
	if ((_this.browser.ie10 || _this.browser.ie11) && !params.onlyExternal) {
		_this.wrapper.classList.add('swiper-wp8-' + (isH ? 'horizontal' : 'vertical'));
	}

	/*=========================
      Free Mode Class
      ===========================*/
	if (params.freeMode) {
		_this.container.className += ' swiper-free-mode';
	}

	/*==================================================
        Init/Re-init/Resize Fix
    ====================================================*/
	_this.initialized = false;
	_this.init = function (force, forceCalcSlides) {
		var _width = _this.h.getWidth(_this.container, false, params.roundLengths);
		var _height = _this.h.getHeight(_this.container, false, params.roundLengths);
		if (_width === _this.width && _height === _this.height && !force) return;

		_this.width = _width;
		_this.height = _height;

		var slideWidth, slideHeight, slideMaxHeight, wrapperWidth, wrapperHeight, slideLeft;
		var i; // loop index variable to avoid JSHint W004 / W038
		containerSize = isH ? _width : _height;
		var wrapper = _this.wrapper;

		if (force) {
			_this.calcSlides(forceCalcSlides);
		}

		if (params.slidesPerView === 'auto') {
			//Auto mode
			var slidesWidth = 0;
			var slidesHeight = 0;

			//Unset Styles
			if (params.slidesOffset > 0) {
				wrapper.style.paddingLeft = '';
				wrapper.style.paddingRight = '';
				wrapper.style.paddingTop = '';
				wrapper.style.paddingBottom = '';
			}
			wrapper.style.width = '';
			wrapper.style.height = '';
			if (params.offsetPxBefore > 0) {
				if (isH) _this.wrapperLeft = params.offsetPxBefore;
				else _this.wrapperTop = params.offsetPxBefore;
			}
			if (params.offsetPxAfter > 0) {
				if (isH) _this.wrapperRight = params.offsetPxAfter;
				else _this.wrapperBottom = params.offsetPxAfter;
			}

			if (params.centeredSlides) {
				if (isH) {
					_this.wrapperLeft = (containerSize - this.slides[0].getWidth(true, params.roundLengths)) / 2;
					_this.wrapperRight = (containerSize - _this.slides[_this.slides.length - 1].getWidth(true, params.roundLengths)) / 2;
				}
				else {
					_this.wrapperTop = (containerSize - _this.slides[0].getHeight(true, params.roundLengths)) / 2;
					_this.wrapperBottom = (containerSize - _this.slides[_this.slides.length - 1].getHeight(true, params.roundLengths)) / 2;
				}
			}

			if (isH) {
				if (_this.wrapperLeft >= 0) wrapper.style.paddingLeft = _this.wrapperLeft + 'px';
				if (_this.wrapperRight >= 0) wrapper.style.paddingRight = _this.wrapperRight + 'px';
			}
			else {
				if (_this.wrapperTop >= 0) wrapper.style.paddingTop = _this.wrapperTop + 'px';
				if (_this.wrapperBottom >= 0) wrapper.style.paddingBottom = _this.wrapperBottom + 'px';
			}
			slideLeft = 0;
			var centeredSlideLeft = 0;
			_this.snapGrid = [];
			_this.slidesGrid = [];

			slideMaxHeight = 0;
			for (i = 0; i < _this.slides.length; i++) {
				slideWidth = _this.slides[i].getWidth(true, params.roundLengths);
				slideHeight = _this.slides[i].getHeight(true, params.roundLengths);
				if (params.calculateHeight) {
					slideMaxHeight = Math.max(slideMaxHeight, slideHeight);
				}
				var _slideSize = isH ? slideWidth : slideHeight;
				if (params.centeredSlides) {
					var nextSlideWidth = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getWidth(true, params.roundLengths);
					var nextSlideHeight = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getHeight(true, params.roundLengths);
					var nextSlideSize = isH ? nextSlideWidth : nextSlideHeight;
					if (_slideSize > containerSize) {
						if (params.slidesPerViewFit) {
							_this.snapGrid.push(slideLeft + _this.wrapperLeft);
							_this.snapGrid.push(slideLeft + _slideSize - containerSize + _this.wrapperLeft);
						}
						else {
							for (var j = 0; j <= Math.floor(_slideSize / (containerSize + _this.wrapperLeft)) ; j++) {
								if (j === 0) _this.snapGrid.push(slideLeft + _this.wrapperLeft);
								else _this.snapGrid.push(slideLeft + _this.wrapperLeft + containerSize * j);
							}
						}
						_this.slidesGrid.push(slideLeft + _this.wrapperLeft);
					}
					else {
						_this.snapGrid.push(centeredSlideLeft);
						_this.slidesGrid.push(centeredSlideLeft);
					}
					centeredSlideLeft += _slideSize / 2 + nextSlideSize / 2;
				}
				else {
					if (_slideSize > containerSize) {
						if (params.slidesPerViewFit) {
							_this.snapGrid.push(slideLeft);
							_this.snapGrid.push(slideLeft + _slideSize - containerSize);
						}
						else {
							if (containerSize !== 0) {
								for (var k = 0; k <= Math.floor(_slideSize / containerSize) ; k++) {
									_this.snapGrid.push(slideLeft + containerSize * k);
								}
							}
							else {
								_this.snapGrid.push(slideLeft);
							}
						}

					}
					else {
						_this.snapGrid.push(slideLeft);
					}
					_this.slidesGrid.push(slideLeft);
				}

				slideLeft += _slideSize;

				slidesWidth += slideWidth;
				slidesHeight += slideHeight;
			}
			if (params.calculateHeight) _this.height = slideMaxHeight;
			if (isH) {
				wrapperSize = slidesWidth + _this.wrapperRight + _this.wrapperLeft;
				wrapper.style.width = (slidesWidth) + 'px';
				wrapper.style.height = (_this.height) + 'px';
			}
			else {
				wrapperSize = slidesHeight + _this.wrapperTop + _this.wrapperBottom;
				wrapper.style.width = (_this.width) + 'px';
				wrapper.style.height = (slidesHeight) + 'px';
			}

		}
		else if (params.scrollContainer) {
			//Scroll Container
			wrapper.style.width = '';
			wrapper.style.height = '';
			wrapperWidth = _this.slides[0].getWidth(true, params.roundLengths);
			wrapperHeight = _this.slides[0].getHeight(true, params.roundLengths);
			wrapperSize = isH ? wrapperWidth : wrapperHeight;
			wrapper.style.width = wrapperWidth + 'px';
			wrapper.style.height = wrapperHeight + 'px';
			slideSize = isH ? wrapperWidth : wrapperHeight;

		}
		else {
			//For usual slides
			if (params.calculateHeight) {
				slideMaxHeight = 0;
				wrapperHeight = 0;
				//ResetWrapperSize
				if (!isH) _this.container.style.height = '';
				wrapper.style.height = '';

				for (i = 0; i < _this.slides.length; i++) {
					//ResetSlideSize
					_this.slides[i].style.height = '';
					slideMaxHeight = Math.max(_this.slides[i].getHeight(true), slideMaxHeight);
					if (!isH) wrapperHeight += _this.slides[i].getHeight(true);
				}
				slideHeight = slideMaxHeight;
				_this.height = slideHeight;

				if (isH) wrapperHeight = slideHeight;
				else {
					containerSize = slideHeight;
					_this.container.style.height = containerSize + 'px';
				}
			}
			else {
				slideHeight = isH ? _this.height : _this.height / params.slidesPerView;
				if (params.roundLengths) slideHeight = Math.round(slideHeight);
				wrapperHeight = isH ? _this.height : _this.slides.length * slideHeight;
			}
			slideWidth = isH ? _this.width / params.slidesPerView : _this.width;
			if (params.roundLengths) slideWidth = Math.round(slideWidth);
			wrapperWidth = isH ? _this.slides.length * slideWidth : _this.width;
			slideSize = isH ? slideWidth : slideHeight;

			if (params.offsetSlidesBefore > 0) {
				if (isH) _this.wrapperLeft = slideSize * params.offsetSlidesBefore;
				else _this.wrapperTop = slideSize * params.offsetSlidesBefore;
			}
			if (params.offsetSlidesAfter > 0) {
				if (isH) _this.wrapperRight = slideSize * params.offsetSlidesAfter;
				else _this.wrapperBottom = slideSize * params.offsetSlidesAfter;
			}
			if (params.offsetPxBefore > 0) {
				if (isH) _this.wrapperLeft = params.offsetPxBefore;
				else _this.wrapperTop = params.offsetPxBefore;
			}
			if (params.offsetPxAfter > 0) {
				if (isH) _this.wrapperRight = params.offsetPxAfter;
				else _this.wrapperBottom = params.offsetPxAfter;
			}
			if (params.centeredSlides) {
				if (isH) {
					_this.wrapperLeft = (containerSize - slideSize) / 2;
					_this.wrapperRight = (containerSize - slideSize) / 2;
				}
				else {
					_this.wrapperTop = (containerSize - slideSize) / 2;
					_this.wrapperBottom = (containerSize - slideSize) / 2;
				}
			}
			if (isH) {
				if (_this.wrapperLeft > 0) wrapper.style.paddingLeft = _this.wrapperLeft + 'px';
				if (_this.wrapperRight > 0) wrapper.style.paddingRight = _this.wrapperRight + 'px';
			}
			else {
				if (_this.wrapperTop > 0) wrapper.style.paddingTop = _this.wrapperTop + 'px';
				if (_this.wrapperBottom > 0) wrapper.style.paddingBottom = _this.wrapperBottom + 'px';
			}

			wrapperSize = isH ? wrapperWidth + _this.wrapperRight + _this.wrapperLeft : wrapperHeight + _this.wrapperTop + _this.wrapperBottom;
			if (!params.cssWidthAndHeight) {
				if (parseFloat(wrapperWidth) > 0) {
					wrapper.style.width = wrapperWidth + 'px';
				}
				if (parseFloat(wrapperHeight) > 0) {
					wrapper.style.height = wrapperHeight + 'px';
				}
			}
			slideLeft = 0;
			_this.snapGrid = [];
			_this.slidesGrid = [];
			for (i = 0; i < _this.slides.length; i++) {
				_this.snapGrid.push(slideLeft);
				_this.slidesGrid.push(slideLeft);
				slideLeft += slideSize;
				if (!params.cssWidthAndHeight) {
					if (parseFloat(slideWidth) > 0) {
						_this.slides[i].style.width = slideWidth + 'px';
					}
					if (parseFloat(slideHeight) > 0) {
						_this.slides[i].style.height = slideHeight + 'px';
					}
				}
			}

		}

		if (!_this.initialized) {
			_this.callPlugins('onFirstInit');
			if (params.onFirstInit) _this.fireCallback(params.onFirstInit, _this);
		}
		else {
			_this.callPlugins('onInit');
			if (params.onInit) _this.fireCallback(params.onInit, _this);
		}
		_this.initialized = true;
	};

	_this.reInit = function (forceCalcSlides) {
		_this.init(true, forceCalcSlides);
	};

	_this.resizeFix = function (reInit) {
		_this.callPlugins('beforeResizeFix');

		_this.init(params.resizeReInit || reInit);

		// swipe to active slide in fixed mode
		if (!params.freeMode) {
			_this.swipeTo((params.loop ? _this.activeLoopIndex : _this.activeIndex), 0, false);
			// Fix autoplay
			if (params.autoplay) {
				if (_this.support.transitions && typeof autoplayTimeoutId !== 'undefined') {
					if (typeof autoplayTimeoutId !== 'undefined') {
						clearTimeout(autoplayTimeoutId);
						autoplayTimeoutId = undefined;
						_this.startAutoplay();
					}
				}
				else {
					if (typeof autoplayIntervalId !== 'undefined') {
						clearInterval(autoplayIntervalId);
						autoplayIntervalId = undefined;
						_this.startAutoplay();
					}
				}
			}
		}
			// move wrapper to the beginning in free mode
		else if (_this.getWrapperTranslate() < -maxWrapperPosition()) {
			_this.setWrapperTransition(0);
			_this.setWrapperTranslate(-maxWrapperPosition());
		}

		_this.callPlugins('afterResizeFix');
	};

	/*==========================================
        Max and Min Positions
    ============================================*/
	function maxWrapperPosition() {
		var a = (wrapperSize - containerSize);
		if (params.freeMode) {
			a = wrapperSize - containerSize;
		}
		// if (params.loop) a -= containerSize;
		if (params.slidesPerView > _this.slides.length && !params.centeredSlides) {
			a = 0;
		}
		if (a < 0) a = 0;
		return a;
	}

	/*==========================================
        Event Listeners
    ============================================*/
	function initEvents() {
		var bind = _this.h.addEventListener;
		var eventTarget = params.eventTarget === 'wrapper' ? _this.wrapper : _this.container;
		//Touch Events
		if (!(_this.browser.ie10 || _this.browser.ie11)) {
			if (_this.support.touch) {
				bind(eventTarget, 'touchstart', onTouchStart);
				bind(eventTarget, 'touchmove', onTouchMove);
				bind(eventTarget, 'touchend', onTouchEnd);
			}
			if (params.simulateTouch) {
				bind(eventTarget, 'mousedown', onTouchStart);
				bind(document, 'mousemove', onTouchMove);
				bind(document, 'mouseup', onTouchEnd);
			}
		}
		else {
			bind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
			bind(document, _this.touchEvents.touchMove, onTouchMove);
			bind(document, _this.touchEvents.touchEnd, onTouchEnd);
		}

		//Resize Event
		if (params.autoResize) {
			bind(window, 'resize', _this.resizeFix);
		}
		//Slide Events
		addSlideEvents();
		//Mousewheel
		_this._wheelEvent = false;
		if (params.mousewheelControl) {
			if (document.onmousewheel !== undefined) {
				_this._wheelEvent = 'mousewheel';
			}
			if (!_this._wheelEvent) {
				try {
					new WheelEvent('wheel');
					_this._wheelEvent = 'wheel';
				} catch (e) { }
			}
			if (!_this._wheelEvent) {
				_this._wheelEvent = 'DOMMouseScroll';
			}
			if (_this._wheelEvent) {
				bind(_this.container, _this._wheelEvent, handleMousewheel);
			}
		}

		//Keyboard
		function _loadImage(src) {
			var image = new Image();
			image.onload = function () {
				if (_this && _this.imagesLoaded !== undefined) _this.imagesLoaded++;
				if (_this.imagesLoaded === _this.imagesToLoad.length) {
					_this.reInit();
					if (params.onImagesReady) _this.fireCallback(params.onImagesReady, _this);
				}
			};
			image.src = src;
		}

		if (params.keyboardControl) {
			bind(document, 'keydown', handleKeyboardKeys);
		}
		if (params.updateOnImagesReady) {
			_this.imagesToLoad = $$('img', _this.container);

			for (var i = 0; i < _this.imagesToLoad.length; i++) {
				_loadImage(_this.imagesToLoad[i].getAttribute('src'));
			}
		}
	}

	//Remove Event Listeners
	_this.destroy = function () {
		var unbind = _this.h.removeEventListener;
		var eventTarget = params.eventTarget === 'wrapper' ? _this.wrapper : _this.container;
		//Touch Events
		if (!(_this.browser.ie10 || _this.browser.ie11)) {
			if (_this.support.touch) {
				unbind(eventTarget, 'touchstart', onTouchStart);
				unbind(eventTarget, 'touchmove', onTouchMove);
				unbind(eventTarget, 'touchend', onTouchEnd);
			}
			if (params.simulateTouch) {
				unbind(eventTarget, 'mousedown', onTouchStart);
				unbind(document, 'mousemove', onTouchMove);
				unbind(document, 'mouseup', onTouchEnd);
			}
		}
		else {
			unbind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
			unbind(document, _this.touchEvents.touchMove, onTouchMove);
			unbind(document, _this.touchEvents.touchEnd, onTouchEnd);
		}

		//Resize Event
		if (params.autoResize) {
			unbind(window, 'resize', _this.resizeFix);
		}

		//Init Slide Events
		removeSlideEvents();

		//Pagination
		if (params.paginationClickable) {
			removePaginationEvents();
		}

		//Mousewheel
		if (params.mousewheelControl && _this._wheelEvent) {
			unbind(_this.container, _this._wheelEvent, handleMousewheel);
		}

		//Keyboard
		if (params.keyboardControl) {
			unbind(document, 'keydown', handleKeyboardKeys);
		}

		//Stop autoplay
		if (params.autoplay) {
			_this.stopAutoplay();
		}
		_this.callPlugins('onDestroy');

		//Destroy variable
		_this = null;
	};

	function addSlideEvents() {
		var bind = _this.h.addEventListener,
            i;

		//Prevent Links Events
		if (params.preventLinks) {
			var links = $$('a', _this.container);
			for (i = 0; i < links.length; i++) {
				bind(links[i], 'click', preventClick);
			}
		}
		//Release Form Elements
		if (params.releaseFormElements) {
			var formElements = $$('input, textarea, select', _this.container);
			for (i = 0; i < formElements.length; i++) {
				bind(formElements[i], _this.touchEvents.touchStart, releaseForms, true);
			}
		}

		//Slide Clicks & Touches
		if (params.onSlideClick) {
			for (i = 0; i < _this.slides.length; i++) {
				bind(_this.slides[i], 'click', slideClick);
			}
		}
		if (params.onSlideTouch) {
			for (i = 0; i < _this.slides.length; i++) {
				bind(_this.slides[i], _this.touchEvents.touchStart, slideTouch);
			}
		}
	}
	function removeSlideEvents() {
		var unbind = _this.h.removeEventListener,
            i;

		//Slide Clicks & Touches
		if (params.onSlideClick) {
			for (i = 0; i < _this.slides.length; i++) {
				unbind(_this.slides[i], 'click', slideClick);
			}
		}
		if (params.onSlideTouch) {
			for (i = 0; i < _this.slides.length; i++) {
				unbind(_this.slides[i], _this.touchEvents.touchStart, slideTouch);
			}
		}
		//Release Form Elements
		if (params.releaseFormElements) {
			var formElements = $$('input, textarea, select', _this.container);
			for (i = 0; i < formElements.length; i++) {
				unbind(formElements[i], _this.touchEvents.touchStart, releaseForms, true);
			}
		}
		//Prevent Links Events
		if (params.preventLinks) {
			var links = $$('a', _this.container);
			for (i = 0; i < links.length; i++) {
				unbind(links[i], 'click', preventClick);
			}
		}
	}
	/*==========================================
        Keyboard Control
    ============================================*/
	function handleKeyboardKeys(e) {
		var kc = e.keyCode || e.charCode;
		if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
		if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
			var inView = false;
			//Check that swiper should be inside of visible area of window
			var swiperOffset = _this.h.getOffset(_this.container);
			var scrollLeft = _this.h.windowScroll().left;
			var scrollTop = _this.h.windowScroll().top;
			var windowWidth = _this.h.windowWidth();
			var windowHeight = _this.h.windowHeight();
			var swiperCoord = [
                [swiperOffset.left, swiperOffset.top],
                [swiperOffset.left + _this.width, swiperOffset.top],
                [swiperOffset.left, swiperOffset.top + _this.height],
                [swiperOffset.left + _this.width, swiperOffset.top + _this.height]
			];
			for (var i = 0; i < swiperCoord.length; i++) {
				var point = swiperCoord[i];
				if (
                    point[0] >= scrollLeft && point[0] <= scrollLeft + windowWidth &&
                    point[1] >= scrollTop && point[1] <= scrollTop + windowHeight
                ) {
					inView = true;
				}

			}
			if (!inView) return;
		}
		if (isH) {
			if (kc === 37 || kc === 39) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
			}
			if (kc === 39) _this.swipeNext();
			if (kc === 37) _this.swipePrev();
		}
		else {
			if (kc === 38 || kc === 40) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
			}
			if (kc === 40) _this.swipeNext();
			if (kc === 38) _this.swipePrev();
		}
	}

	_this.disableKeyboardControl = function () {
		params.keyboardControl = false;
		_this.h.removeEventListener(document, 'keydown', handleKeyboardKeys);
	};

	_this.enableKeyboardControl = function () {
		params.keyboardControl = true;
		_this.h.addEventListener(document, 'keydown', handleKeyboardKeys);
	};

	/*==========================================
        Mousewheel Control
    ============================================*/
	var lastScrollTime = (new Date()).getTime();
	function handleMousewheel(e) {
		var we = _this._wheelEvent;
		var delta = 0;

		//Opera & IE
		if (e.detail) delta = -e.detail;
			//WebKits
		else if (we === 'mousewheel') {
			if (params.mousewheelControlForceToAxis) {
				if (isH) {
					if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
					else return;
				}
				else {
					if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
					else return;
				}
			}
			else {
				delta = e.wheelDelta;
			}
		}
			//Old FireFox
		else if (we === 'DOMMouseScroll') delta = -e.detail;
			//New FireFox
		else if (we === 'wheel') {
			if (params.mousewheelControlForceToAxis) {
				if (isH) {
					if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
					else return;
				}
				else {
					if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
					else return;
				}
			}
			else {
				delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY;
			}
		}

		if (!params.freeMode) {
			if ((new Date()).getTime() - lastScrollTime > 60) {
				if (delta < 0) _this.swipeNext();
				else _this.swipePrev();
			}
			lastScrollTime = (new Date()).getTime();

		}
		else {
			//Freemode or scrollContainer:
			var position = _this.getWrapperTranslate() + delta;

			if (position > 0) position = 0;
			if (position < -maxWrapperPosition()) position = -maxWrapperPosition();

			_this.setWrapperTransition(0);
			_this.setWrapperTranslate(position);
			_this.updateActiveSlide(position);

			// Return page scroll on edge positions
			if (position === 0 || position === -maxWrapperPosition()) return;
		}
		if (params.autoplay) _this.stopAutoplay(true);

		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;
		return false;
	}
	_this.disableMousewheelControl = function () {
		if (!_this._wheelEvent) return false;
		params.mousewheelControl = false;
		_this.h.removeEventListener(_this.container, _this._wheelEvent, handleMousewheel);
		return true;
	};

	_this.enableMousewheelControl = function () {
		if (!_this._wheelEvent) return false;
		params.mousewheelControl = true;
		_this.h.addEventListener(_this.container, _this._wheelEvent, handleMousewheel);
		return true;
	};

	/*=========================
      Grab Cursor
      ===========================*/
	if (params.grabCursor) {
		var containerStyle = _this.container.style;
		containerStyle.cursor = 'move';
		containerStyle.cursor = 'grab';
		containerStyle.cursor = '-moz-grab';
		containerStyle.cursor = '-webkit-grab';
	}

	/*=========================
      Slides Events Handlers
      ===========================*/

	_this.allowSlideClick = true;
	function slideClick(event) {
		if (_this.allowSlideClick) {
			setClickedSlide(event);
			_this.fireCallback(params.onSlideClick, _this, event);
		}
	}

	function slideTouch(event) {
		setClickedSlide(event);
		_this.fireCallback(params.onSlideTouch, _this, event);
	}

	function setClickedSlide(event) {

		// IE 6-8 support
		if (!event.currentTarget) {
			var element = event.srcElement;
			do {
				if (element.className.indexOf(params.slideClass) > -1) {
					break;
				}
				element = element.parentNode;
			} while (element);
			_this.clickedSlide = element;
		}
		else {
			_this.clickedSlide = event.currentTarget;
		}

		_this.clickedSlideIndex = _this.slides.indexOf(_this.clickedSlide);
		_this.clickedSlideLoopIndex = _this.clickedSlideIndex - (_this.loopedSlides || 0);
	}

	_this.allowLinks = true;
	function preventClick(e) {
		if (!_this.allowLinks) {
			if (e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			if (params.preventLinksPropagation && 'stopPropagation' in e) {
				e.stopPropagation();
			}
			return false;
		}
	}
	function releaseForms(e) {
		if (e.stopPropagation) e.stopPropagation();
		else e.returnValue = false;
		return false;

	}

	/*==================================================
        Event Handlers
    ====================================================*/
	var isTouchEvent = false;
	var allowThresholdMove;
	var allowMomentumBounce = true;
	function onTouchStart(event) {
		if (params.preventLinks) _this.allowLinks = true;
		//Exit if slider is already was touched
		if (_this.isTouched || params.onlyExternal) {
			return false;
		}

		if (params.noSwiping && (event.target || event.srcElement) && noSwipingSlide(event.target || event.srcElement)) return false;
		allowMomentumBounce = false;
		//Check For Nested Swipers
		_this.isTouched = true;
		isTouchEvent = event.type === 'touchstart';

		if (!isTouchEvent || event.targetTouches.length === 1) {
			_this.callPlugins('onTouchStartBegin');

			if (!isTouchEvent && !_this.isAndroid) {
				if (event.preventDefault) event.preventDefault();
				else event.returnValue = false;
			}

			var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
			var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

			//Start Touches to check the scrolling
			_this.touches.startX = _this.touches.currentX = pageX;
			_this.touches.startY = _this.touches.currentY = pageY;

			_this.touches.start = _this.touches.current = isH ? pageX : pageY;

			//Set Transition Time to 0
			_this.setWrapperTransition(0);

			//Get Start Translate Position
			_this.positions.start = _this.positions.current = _this.getWrapperTranslate();

			//Set Transform
			_this.setWrapperTranslate(_this.positions.start);

			//TouchStartTime
			_this.times.start = (new Date()).getTime();

			//Unset Scrolling
			isScrolling = undefined;

			//Set Treshold
			if (params.moveStartThreshold > 0) {
				allowThresholdMove = false;
			}

			//CallBack
			if (params.onTouchStart) _this.fireCallback(params.onTouchStart, _this, event);
			_this.callPlugins('onTouchStartEnd');

		}
	}
	var velocityPrevPosition, velocityPrevTime;
	function onTouchMove(event) {
		// If slider is not touched - exit
		if (!_this.isTouched || params.onlyExternal) return;
		if (isTouchEvent && event.type === 'mousemove') return;

		var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
		var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

		//check for scrolling
		if (typeof isScrolling === 'undefined' && isH) {
			isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) > Math.abs(pageX - _this.touches.startX));
		}
		if (typeof isScrolling === 'undefined' && !isH) {
			isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) < Math.abs(pageX - _this.touches.startX));
		}
		if (isScrolling) {
			_this.isTouched = false;
			return;
		}

		//Check For Nested Swipers
		if (event.assignedToSwiper) {
			_this.isTouched = false;
			return;
		}
		event.assignedToSwiper = true;

		//Block inner links
		if (params.preventLinks) {
			_this.allowLinks = false;
		}
		if (params.onSlideClick) {
			_this.allowSlideClick = false;
		}

		//Stop AutoPlay if exist
		if (params.autoplay) {
			_this.stopAutoplay(true);
		}
		if (!isTouchEvent || event.touches.length === 1) {

			//Moved Flag
			if (!_this.isMoved) {
				_this.callPlugins('onTouchMoveStart');

				if (params.loop) {
					_this.fixLoop();
					_this.positions.start = _this.getWrapperTranslate();
				}
				if (params.onTouchMoveStart) _this.fireCallback(params.onTouchMoveStart, _this);
			}
			_this.isMoved = true;

			// cancel event
			if (event.preventDefault) event.preventDefault();
			else event.returnValue = false;

			_this.touches.current = isH ? pageX : pageY;

			_this.positions.current = (_this.touches.current - _this.touches.start) * params.touchRatio + _this.positions.start;

			//Resistance Callbacks
			if (_this.positions.current > 0 && params.onResistanceBefore) {
				_this.fireCallback(params.onResistanceBefore, _this, _this.positions.current);
			}
			if (_this.positions.current < -maxWrapperPosition() && params.onResistanceAfter) {
				_this.fireCallback(params.onResistanceAfter, _this, Math.abs(_this.positions.current + maxWrapperPosition()));
			}
			//Resistance
			if (params.resistance && params.resistance !== '100%') {
				var resistance;
				//Resistance for Negative-Back sliding
				if (_this.positions.current > 0) {
					resistance = 1 - _this.positions.current / containerSize / 2;
					if (resistance < 0.5)
						_this.positions.current = (containerSize / 2);
					else
						_this.positions.current = _this.positions.current * resistance;
				}
				//Resistance for After-End Sliding
				if (_this.positions.current < -maxWrapperPosition()) {

					var diff = (_this.touches.current - _this.touches.start) * params.touchRatio + (maxWrapperPosition() + _this.positions.start);
					resistance = (containerSize + diff) / (containerSize);
					var newPos = _this.positions.current - diff * (1 - resistance) / 2;
					var stopPos = -maxWrapperPosition() - containerSize / 2;

					if (newPos < stopPos || resistance <= 0)
						_this.positions.current = stopPos;
					else
						_this.positions.current = newPos;
				}
			}
			if (params.resistance && params.resistance === '100%') {
				//Resistance for Negative-Back sliding
				if (_this.positions.current > 0 && !(params.freeMode && !params.freeModeFluid)) {
					_this.positions.current = 0;
				}
				//Resistance for After-End Sliding
				if (_this.positions.current < -maxWrapperPosition() && !(params.freeMode && !params.freeModeFluid)) {
					_this.positions.current = -maxWrapperPosition();
				}
			}
			//Move Slides
			if (!params.followFinger) return;

			if (!params.moveStartThreshold) {
				_this.setWrapperTranslate(_this.positions.current);
			}
			else {
				if (Math.abs(_this.touches.current - _this.touches.start) > params.moveStartThreshold || allowThresholdMove) {
					if (!allowThresholdMove) {
						allowThresholdMove = true;
						_this.touches.start = _this.touches.current;
						return;
					}
					_this.setWrapperTranslate(_this.positions.current);
				}
				else {
					_this.positions.current = _this.positions.start;
				}
			}

			if (params.freeMode || params.watchActiveIndex) {
				_this.updateActiveSlide(_this.positions.current);
			}

			//Grab Cursor
			if (params.grabCursor) {
				_this.container.style.cursor = 'move';
				_this.container.style.cursor = 'grabbing';
				_this.container.style.cursor = '-moz-grabbin';
				_this.container.style.cursor = '-webkit-grabbing';
			}
			//Velocity
			if (!velocityPrevPosition) velocityPrevPosition = _this.touches.current;
			if (!velocityPrevTime) velocityPrevTime = (new Date()).getTime();
			_this.velocity = (_this.touches.current - velocityPrevPosition) / ((new Date()).getTime() - velocityPrevTime) / 2;
			if (Math.abs(_this.touches.current - velocityPrevPosition) < 2) _this.velocity = 0;
			velocityPrevPosition = _this.touches.current;
			velocityPrevTime = (new Date()).getTime();
			//Callbacks
			_this.callPlugins('onTouchMoveEnd');
			if (params.onTouchMove) _this.fireCallback(params.onTouchMove, _this, event);

			return false;
		}
	}
	function onTouchEnd(event) {
		//Check For scrolling
		if (isScrolling) {
			_this.swipeReset();
		}
		// If slider is not touched exit
		if (params.onlyExternal || !_this.isTouched) return;
		_this.isTouched = false;

		//Return Grab Cursor
		if (params.grabCursor) {
			_this.container.style.cursor = 'move';
			_this.container.style.cursor = 'grab';
			_this.container.style.cursor = '-moz-grab';
			_this.container.style.cursor = '-webkit-grab';
		}

		//Check for Current Position
		if (!_this.positions.current && _this.positions.current !== 0) {
			_this.positions.current = _this.positions.start;
		}

		//For case if slider touched but not moved
		if (params.followFinger) {
			_this.setWrapperTranslate(_this.positions.current);
		}

		// TouchEndTime
		_this.times.end = (new Date()).getTime();

		//Difference
		_this.touches.diff = _this.touches.current - _this.touches.start;
		_this.touches.abs = Math.abs(_this.touches.diff);

		_this.positions.diff = _this.positions.current - _this.positions.start;
		_this.positions.abs = Math.abs(_this.positions.diff);

		var diff = _this.positions.diff;
		var diffAbs = _this.positions.abs;
		var timeDiff = _this.times.end - _this.times.start;

		if (diffAbs < 5 && (timeDiff) < 300 && _this.allowLinks === false) {
			if (!params.freeMode && diffAbs !== 0) _this.swipeReset();
			//Release inner links
			if (params.preventLinks) {
				_this.allowLinks = true;
			}
			if (params.onSlideClick) {
				_this.allowSlideClick = true;
			}
		}

		setTimeout(function () {
			//Release inner links
			if (params.preventLinks) {
				_this.allowLinks = true;
			}
			if (params.onSlideClick) {
				_this.allowSlideClick = true;
			}
		}, 100);

		var maxPosition = maxWrapperPosition();

		//Not moved or Prevent Negative Back Sliding/After-End Sliding
		if (!_this.isMoved && params.freeMode) {
			_this.isMoved = false;
			if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
			_this.callPlugins('onTouchEnd');
			return;
		}
		if (!_this.isMoved || _this.positions.current > 0 || _this.positions.current < -maxPosition) {
			_this.swipeReset();
			if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
			_this.callPlugins('onTouchEnd');
			return;
		}

		_this.isMoved = false;

		//Free Mode
		if (params.freeMode) {
			if (params.freeModeFluid) {
				var momentumDuration = 1000 * params.momentumRatio;
				var momentumDistance = _this.velocity * momentumDuration;
				var newPosition = _this.positions.current + momentumDistance;
				var doBounce = false;
				var afterBouncePosition;
				var bounceAmount = Math.abs(_this.velocity) * 20 * params.momentumBounceRatio;
				if (newPosition < -maxPosition) {
					if (params.momentumBounce && _this.support.transitions) {
						if (newPosition + maxPosition < -bounceAmount) newPosition = -maxPosition - bounceAmount;
						afterBouncePosition = -maxPosition;
						doBounce = true;
						allowMomentumBounce = true;
					}
					else newPosition = -maxPosition;
				}
				if (newPosition > 0) {
					if (params.momentumBounce && _this.support.transitions) {
						if (newPosition > bounceAmount) newPosition = bounceAmount;
						afterBouncePosition = 0;
						doBounce = true;
						allowMomentumBounce = true;
					}
					else newPosition = 0;
				}
				//Fix duration
				if (_this.velocity !== 0) momentumDuration = Math.abs((newPosition - _this.positions.current) / _this.velocity);

				_this.setWrapperTranslate(newPosition);

				_this.setWrapperTransition(momentumDuration);

				if (params.momentumBounce && doBounce) {
					_this.wrapperTransitionEnd(function () {
						if (!allowMomentumBounce) return;
						if (params.onMomentumBounce) _this.fireCallback(params.onMomentumBounce, _this);
						_this.callPlugins('onMomentumBounce');

						_this.setWrapperTranslate(afterBouncePosition);
						_this.setWrapperTransition(300);
					});
				}

				_this.updateActiveSlide(newPosition);
			}
			if (!params.freeModeFluid || timeDiff >= 300) _this.updateActiveSlide(_this.positions.current);

			if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
			_this.callPlugins('onTouchEnd');
			return;
		}

		//Direction
		direction = diff < 0 ? 'toNext' : 'toPrev';

		//Short Touches
		if (direction === 'toNext' && (timeDiff <= 300)) {
			if (diffAbs < 30 || !params.shortSwipes) _this.swipeReset();
			else _this.swipeNext(true);
		}

		if (direction === 'toPrev' && (timeDiff <= 300)) {
			if (diffAbs < 30 || !params.shortSwipes) _this.swipeReset();
			else _this.swipePrev(true);
		}

		//Long Touches
		var targetSlideSize = 0;
		if (params.slidesPerView === 'auto') {
			//Define current slide's width
			var currentPosition = Math.abs(_this.getWrapperTranslate());
			var slidesOffset = 0;
			var _slideSize;
			for (var i = 0; i < _this.slides.length; i++) {
				_slideSize = isH ? _this.slides[i].getWidth(true, params.roundLengths) : _this.slides[i].getHeight(true, params.roundLengths);
				slidesOffset += _slideSize;
				if (slidesOffset > currentPosition) {
					targetSlideSize = _slideSize;
					break;
				}
			}
			if (targetSlideSize > containerSize) targetSlideSize = containerSize;
		}
		else {
			targetSlideSize = slideSize * params.slidesPerView;
		}
		if (direction === 'toNext' && (timeDiff > 300)) {
			if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
				_this.swipeNext(true);
			}
			else {
				_this.swipeReset();
			}
		}
		if (direction === 'toPrev' && (timeDiff > 300)) {
			if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
				_this.swipePrev(true);
			}
			else {
				_this.swipeReset();
			}
		}
		if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
		_this.callPlugins('onTouchEnd');
	}


	/*==================================================
        noSwiping Bubble Check by Isaac Strack
    ====================================================*/
	function noSwipingSlide(el) {
		/*This function is specifically designed to check the parent elements for the noSwiping class, up to the wrapper.
        We need to check parents because while onTouchStart bubbles, _this.isTouched is checked in onTouchStart, which stops the bubbling.
        So, if a text box, for example, is the initial target, and the parent slide container has the noSwiping class, the _this.isTouched
        check will never find it, and what was supposed to be noSwiping is able to be swiped.
        This function will iterate up and check for the noSwiping class in parents, up through the wrapperClass.*/

		// First we create a truthy variable, which is that swiping is allowd (noSwiping = false)
		var noSwiping = false;

		// Now we iterate up (parentElements) until we reach the node with the wrapperClass.
		do {

			// Each time, we check to see if there's a 'swiper-no-swiping' class (noSwipingClass).
			if (el.className.indexOf(params.noSwipingClass) > -1) {
				noSwiping = true; // If there is, we set noSwiping = true;
			}

			el = el.parentElement;  // now we iterate up (parent node)

		} while (!noSwiping && el.parentElement && el.className.indexOf(params.wrapperClass) === -1); // also include el.parentElement truthy, just in case.

		// because we didn't check the wrapper itself, we do so now, if noSwiping is false:
		if (!noSwiping && el.className.indexOf(params.wrapperClass) > -1 && el.className.indexOf(params.noSwipingClass) > -1)
			noSwiping = true; // if the wrapper has the noSwipingClass, we set noSwiping = true;

		return noSwiping;
	}

	function addClassToHtmlString(klass, outerHtml) {
		var par = document.createElement('div');
		var child;

		par.innerHTML = outerHtml;
		child = par.firstChild;
		child.className += ' ' + klass;

		return child.outerHTML;
	}


	/*==================================================
        Swipe Functions
    ====================================================*/
	_this.swipeNext = function (internal) {
		if (!internal && params.loop) _this.fixLoop();
		if (!internal && params.autoplay) _this.stopAutoplay(true);
		_this.callPlugins('onSwipeNext');
		var currentPosition = _this.getWrapperTranslate();
		var newPosition = currentPosition;
		if (params.slidesPerView === 'auto') {
			for (var i = 0; i < _this.snapGrid.length; i++) {
				if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
					newPosition = -_this.snapGrid[i + 1];
					break;
				}
			}
		}
		else {
			var groupSize = slideSize * params.slidesPerGroup;
			newPosition = -(Math.floor(Math.abs(currentPosition) / Math.floor(groupSize)) * groupSize + groupSize);
		}
		if (newPosition < -maxWrapperPosition()) {
			newPosition = -maxWrapperPosition();
		}
		if (newPosition === currentPosition) return false;
		swipeToPosition(newPosition, 'next');
		return true;
	};
	_this.swipePrev = function (internal) {
		if (!internal && params.loop) _this.fixLoop();
		if (!internal && params.autoplay) _this.stopAutoplay(true);
		_this.callPlugins('onSwipePrev');

		var currentPosition = Math.ceil(_this.getWrapperTranslate());
		var newPosition;
		if (params.slidesPerView === 'auto') {
			newPosition = 0;
			for (var i = 1; i < _this.snapGrid.length; i++) {
				if (-currentPosition === _this.snapGrid[i]) {
					newPosition = -_this.snapGrid[i - 1];
					break;
				}
				if (-currentPosition > _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
					newPosition = -_this.snapGrid[i];
					break;
				}
			}
		}
		else {
			var groupSize = slideSize * params.slidesPerGroup;
			newPosition = -(Math.ceil(-currentPosition / groupSize) - 1) * groupSize;
		}

		if (newPosition > 0) newPosition = 0;

		if (newPosition === currentPosition) return false;
		swipeToPosition(newPosition, 'prev');
		return true;

	};
	_this.swipeReset = function () {
		_this.callPlugins('onSwipeReset');
		var currentPosition = _this.getWrapperTranslate();
		var groupSize = slideSize * params.slidesPerGroup;
		var newPosition;
		var maxPosition = -maxWrapperPosition();
		if (params.slidesPerView === 'auto') {
			newPosition = 0;
			for (var i = 0; i < _this.snapGrid.length; i++) {
				if (-currentPosition === _this.snapGrid[i]) return;
				if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
					if (_this.positions.diff > 0) newPosition = -_this.snapGrid[i + 1];
					else newPosition = -_this.snapGrid[i];
					break;
				}
			}
			if (-currentPosition >= _this.snapGrid[_this.snapGrid.length - 1]) newPosition = -_this.snapGrid[_this.snapGrid.length - 1];
			if (currentPosition <= -maxWrapperPosition()) newPosition = -maxWrapperPosition();
		}
		else {
			newPosition = currentPosition < 0 ? Math.round(currentPosition / groupSize) * groupSize : 0;
		}
		if (params.scrollContainer) {
			newPosition = currentPosition < 0 ? currentPosition : 0;
		}
		if (newPosition < -maxWrapperPosition()) {
			newPosition = -maxWrapperPosition();
		}
		if (params.scrollContainer && (containerSize > slideSize)) {
			newPosition = 0;
		}

		if (newPosition === currentPosition) return false;

		swipeToPosition(newPosition, 'reset');
		return true;
	};

	_this.swipeTo = function (index, speed, runCallbacks) {
		index = parseInt(index, 10);
		_this.callPlugins('onSwipeTo', { index: index, speed: speed });
		if (params.loop) index = index + _this.loopedSlides;
		var currentPosition = _this.getWrapperTranslate();
		if (index > (_this.slides.length - 1) || index < 0) return;
		var newPosition;
		if (params.slidesPerView === 'auto') {
			newPosition = -_this.slidesGrid[index];
		}
		else {
			newPosition = -index * slideSize;
		}
		if (newPosition < -maxWrapperPosition()) {
			newPosition = -maxWrapperPosition();
		}

		if (newPosition === currentPosition) return false;

		runCallbacks = runCallbacks === false ? false : true;
		swipeToPosition(newPosition, 'to', { index: index, speed: speed, runCallbacks: runCallbacks });
		return true;
	};

	function swipeToPosition(newPosition, action, toOptions) {
		var speed = (action === 'to' && toOptions.speed >= 0) ? toOptions.speed : params.speed;
		var timeOld = +new Date();

		function anim() {
			var timeNew = +new Date();
			var time = timeNew - timeOld;
			currentPosition += animationStep * time / (1000 / 60);
			condition = direction === 'toNext' ? currentPosition > newPosition : currentPosition < newPosition;
			if (condition) {
				_this.setWrapperTranslate(Math.round(currentPosition));
				_this._DOMAnimating = true;
				window.setTimeout(function () {
					anim();
				}, 1000 / 60);
			}
			else {
				if (params.onSlideChangeEnd) {
					if (action === 'to') {
						if (toOptions.runCallbacks === true) _this.fireCallback(params.onSlideChangeEnd, _this);
					}
					else {
						_this.fireCallback(params.onSlideChangeEnd, _this);
					}

				}
				_this.setWrapperTranslate(newPosition);
				_this._DOMAnimating = false;
			}
		}

		if (_this.support.transitions || !params.DOMAnimation) {
			_this.setWrapperTranslate(newPosition);
			_this.setWrapperTransition(speed);
		}
		else {
			//Try the DOM animation
			var currentPosition = _this.getWrapperTranslate();
			var animationStep = Math.ceil((newPosition - currentPosition) / speed * (1000 / 60));
			var direction = currentPosition > newPosition ? 'toNext' : 'toPrev';
			var condition = direction === 'toNext' ? currentPosition > newPosition : currentPosition < newPosition;
			if (_this._DOMAnimating) return;

			anim();
		}

		//Update Active Slide Index
		_this.updateActiveSlide(newPosition);

		//Callbacks
		if (params.onSlideNext && action === 'next') {
			_this.fireCallback(params.onSlideNext, _this, newPosition);
		}
		if (params.onSlidePrev && action === 'prev') {
			_this.fireCallback(params.onSlidePrev, _this, newPosition);
		}
		//'Reset' Callback
		if (params.onSlideReset && action === 'reset') {
			_this.fireCallback(params.onSlideReset, _this, newPosition);
		}

		//'Next', 'Prev' and 'To' Callbacks
		if (action === 'next' || action === 'prev' || (action === 'to' && toOptions.runCallbacks === true))
			slideChangeCallbacks(action);
	}
	/*==================================================
        Transition Callbacks
    ====================================================*/
	//Prevent Multiple Callbacks
	_this._queueStartCallbacks = false;
	_this._queueEndCallbacks = false;
	function slideChangeCallbacks(direction) {
		//Transition Start Callback
		_this.callPlugins('onSlideChangeStart');
		if (params.onSlideChangeStart) {
			if (params.queueStartCallbacks && _this.support.transitions) {
				if (_this._queueStartCallbacks) return;
				_this._queueStartCallbacks = true;
				_this.fireCallback(params.onSlideChangeStart, _this, direction);
				_this.wrapperTransitionEnd(function () {
					_this._queueStartCallbacks = false;
				});
			}
			else _this.fireCallback(params.onSlideChangeStart, _this, direction);
		}
		//Transition End Callback
		if (params.onSlideChangeEnd) {
			if (_this.support.transitions) {
				if (params.queueEndCallbacks) {
					if (_this._queueEndCallbacks) return;
					_this._queueEndCallbacks = true;
					_this.wrapperTransitionEnd(function (swiper) {
						_this.fireCallback(params.onSlideChangeEnd, swiper, direction);
					});
				}
				else {
					_this.wrapperTransitionEnd(function (swiper) {
						_this.fireCallback(params.onSlideChangeEnd, swiper, direction);
					});
				}
			}
			else {
				if (!params.DOMAnimation) {
					setTimeout(function () {
						_this.fireCallback(params.onSlideChangeEnd, _this, direction);
					}, 10);
				}
			}
		}
	}

	/*==================================================
        Update Active Slide Index
    ====================================================*/
	_this.updateActiveSlide = function (position) {
		if (!_this.initialized) return;
		if (_this.slides.length === 0) return;
		_this.previousIndex = _this.activeIndex;
		if (typeof position === 'undefined') position = _this.getWrapperTranslate();
		if (position > 0) position = 0;
		var i;
		if (params.slidesPerView === 'auto') {
			var slidesOffset = 0;
			_this.activeIndex = _this.slidesGrid.indexOf(-position);
			if (_this.activeIndex < 0) {
				for (i = 0; i < _this.slidesGrid.length - 1; i++) {
					if (-position > _this.slidesGrid[i] && -position < _this.slidesGrid[i + 1]) {
						break;
					}
				}
				var leftDistance = Math.abs(_this.slidesGrid[i] + position);
				var rightDistance = Math.abs(_this.slidesGrid[i + 1] + position);
				if (leftDistance <= rightDistance) _this.activeIndex = i;
				else _this.activeIndex = i + 1;
			}
		}
		else {
			_this.activeIndex = Math[params.visibilityFullFit ? 'ceil' : 'round'](-position / slideSize);
		}

		if (_this.activeIndex === _this.slides.length) _this.activeIndex = _this.slides.length - 1;
		if (_this.activeIndex < 0) _this.activeIndex = 0;

		// Check for slide
		if (!_this.slides[_this.activeIndex]) return;

		// Calc Visible slides
		_this.calcVisibleSlides(position);

		// Mark visible and active slides with additonal classes
		if (_this.support.classList) {
			var slide;
			for (i = 0; i < _this.slides.length; i++) {
				slide = _this.slides[i];
				slide.classList.remove(params.slideActiveClass);
				if (_this.visibleSlides.indexOf(slide) >= 0) {
					slide.classList.add(params.slideVisibleClass);
				} else {
					slide.classList.remove(params.slideVisibleClass);
				}
			}
			_this.slides[_this.activeIndex].classList.add(params.slideActiveClass);
		} else {
			var activeClassRegexp = new RegExp('\\s*' + params.slideActiveClass);
			var inViewClassRegexp = new RegExp('\\s*' + params.slideVisibleClass);

			for (i = 0; i < _this.slides.length; i++) {
				_this.slides[i].className = _this.slides[i].className.replace(activeClassRegexp, '').replace(inViewClassRegexp, '');
				if (_this.visibleSlides.indexOf(_this.slides[i]) >= 0) {
					_this.slides[i].className += ' ' + params.slideVisibleClass;
				}
			}
			_this.slides[_this.activeIndex].className += ' ' + params.slideActiveClass;
		}

		//Update loop index
		if (params.loop) {
			var ls = _this.loopedSlides;
			_this.activeLoopIndex = _this.activeIndex - ls;
			if (_this.activeLoopIndex >= _this.slides.length - ls * 2) {
				_this.activeLoopIndex = _this.slides.length - ls * 2 - _this.activeLoopIndex;
			}
			if (_this.activeLoopIndex < 0) {
				_this.activeLoopIndex = _this.slides.length - ls * 2 + _this.activeLoopIndex;
			}
			if (_this.activeLoopIndex < 0) _this.activeLoopIndex = 0;
		}
		else {
			_this.activeLoopIndex = _this.activeIndex;
		}
		//Update Pagination
		if (params.pagination) {
			_this.updatePagination(position);
		}
	};
	/*==================================================
        Pagination
    ====================================================*/
	_this.createPagination = function (firstInit) {
		if (params.paginationClickable && _this.paginationButtons) {
			removePaginationEvents();
		}
		_this.paginationContainer = params.pagination.nodeType ? params.pagination : $$(params.pagination)[0];
		if (params.createPagination) {
			var paginationHTML = '';
			var numOfSlides = _this.slides.length;
			var numOfButtons = numOfSlides;
			if (params.loop) numOfButtons -= _this.loopedSlides * 2;
			for (var i = 0; i < numOfButtons; i++) {
				paginationHTML += '<' + params.paginationElement + ' class="' + params.paginationElementClass + '"></' + params.paginationElement + '>';
			}
			_this.paginationContainer.innerHTML = paginationHTML;
		}
		_this.paginationButtons = $$('.' + params.paginationElementClass, _this.paginationContainer);
		if (!firstInit) _this.updatePagination();
		_this.callPlugins('onCreatePagination');
		if (params.paginationClickable) {
			addPaginationEvents();
		}
	};
	function removePaginationEvents() {
		var pagers = _this.paginationButtons;
		if (pagers) {
			for (var i = 0; i < pagers.length; i++) {
				_this.h.removeEventListener(pagers[i], 'click', paginationClick);
			}
		}
	}
	function addPaginationEvents() {
		var pagers = _this.paginationButtons;
		if (pagers) {
			for (var i = 0; i < pagers.length; i++) {
				_this.h.addEventListener(pagers[i], 'click', paginationClick);
			}
		}
	}
	function paginationClick(e) {
		var index;
		var target = e.target || e.srcElement;
		var pagers = _this.paginationButtons;
		for (var i = 0; i < pagers.length; i++) {
			if (target === pagers[i]) index = i;
		}
		_this.swipeTo(index);
	}
	_this.updatePagination = function (position) {
		if (!params.pagination) return;
		if (_this.slides.length < 1) return;
		var activePagers = $$('.' + params.paginationActiveClass, _this.paginationContainer);
		if (!activePagers) return;

		//Reset all Buttons' class to not active
		var pagers = _this.paginationButtons;
		if (pagers.length === 0) return;
		for (var i = 0; i < pagers.length; i++) {
			pagers[i].className = params.paginationElementClass;
		}

		var indexOffset = params.loop ? _this.loopedSlides : 0;
		if (params.paginationAsRange) {
			if (!_this.visibleSlides) _this.calcVisibleSlides(position);
			//Get Visible Indexes
			var visibleIndexes = [];
			var j; // lopp index - avoid JSHint W004 / W038
			for (j = 0; j < _this.visibleSlides.length; j++) {
				var visIndex = _this.slides.indexOf(_this.visibleSlides[j]) - indexOffset;

				if (params.loop && visIndex < 0) {
					visIndex = _this.slides.length - _this.loopedSlides * 2 + visIndex;
				}
				if (params.loop && visIndex >= _this.slides.length - _this.loopedSlides * 2) {
					visIndex = _this.slides.length - _this.loopedSlides * 2 - visIndex;
					visIndex = Math.abs(visIndex);
				}
				visibleIndexes.push(visIndex);
			}

			for (j = 0; j < visibleIndexes.length; j++) {
				if (pagers[visibleIndexes[j]]) pagers[visibleIndexes[j]].className += ' ' + params.paginationVisibleClass;
			}

			if (params.loop) {
				if (pagers[_this.activeLoopIndex] !== undefined) {
					pagers[_this.activeLoopIndex].className += ' ' + params.paginationActiveClass;
				}
			}
			else {
				pagers[_this.activeIndex].className += ' ' + params.paginationActiveClass;
			}
		}
		else {
			if (params.loop) {
				if (pagers[_this.activeLoopIndex]) pagers[_this.activeLoopIndex].className += ' ' + params.paginationActiveClass + ' ' + params.paginationVisibleClass;
			}
			else {
				pagers[_this.activeIndex].className += ' ' + params.paginationActiveClass + ' ' + params.paginationVisibleClass;
			}
		}
	};
	_this.calcVisibleSlides = function (position) {
		var visibleSlides = [];
		var _slideLeft = 0, _slideSize = 0, _slideRight = 0;
		if (isH && _this.wrapperLeft > 0) position = position + _this.wrapperLeft;
		if (!isH && _this.wrapperTop > 0) position = position + _this.wrapperTop;

		for (var i = 0; i < _this.slides.length; i++) {
			_slideLeft += _slideSize;
			if (params.slidesPerView === 'auto')
				_slideSize = isH ? _this.h.getWidth(_this.slides[i], true, params.roundLengths) : _this.h.getHeight(_this.slides[i], true, params.roundLengths);
			else _slideSize = slideSize;

			_slideRight = _slideLeft + _slideSize;
			var isVisibile = false;
			if (params.visibilityFullFit) {
				if (_slideLeft >= -position && _slideRight <= -position + containerSize) isVisibile = true;
				if (_slideLeft <= -position && _slideRight >= -position + containerSize) isVisibile = true;
			}
			else {
				if (_slideRight > -position && _slideRight <= ((-position + containerSize))) isVisibile = true;
				if (_slideLeft >= -position && _slideLeft < ((-position + containerSize))) isVisibile = true;
				if (_slideLeft < -position && _slideRight > ((-position + containerSize))) isVisibile = true;
			}

			if (isVisibile) visibleSlides.push(_this.slides[i]);

		}
		if (visibleSlides.length === 0) visibleSlides = [_this.slides[_this.activeIndex]];

		_this.visibleSlides = visibleSlides;
	};

	/*==========================================
        Autoplay
    ============================================*/
	var autoplayTimeoutId, autoplayIntervalId;
	_this.startAutoplay = function () {
		if (_this.support.transitions) {
			if (typeof autoplayTimeoutId !== 'undefined') return false;
			if (!params.autoplay) return;
			_this.callPlugins('onAutoplayStart');
			if (params.onAutoplayStart) _this.fireCallback(params.onAutoplayStart, _this);
			autoplay();
		}
		else {
			if (typeof autoplayIntervalId !== 'undefined') return false;
			if (!params.autoplay) return;
			_this.callPlugins('onAutoplayStart');
			if (params.onAutoplayStart) _this.fireCallback(params.onAutoplayStart, _this);
			autoplayIntervalId = setInterval(function () {
				if (params.loop) {
					_this.fixLoop();
					_this.swipeNext(true);
				}
				else if (!_this.swipeNext(true)) {
					if (!params.autoplayStopOnLast) _this.swipeTo(0);
					else {
						clearInterval(autoplayIntervalId);
						autoplayIntervalId = undefined;
					}
				}
			}, params.autoplay);
		}
	};
	_this.stopAutoplay = function (internal) {
		if (_this.support.transitions) {
			if (!autoplayTimeoutId) return;
			if (autoplayTimeoutId) clearTimeout(autoplayTimeoutId);
			autoplayTimeoutId = undefined;
			if (internal && !params.autoplayDisableOnInteraction) {
				_this.wrapperTransitionEnd(function () {
					autoplay();
				});
			}
			_this.callPlugins('onAutoplayStop');
			if (params.onAutoplayStop) _this.fireCallback(params.onAutoplayStop, _this);
		}
		else {
			if (autoplayIntervalId) clearInterval(autoplayIntervalId);
			autoplayIntervalId = undefined;
			_this.callPlugins('onAutoplayStop');
			if (params.onAutoplayStop) _this.fireCallback(params.onAutoplayStop, _this);
		}
	};
	function autoplay() {
		autoplayTimeoutId = setTimeout(function () {
			if (params.loop) {
				_this.fixLoop();
				_this.swipeNext(true);
			}
			else if (!_this.swipeNext(true)) {
				if (!params.autoplayStopOnLast) _this.swipeTo(0);
				else {
					clearTimeout(autoplayTimeoutId);
					autoplayTimeoutId = undefined;
				}
			}
			_this.wrapperTransitionEnd(function () {
				if (typeof autoplayTimeoutId !== 'undefined') autoplay();
			});
		}, params.autoplay);
	}
	/*==================================================
        Loop
    ====================================================*/
	_this.loopCreated = false;
	_this.removeLoopedSlides = function () {
		if (_this.loopCreated) {
			for (var i = 0; i < _this.slides.length; i++) {
				if (_this.slides[i].getData('looped') === true) _this.wrapper.removeChild(_this.slides[i]);
			}
		}
	};

	_this.createLoop = function () {
		if (_this.slides.length === 0) return;
		if (params.slidesPerView === 'auto') {
			_this.loopedSlides = params.loopedSlides || 1;
		}
		else {
			_this.loopedSlides = params.slidesPerView + params.loopAdditionalSlides;
		}

		if (_this.loopedSlides > _this.slides.length) {
			_this.loopedSlides = _this.slides.length;
		}

		var slideFirstHTML = '',
            slideLastHTML = '',
            i;
		var slidesSetFullHTML = '';
		/**
                loopedSlides is too large if loopAdditionalSlides are set.
                Need to divide the slides by maximum number of slides existing.

                @author        Tomaz Lovrec <tomaz.lovrec@blanc-noir.at>
        */
		var numSlides = _this.slides.length;
		var fullSlideSets = Math.floor(_this.loopedSlides / numSlides);
		var remainderSlides = _this.loopedSlides % numSlides;
		// assemble full sets of slides
		for (i = 0; i < (fullSlideSets * numSlides) ; i++) {
			var j = i;
			if (i >= numSlides) {
				var over = Math.floor(i / numSlides);
				j = i - (numSlides * over);
			}
			slidesSetFullHTML += _this.slides[j].outerHTML;
		}
		// assemble remainder slides
		// assemble remainder appended to existing slides
		for (i = 0; i < remainderSlides; i++) {
			slideLastHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML);
		}
		// assemble slides that get preppended to existing slides
		for (i = numSlides - remainderSlides; i < numSlides; i++) {
			slideFirstHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML);
		}
		// assemble all slides
		var slides = slideFirstHTML + slidesSetFullHTML + wrapper.innerHTML + slidesSetFullHTML + slideLastHTML;
		// set the slides
		wrapper.innerHTML = slides;

		_this.loopCreated = true;
		_this.calcSlides();

		//Update Looped Slides with special class
		for (i = 0; i < _this.slides.length; i++) {
			if (i < _this.loopedSlides || i >= _this.slides.length - _this.loopedSlides) _this.slides[i].setData('looped', true);
		}
		_this.callPlugins('onCreateLoop');

	};

	_this.fixLoop = function () {
		var newIndex;
		//Fix For Negative Oversliding
		if (_this.activeIndex < _this.loopedSlides) {
			newIndex = _this.slides.length - _this.loopedSlides * 3 + _this.activeIndex;
			_this.swipeTo(newIndex, 0, false);
		}
			//Fix For Positive Oversliding
		else if ((params.slidesPerView === 'auto' && _this.activeIndex >= _this.loopedSlides * 2) || (_this.activeIndex > _this.slides.length - params.slidesPerView * 2)) {
			newIndex = -_this.slides.length + _this.activeIndex + _this.loopedSlides;
			_this.swipeTo(newIndex, 0, false);
		}
	};

	/*==================================================
        Slides Loader
    ====================================================*/
	_this.loadSlides = function () {
		var slidesHTML = '';
		_this.activeLoaderIndex = 0;
		var slides = params.loader.slides;
		var slidesToLoad = params.loader.loadAllSlides ? slides.length : params.slidesPerView * (1 + params.loader.surroundGroups);
		for (var i = 0; i < slidesToLoad; i++) {
			if (params.loader.slidesHTMLType === 'outer') slidesHTML += slides[i];
			else {
				slidesHTML += '<' + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + '</' + params.slideElement + '>';
			}
		}
		_this.wrapper.innerHTML = slidesHTML;
		_this.calcSlides(true);
		//Add permanent transitionEnd callback
		if (!params.loader.loadAllSlides) {
			_this.wrapperTransitionEnd(_this.reloadSlides, true);
		}
	};

	_this.reloadSlides = function () {
		var slides = params.loader.slides;
		var newActiveIndex = parseInt(_this.activeSlide().data('swiperindex'), 10);
		if (newActiveIndex < 0 || newActiveIndex > slides.length - 1) return; //<-- Exit
		_this.activeLoaderIndex = newActiveIndex;
		var firstIndex = Math.max(0, newActiveIndex - params.slidesPerView * params.loader.surroundGroups);
		var lastIndex = Math.min(newActiveIndex + params.slidesPerView * (1 + params.loader.surroundGroups) - 1, slides.length - 1);
		//Update Transforms
		if (newActiveIndex > 0) {
			var newTransform = -slideSize * (newActiveIndex - firstIndex);
			_this.setWrapperTranslate(newTransform);
			_this.setWrapperTransition(0);
		}
		var i; // loop index
		//New Slides
		if (params.loader.logic === 'reload') {
			_this.wrapper.innerHTML = '';
			var slidesHTML = '';
			for (i = firstIndex; i <= lastIndex; i++) {
				slidesHTML += params.loader.slidesHTMLType === 'outer' ? slides[i] : '<' + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + '</' + params.slideElement + '>';
			}
			_this.wrapper.innerHTML = slidesHTML;
		}
		else {
			var minExistIndex = 1000;
			var maxExistIndex = 0;

			for (i = 0; i < _this.slides.length; i++) {
				var index = _this.slides[i].data('swiperindex');
				if (index < firstIndex || index > lastIndex) {
					_this.wrapper.removeChild(_this.slides[i]);
				}
				else {
					minExistIndex = Math.min(index, minExistIndex);
					maxExistIndex = Math.max(index, maxExistIndex);
				}
			}
			for (i = firstIndex; i <= lastIndex; i++) {
				var newSlide;
				if (i < minExistIndex) {
					newSlide = document.createElement(params.slideElement);
					newSlide.className = params.slideClass;
					newSlide.setAttribute('data-swiperindex', i);
					newSlide.innerHTML = slides[i];
					_this.wrapper.insertBefore(newSlide, _this.wrapper.firstChild);
				}
				if (i > maxExistIndex) {
					newSlide = document.createElement(params.slideElement);
					newSlide.className = params.slideClass;
					newSlide.setAttribute('data-swiperindex', i);
					newSlide.innerHTML = slides[i];
					_this.wrapper.appendChild(newSlide);
				}
			}
		}
		//reInit
		_this.reInit(true);
	};

	/*==================================================
        Make Swiper
    ====================================================*/
	function makeSwiper() {
		_this.calcSlides();
		if (params.loader.slides.length > 0 && _this.slides.length === 0) {
			_this.loadSlides();
		}
		if (params.loop) {
			_this.createLoop();
		}
		_this.init();
		initEvents();
		if (params.pagination) {
			_this.createPagination(true);
		}

		if (params.loop || params.initialSlide > 0) {
			_this.swipeTo(params.initialSlide, 0, false);
		}
		else {
			_this.updateActiveSlide(0);
		}
		if (params.autoplay) {
			_this.startAutoplay();
		}
		/**
         * Set center slide index.
         *
         * @author        Tomaz Lovrec <tomaz.lovrec@gmail.com>
         */
		_this.centerIndex = _this.activeIndex;

		// Callbacks
		if (params.onSwiperCreated) _this.fireCallback(params.onSwiperCreated, _this);
		_this.callPlugins('onSwiperCreated');
	}

	makeSwiper();
};

Swiper.prototype = {
	plugins: {},

	/*==================================================
        Wrapper Operations
    ====================================================*/
	wrapperTransitionEnd: function (callback, permanent) {
		'use strict';
		var a = this,
            el = a.wrapper,
            events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i;

		function fireCallBack() {
			callback(a);
			if (a.params.queueEndCallbacks) a._queueEndCallbacks = false;
			if (!permanent) {
				for (i = 0; i < events.length; i++) {
					a.h.removeEventListener(el, events[i], fireCallBack);
				}
			}
		}

		if (callback) {
			for (i = 0; i < events.length; i++) {
				a.h.addEventListener(el, events[i], fireCallBack);
			}
		}
	},

	getWrapperTranslate: function (axis) {
		'use strict';
		var el = this.wrapper,
            matrix, curTransform, curStyle, transformMatrix;

		// automatic axis detection
		if (typeof axis === 'undefined') {
			axis = this.params.mode === 'horizontal' ? 'x' : 'y';
		}

		if (this.support.transforms && this.params.useCSS3Transforms) {
			curStyle = window.getComputedStyle(el, null);
			if (window.WebKitCSSMatrix) {
				// Some old versions of Webkit choke when 'none' is passed; pass
				// empty string instead in this case
				transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
			}
			else {
				transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
				matrix = transformMatrix.toString().split(',');
			}

			if (axis === 'x') {
				//Latest Chrome and webkits Fix
				if (window.WebKitCSSMatrix)
					curTransform = transformMatrix.m41;
					//Crazy IE10 Matrix
				else if (matrix.length === 16)
					curTransform = parseFloat(matrix[12]);
					//Normal Browsers
				else
					curTransform = parseFloat(matrix[4]);
			}
			if (axis === 'y') {
				//Latest Chrome and webkits Fix
				if (window.WebKitCSSMatrix)
					curTransform = transformMatrix.m42;
					//Crazy IE10 Matrix
				else if (matrix.length === 16)
					curTransform = parseFloat(matrix[13]);
					//Normal Browsers
				else
					curTransform = parseFloat(matrix[5]);
			}
		}
		else {
			if (axis === 'x') curTransform = parseFloat(el.style.left, 10) || 0;
			if (axis === 'y') curTransform = parseFloat(el.style.top, 10) || 0;
		}
		return curTransform || 0;
	},

	setWrapperTranslate: function (x, y, z) {
		'use strict';
		var es = this.wrapper.style,
            coords = { x: 0, y: 0, z: 0 },
            translate;

		// passed all coordinates
		if (arguments.length === 3) {
			coords.x = x;
			coords.y = y;
			coords.z = z;
		}

			// passed one coordinate and optional axis
		else {
			if (typeof y === 'undefined') {
				y = this.params.mode === 'horizontal' ? 'x' : 'y';
			}
			coords[y] = x;
		}

		if (this.support.transforms && this.params.useCSS3Transforms) {
			translate = this.support.transforms3d ? 'translate3d(' + coords.x + 'px, ' + coords.y + 'px, ' + coords.z + 'px)' : 'translate(' + coords.x + 'px, ' + coords.y + 'px)';
			es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = translate;
		}
		else {
			es.left = coords.x + 'px';
			es.top = coords.y + 'px';
		}
		this.callPlugins('onSetWrapperTransform', coords);
		if (this.params.onSetWrapperTransform) this.fireCallback(this.params.onSetWrapperTransform, this, coords);
	},

	setWrapperTransition: function (duration) {
		'use strict';
		var es = this.wrapper.style;
		es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = (duration / 1000) + 's';
		this.callPlugins('onSetWrapperTransition', { duration: duration });
		if (this.params.onSetWrapperTransition) this.fireCallback(this.params.onSetWrapperTransition, this, duration);

	},

	/*==================================================
        Helpers
    ====================================================*/
	h: {
		getWidth: function (el, outer, round) {
			'use strict';
			var width = window.getComputedStyle(el, null).getPropertyValue('width');
			var returnWidth = parseFloat(width);
			//IE Fixes
			if (isNaN(returnWidth) || width.indexOf('%') > 0) {
				returnWidth = el.offsetWidth - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right'));
			}
			if (outer) returnWidth += parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right'));
			if (round) return Math.round(returnWidth);
			else return returnWidth;
		},
		getHeight: function (el, outer, round) {
			'use strict';
			if (outer) return el.offsetHeight;

			var height = window.getComputedStyle(el, null).getPropertyValue('height');
			var returnHeight = parseFloat(height);
			//IE Fixes
			if (isNaN(returnHeight) || height.indexOf('%') > 0) {
				returnHeight = el.offsetHeight - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom'));
			}
			if (outer) returnHeight += parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom'));
			if (round) return Math.round(returnHeight);
			else return returnHeight;
		},
		getOffset: function (el) {
			'use strict';
			var box = el.getBoundingClientRect();
			var body = document.body;
			var clientTop = el.clientTop || body.clientTop || 0;
			var clientLeft = el.clientLeft || body.clientLeft || 0;
			var scrollTop = window.pageYOffset || el.scrollTop;
			var scrollLeft = window.pageXOffset || el.scrollLeft;
			if (document.documentElement && !window.pageYOffset) {
				//IE7-8
				scrollTop = document.documentElement.scrollTop;
				scrollLeft = document.documentElement.scrollLeft;
			}
			return {
				top: box.top + scrollTop - clientTop,
				left: box.left + scrollLeft - clientLeft
			};
		},
		windowWidth: function () {
			'use strict';
			if (window.innerWidth) return window.innerWidth;
			else if (document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth;
		},
		windowHeight: function () {
			'use strict';
			if (window.innerHeight) return window.innerHeight;
			else if (document.documentElement && document.documentElement.clientHeight) return document.documentElement.clientHeight;
		},
		windowScroll: function () {
			'use strict';
			if (typeof pageYOffset !== 'undefined') {
				return {
					left: window.pageXOffset,
					top: window.pageYOffset
				};
			}
			else if (document.documentElement) {
				return {
					left: document.documentElement.scrollLeft,
					top: document.documentElement.scrollTop
				};
			}
		},

		addEventListener: function (el, event, listener, useCapture) {
			'use strict';
			if (typeof useCapture === 'undefined') {
				useCapture = false;
			}

			if (el.addEventListener) {
				el.addEventListener(event, listener, useCapture);
			}
			else if (el.attachEvent) {
				el.attachEvent('on' + event, listener);
			}
		},

		removeEventListener: function (el, event, listener, useCapture) {
			'use strict';
			if (typeof useCapture === 'undefined') {
				useCapture = false;
			}

			if (el.removeEventListener) {
				el.removeEventListener(event, listener, useCapture);
			}
			else if (el.detachEvent) {
				el.detachEvent('on' + event, listener);
			}
		}
	},
	setTransform: function (el, transform) {
		'use strict';
		var es = el.style;
		es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transform;
	},
	setTranslate: function (el, translate) {
		'use strict';
		var es = el.style;
		var pos = {
			x: translate.x || 0,
			y: translate.y || 0,
			z: translate.z || 0
		};
		var transformString = this.support.transforms3d ? 'translate3d(' + (pos.x) + 'px,' + (pos.y) + 'px,' + (pos.z) + 'px)' : 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';
		es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transformString;
		if (!this.support.transforms) {
			es.left = pos.x + 'px';
			es.top = pos.y + 'px';
		}
	},
	setTransition: function (el, duration) {
		'use strict';
		var es = el.style;
		es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration + 'ms';
	},
	/*==================================================
        Feature Detection
    ====================================================*/
	support: {

		touch: (window.Modernizr && Modernizr.touch === true) || (function () {
			'use strict';
			return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
		})(),

		transforms3d: (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
			'use strict';
			var div = document.createElement('div').style;
			return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
		})(),

		transforms: (window.Modernizr && Modernizr.csstransforms === true) || (function () {
			'use strict';
			var div = document.createElement('div').style;
			return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
		})(),

		transitions: (window.Modernizr && Modernizr.csstransitions === true) || (function () {
			'use strict';
			var div = document.createElement('div').style;
			return ('transition' in div || 'WebkitTransition' in div || 'MozTransition' in div || 'msTransition' in div || 'MsTransition' in div || 'OTransition' in div);
		})(),

		classList: (function () {
			'use strict';
			var div = document.createElement('div').style;
			return 'classList' in div;
		})()
	},

	browser: {

		ie8: (function () {
			'use strict';
			var rv = -1; // Return value assumes failure.
			if (navigator.appName === 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				var re = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
				if (re.exec(ua) !== null)
					rv = parseFloat(RegExp.$1);
			}
			return rv !== -1 && rv < 9;
		})(),

		ie10: window.navigator.msPointerEnabled,
		ie11: window.navigator.pointerEnabled
	}
};

/*=========================
  jQuery & Zepto Plugins
  ===========================*/
if (window.jQuery || window.Zepto) {
	(function ($) {
		'use strict';
		$.fn.swiper = function (params) {
			var s = new Swiper($(this)[0], params);
			$(this).data('swiper', s);
			return s;
		};
	})(window.jQuery || window.Zepto);
}

// component
if (typeof (module) !== 'undefined') {
	module.exports = Swiper;
}

// requirejs support
if (typeof define === 'function' && define.amd) {
	define([], function () {
		'use strict';
		return Swiper;
	});
}
/*! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
	"use strict";

	// For browsers that support matchMedium api such as IE 9 and webkit
	var styleMedia = (window.styleMedia || window.media);

	// For those that don't support matchMedium
	if (!styleMedia) {
		var style       = document.createElement('style'),
			script      = document.getElementsByTagName('script')[0],
			info        = null;

		style.type  = 'text/css';
		style.id    = 'matchmediajs-test';

		script.parentNode.insertBefore(style, script);

		// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
		info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

		styleMedia = {
			matchMedium: function(media) {
				var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

				// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
				if (style.styleSheet) {
					style.styleSheet.cssText = text;
				} else {
					style.textContent = text;
				}

				// Test if media query is true or false
				return info.width === '1px';
			}
		};
	}

	return function(media) {
		return {
			matches: styleMedia.matchMedium(media || 'all'),
			media: media || 'all'
		};
	};
}());
/*! Picturefill - Responsive Images that work today.
*  Author: Scott Jehl, Filament Group, 2012 ( new proposal implemented by Shawn Jansepar )
*  License: MIT/GPLv2
*  Spec: http://picture.responsiveimages.org/
*/
(function( w, doc, image ) {
	// Enable strict mode
	"use strict";

	function expose(picturefill) {
		/* expose picturefill */
		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// CommonJS, just export
			module.exports = picturefill;
		} else if ( typeof define === "function" && define.amd ) {
			// AMD support
			define( "picturefill", function() { return picturefill; } );
		}
		if ( typeof w === "object" ) {
			// If no AMD and we are in the browser, attach to window
			w.picturefill = picturefill;
		}
	}

	// If picture is supported, well, that's awesome. Let's get outta here...
	if ( w.HTMLPictureElement ) {
		expose(function() { });
		return;
	}

	// HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
	doc.createElement( "picture" );

	// local object for method references and testing exposure
	var pf = w.picturefill || {};

	var regWDesc = /\s+\+?\d+(e\d+)?w/;

	// namespace
	pf.ns = "picturefill";

	// srcset support test
	(function() {
		pf.srcsetSupported = "srcset" in image;
		pf.sizesSupported = "sizes" in image;
		pf.curSrcSupported = "currentSrc" in image;
	})();

	// just a string trim workaround
	pf.trim = function( str ) {
		return str.trim ? str.trim() : str.replace( /^\s+|\s+$/g, "" );
	};

	/**
	 * Gets a string and returns the absolute URL
	 * @param src
	 * @returns {String} absolute URL
	 */
	pf.makeUrl = (function() {
		var anchor = doc.createElement( "a" );
		return function(src) {
			anchor.href = src;
			return anchor.href;
		};
	})();

	/**
	 * Shortcut method for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
	 */
	pf.restrictsMixedContent = function() {
		return w.location.protocol === "https:";
	};
	/**
	 * Shortcut method for matchMedia ( for easy overriding in tests )
	 */

	pf.matchesMedia = function( media ) {
		return w.matchMedia && w.matchMedia( media ).matches;
	};

	// Shortcut method for `devicePixelRatio` ( for easy overriding in tests )
	pf.getDpr = function() {
		return ( w.devicePixelRatio || 1 );
	};

	/**
	 * Get width in css pixel value from a "length" value
	 * http://dev.w3.org/csswg/css-values-3/#length-value
	 */
	pf.getWidthFromLength = function( length ) {
		var cssValue;
		// If a length is specified and doesn’t contain a percentage, and it is greater than 0 or using `calc`, use it. Else, abort.
        if ( !(length && length.indexOf( "%" ) > -1 === false && ( parseFloat( length ) > 0 || length.indexOf( "calc(" ) > -1 )) ) {
            return false;
        }

		/**
		 * If length is specified in  `vw` units, use `%` instead since the div we’re measuring
		 * is injected at the top of the document.
		 *
		 * TODO: maybe we should put this behind a feature test for `vw`? The risk of doing this is possible browser inconsistancies with vw vs %
		 */
		length = length.replace( "vw", "%" );

		// Create a cached element for getting length value widths
		if ( !pf.lengthEl ) {
			pf.lengthEl = doc.createElement( "div" );

			// Positioning styles help prevent padding/margin/width on `html` or `body` from throwing calculations off.
			pf.lengthEl.style.cssText = "border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden";

			// Add a class, so that everyone knows where this element comes from
			pf.lengthEl.className = "helper-from-picturefill-js";
		}

		pf.lengthEl.style.width = "0px";

        try {
		    pf.lengthEl.style.width = length;
        } catch ( e ) {}

		doc.body.appendChild(pf.lengthEl);

		cssValue = pf.lengthEl.offsetWidth;

		if ( cssValue <= 0 ) {
			cssValue = false;
		}

		doc.body.removeChild( pf.lengthEl );

		return cssValue;
	};

    pf.detectTypeSupport = function( type, typeUri ) {
        // based on Modernizr's lossless img-webp test
        // note: asynchronous
        var image = new w.Image();
        image.onerror = function() {
            pf.types[ type ] = false;
            picturefill();
        };
        image.onload = function() {
            pf.types[ type ] = image.width === 1;
            picturefill();
        };
        image.src = typeUri;

        return "pending";
    };
	// container of supported mime types that one might need to qualify before using
	pf.types = pf.types || {};

	pf.initTypeDetects = function() {
        // Add support for standard mime types
        pf.types[ "image/jpeg" ] = true;
        pf.types[ "image/gif" ] = true;
        pf.types[ "image/png" ] = true;
        pf.types[ "image/svg+xml" ] = doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
        pf.types[ "image/webp" ] = pf.detectTypeSupport("image/webp", "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");
    };

	pf.verifyTypeSupport = function( source ) {
		var type = source.getAttribute( "type" );
		// if type attribute exists, return test result, otherwise return true
		if ( type === null || type === "" ) {
			return true;
		} else {
				var pfType = pf.types[ type ];
			// if the type test is a function, run it and return "pending" status. The function will rerun picturefill on pending elements once finished.
			if ( typeof pfType === "string" && pfType !== "pending") {
				pf.types[ type ] = pf.detectTypeSupport( type, pfType );
				return "pending";
			} else if ( typeof pfType === "function" ) {
				pfType();
				return "pending";
			} else {
				return pfType;
			}
		}
	};

	// Parses an individual `size` and returns the length, and optional media query
	pf.parseSize = function( sourceSizeStr ) {
		var match = /(\([^)]+\))?\s*(.+)/g.exec( sourceSizeStr );
		return {
			media: match && match[1],
			length: match && match[2]
		};
	};

	// Takes a string of sizes and returns the width in pixels as a number
	pf.findWidthFromSourceSize = function( sourceSizeListStr ) {
		// Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
		//                            or (min-width:30em) calc(30% - 15px)
		var sourceSizeList = pf.trim( sourceSizeListStr ).split( /\s*,\s*/ ),
			winningLength;

		for ( var i = 0, len = sourceSizeList.length; i < len; i++ ) {
			// Match <media-condition>? length, ie ( min-width: 50em ) 100%
			var sourceSize = sourceSizeList[ i ],
				// Split "( min-width: 50em ) 100%" into separate strings
				parsedSize = pf.parseSize( sourceSize ),
				length = parsedSize.length,
				media = parsedSize.media;

			if ( !length ) {
				continue;
			}
			// if there is no media query or it matches, choose this as our winning length
			if ( (!media || pf.matchesMedia( media )) &&
				// pass the length to a method that can properly determine length
				// in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
				(winningLength = pf.getWidthFromLength( length )) ) {
				break;
			}
		}

		//if we have no winningLength fallback to 100vw
		return winningLength || Math.max(w.innerWidth || 0, doc.documentElement.clientWidth);
	};

	pf.parseSrcset = function( srcset ) {
		/**
		 * A lot of this was pulled from Boris Smus’ parser for the now-defunct WHATWG `srcset`
		 * https://github.com/borismus/srcset-polyfill/blob/master/js/srcset-info.js
		 *
		 * 1. Let input (`srcset`) be the value passed to this algorithm.
		 * 2. Let position be a pointer into input, initially pointing at the start of the string.
		 * 3. Let raw candidates be an initially empty ordered list of URLs with associated
		 *    unparsed descriptors. The order of entries in the list is the order in which entries
		 *    are added to the list.
		 */
		var candidates = [];

		while ( srcset !== "" ) {
			srcset = srcset.replace( /^\s+/g, "" );

			// 5. Collect a sequence of characters that are not space characters, and let that be url.
			var pos = srcset.search(/\s/g),
				url, descriptor = null;

			if ( pos !== -1 ) {
				url = srcset.slice( 0, pos );

				var last = url.slice(-1);

				// 6. If url ends with a U+002C COMMA character (,), remove that character from url
				// and let descriptors be the empty string. Otherwise, follow these substeps
				// 6.1. If url is empty, then jump to the step labeled descriptor parser.

				if ( last === "," || url === "" ) {
					url = url.replace( /,+$/, "" );
					descriptor = "";
				}
				srcset = srcset.slice( pos + 1 );

				// 6.2. Collect a sequence of characters that are not U+002C COMMA characters (,), and
				// let that be descriptors.
				if ( descriptor === null ) {
					var descpos = srcset.indexOf( "," );
					if ( descpos !== -1 ) {
						descriptor = srcset.slice( 0, descpos );
						srcset = srcset.slice( descpos + 1 );
					} else {
						descriptor = srcset;
						srcset = "";
					}
				}
			} else {
				url = srcset;
				srcset = "";
			}

			// 7. Add url to raw candidates, associated with descriptors.
			if ( url || descriptor ) {
				candidates.push({
					url: url,
					descriptor: descriptor
				});
			}
		}
		return candidates;
	};

	pf.parseDescriptor = function( descriptor, sizesattr ) {
		// 11. Descriptor parser: Let candidates be an initially empty source set. The order of entries in the list
		// is the order in which entries are added to the list.
		var sizes = sizesattr || "100vw",
			sizeDescriptor = descriptor && descriptor.replace( /(^\s+|\s+$)/g, "" ),
			widthInCssPixels = pf.findWidthFromSourceSize( sizes ),
			resCandidate;

			if ( sizeDescriptor ) {
				var splitDescriptor = sizeDescriptor.split(" ");

				for (var i = splitDescriptor.length - 1; i >= 0; i--) {
					var curr = splitDescriptor[ i ],
						lastchar = curr && curr.slice( curr.length - 1 );

					if ( ( lastchar === "h" || lastchar === "w" ) && !pf.sizesSupported ) {
						resCandidate = parseFloat( ( parseInt( curr, 10 ) / widthInCssPixels ) );
					} else if ( lastchar === "x" ) {
						var res = curr && parseFloat( curr, 10 );
						resCandidate = res && !isNaN( res ) ? res : 1;
					}
				}
			}
		return resCandidate || 1;
	};

	/**
	 * Takes a srcset in the form of url/
	 * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
	 *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
	 *     "images/pic-small.png"
	 * Get an array of image candidates in the form of
	 *      {url: "/foo/bar.png", resolution: 1}
	 * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
	 * If sizes is specified, resolution is calculated
	 */
	pf.getCandidatesFromSourceSet = function( srcset, sizes ) {
		var candidates = pf.parseSrcset( srcset ),
			formattedCandidates = [];

		for ( var i = 0, len = candidates.length; i < len; i++ ) {
			var candidate = candidates[ i ];

			formattedCandidates.push({
				url: candidate.url,
				resolution: pf.parseDescriptor( candidate.descriptor, sizes )
			});
		}
		return formattedCandidates;
	};

	/**
	 * if it's an img element and it has a srcset property,
	 * we need to remove the attribute so we can manipulate src
	 * (the property's existence infers native srcset support, and a srcset-supporting browser will prioritize srcset's value over our winning picture candidate)
	 * this moves srcset's value to memory for later use and removes the attr
	 */
	pf.dodgeSrcset = function( img ) {
		if ( img.srcset ) {
			img[ pf.ns ].srcset = img.srcset;
			img.srcset = "";
			img.setAttribute( "data-pfsrcset", img[ pf.ns ].srcset );
		}
	};

	// Accept a source or img element and process its srcset and sizes attrs
	pf.processSourceSet = function( el ) {
		var srcset = el.getAttribute( "srcset" ),
			sizes = el.getAttribute( "sizes" ),
			candidates = [];

		// if it's an img element, use the cached srcset property (defined or not)
		if ( el.nodeName.toUpperCase() === "IMG" && el[ pf.ns ] && el[ pf.ns ].srcset ) {
			srcset = el[ pf.ns ].srcset;
		}

		if ( srcset ) {
			candidates = pf.getCandidatesFromSourceSet( srcset, sizes );
		}
		return candidates;
	};

	pf.backfaceVisibilityFix = function( picImg ) {
		// See: https://github.com/scottjehl/picturefill/issues/332
		var style = picImg.style || {},
			WebkitBackfaceVisibility = "webkitBackfaceVisibility" in style,
			currentZoom = style.zoom;

		if (WebkitBackfaceVisibility) {
			style.zoom = ".999";

			WebkitBackfaceVisibility = picImg.offsetWidth;

			style.zoom = currentZoom;
		}
	};

	pf.setIntrinsicSize = (function() {
		var urlCache = {};
		var setSize = function( picImg, width, res ) {
            if ( width ) {
			    picImg.setAttribute( "width", parseInt(width / res, 10) );
            }
		};
		return function( picImg, bestCandidate ) {
			var img;
			if ( !picImg[ pf.ns ] || w.pfStopIntrinsicSize ) {
				return;
			}
			if ( picImg[ pf.ns ].dims === undefined ) {
				picImg[ pf.ns].dims = picImg.getAttribute("width") || picImg.getAttribute("height");
			}
			if ( picImg[ pf.ns].dims ) { return; }

			if ( bestCandidate.url in urlCache ) {
				setSize( picImg, urlCache[bestCandidate.url], bestCandidate.resolution );
			} else {
				img = doc.createElement( "img" );
				img.onload = function() {
					urlCache[bestCandidate.url] = img.width;

                    //IE 10/11 don't calculate width for svg outside document
                    if ( !urlCache[bestCandidate.url] ) {
                        try {
                            doc.body.appendChild( img );
                            urlCache[bestCandidate.url] = img.width || img.offsetWidth;
                            doc.body.removeChild( img );
                        } catch(e){}
                    }

					if ( picImg.src === bestCandidate.url ) {
						setSize( picImg, urlCache[bestCandidate.url], bestCandidate.resolution );
					}
					picImg = null;
					img.onload = null;
					img = null;
				};
				img.src = bestCandidate.url;
			}
		};
	})();

	pf.applyBestCandidate = function( candidates, picImg ) {
		var candidate,
			length,
			bestCandidate;

		candidates.sort( pf.ascendingSort );

		length = candidates.length;
		bestCandidate = candidates[ length - 1 ];

		for ( var i = 0; i < length; i++ ) {
			candidate = candidates[ i ];
			if ( candidate.resolution >= pf.getDpr() ) {
				bestCandidate = candidate;
				break;
			}
		}

		if ( bestCandidate ) {

			bestCandidate.url = pf.makeUrl( bestCandidate.url );

			if ( picImg.src !== bestCandidate.url ) {
				if ( pf.restrictsMixedContent() && bestCandidate.url.substr(0, "http:".length).toLowerCase() === "http:" ) {
					if ( window.console !== undefined ) {
						console.warn( "Blocked mixed content image " + bestCandidate.url );
					}
				} else {
					picImg.src = bestCandidate.url;
					// currentSrc attribute and property to match
					// http://picture.responsiveimages.org/#the-img-element
					if ( !pf.curSrcSupported ) {
						picImg.currentSrc = picImg.src;
					}

					pf.backfaceVisibilityFix( picImg );
				}
			}

			pf.setIntrinsicSize(picImg, bestCandidate);
		}
	};

	pf.ascendingSort = function( a, b ) {
		return a.resolution - b.resolution;
	};

	/**
	 * In IE9, <source> elements get removed if they aren't children of
	 * video elements. Thus, we conditionally wrap source elements
	 * using <!--[if IE 9]><video style="display: none;"><![endif]-->
	 * and must account for that here by moving those source elements
	 * back into the picture element.
	 */
	pf.removeVideoShim = function( picture ) {
		var videos = picture.getElementsByTagName( "video" );
		if ( videos.length ) {
			var video = videos[ 0 ],
				vsources = video.getElementsByTagName( "source" );
			while ( vsources.length ) {
				picture.insertBefore( vsources[ 0 ], video );
			}
			// Remove the video element once we're finished removing its children
			video.parentNode.removeChild( video );
		}
	};

	/**
	 * Find all `img` elements, and add them to the candidate list if they have
	 * a `picture` parent, a `sizes` attribute in basic `srcset` supporting browsers,
	 * a `srcset` attribute at all, and they haven’t been evaluated already.
	 */
	pf.getAllElements = function() {
		var elems = [],
			imgs = doc.getElementsByTagName( "img" );

		for ( var h = 0, len = imgs.length; h < len; h++ ) {
			var currImg = imgs[ h ];

			if ( currImg.parentNode.nodeName.toUpperCase() === "PICTURE" ||
			( currImg.getAttribute( "srcset" ) !== null ) || currImg[ pf.ns ] && currImg[ pf.ns ].srcset !== null ) {
				elems.push( currImg );
			}
		}
		return elems;
	};

	pf.getMatch = function( img, picture ) {
		var sources = picture.childNodes,
			match;

		// Go through each child, and if they have media queries, evaluate them
		for ( var j = 0, slen = sources.length; j < slen; j++ ) {
			var source = sources[ j ];

			// ignore non-element nodes
			if ( source.nodeType !== 1 ) {
				continue;
			}

			// Hitting the `img` element that started everything stops the search for `sources`.
			// If no previous `source` matches, the `img` itself is evaluated later.
			if ( source === img ) {
				return match;
			}

			// ignore non-`source` nodes
			if ( source.nodeName.toUpperCase() !== "SOURCE" ) {
				continue;
			}
			// if it's a source element that has the `src` property set, throw a warning in the console
			if ( source.getAttribute( "src" ) !== null && typeof console !== undefined ) {
				console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");
			}

			var media = source.getAttribute( "media" );

			// if source does not have a srcset attribute, skip
			if ( !source.getAttribute( "srcset" ) ) {
				continue;
			}

			// if there's no media specified, OR w.matchMedia is supported
			if ( ( !media || pf.matchesMedia( media ) ) ) {
				var typeSupported = pf.verifyTypeSupport( source );

				if ( typeSupported === true ) {
					match = source;
					break;
				} else if ( typeSupported === "pending" ) {
					return false;
				}
			}
		}

		return match;
	};

	function picturefill( opt ) {
		var elements,
			element,
			parent,
			firstMatch,
			candidates,
			options = opt || {};

		elements = options.elements || pf.getAllElements();

		// Loop through all elements
		for ( var i = 0, plen = elements.length; i < plen; i++ ) {
			element = elements[ i ];
			parent = element.parentNode;
			firstMatch = undefined;
			candidates = undefined;

			// immediately skip non-`img` nodes
			if ( element.nodeName.toUpperCase() !== "IMG" ) {
				continue;
			}

			// expando for caching data on the img
			if ( !element[ pf.ns ] ) {
				element[ pf.ns ] = {};
			}

			// if the element has already been evaluated, skip it unless
			// `options.reevaluate` is set to true ( this, for example,
			// is set to true when running `picturefill` on `resize` ).
			if ( !options.reevaluate && element[ pf.ns ].evaluated ) {
				continue;
			}

			// if `img` is in a `picture` element
			if ( parent && parent.nodeName.toUpperCase() === "PICTURE" ) {

				// IE9 video workaround
				pf.removeVideoShim( parent );

				// return the first match which might undefined
				// returns false if there is a pending source
				// TODO the return type here is brutal, cleanup
				firstMatch = pf.getMatch( element, parent );

				// if any sources are pending in this picture due to async type test(s)
				// remove the evaluated attr and skip for now ( the pending test will
				// rerun picturefill on this element when complete)
				if ( firstMatch === false ) {
					continue;
				}
			} else {
				firstMatch = undefined;
			}

			// Cache and remove `srcset` if present and we’re going to be doing `picture`/`srcset`/`sizes` polyfilling to it.
			if ( ( parent && parent.nodeName.toUpperCase() === "PICTURE" ) ||
			( !pf.sizesSupported && ( element.srcset && regWDesc.test( element.srcset ) ) ) ) {
				pf.dodgeSrcset( element );
			}

			if ( firstMatch ) {
				candidates = pf.processSourceSet( firstMatch );
				pf.applyBestCandidate( candidates, element );
			} else {
				// No sources matched, so we’re down to processing the inner `img` as a source.
				candidates = pf.processSourceSet( element );

				if ( element.srcset === undefined || element[ pf.ns ].srcset ) {
					// Either `srcset` is completely unsupported, or we need to polyfill `sizes` functionality.
					pf.applyBestCandidate( candidates, element );
				} // Else, resolution-only `srcset` is supported natively.
			}

			// set evaluated to true to avoid unnecessary reparsing
			element[ pf.ns ].evaluated = true;
		}
	}

	/**
	 * Sets up picture polyfill by polling the document and running
	 * the polyfill every 250ms until the document is ready.
	 * Also attaches picturefill on resize
	 */
	function runPicturefill() {
		pf.initTypeDetects();
		picturefill();
		var intervalId = setInterval( function() {
			// When the document has finished loading, stop checking for new images
			// https://github.com/ded/domready/blob/master/ready.js#L15
			picturefill();

			if ( /^loaded|^i|^c/.test( doc.readyState ) ) {
				clearInterval( intervalId );
				return;
			}
		}, 250 );

		var resizeTimer;
		var handleResize = function() {
	        picturefill({ reevaluate: true });
	    };
		function checkResize() {
		    clearTimeout(resizeTimer);
		    resizeTimer = setTimeout( handleResize, 60 );
		}

		if ( w.addEventListener ) {
			w.addEventListener( "resize", checkResize, false );
		} else if ( w.attachEvent ) {
			w.attachEvent( "onresize", checkResize );
		}
	}

	runPicturefill();

	/* expose methods for testing */
	picturefill._ = pf;

	expose( picturefill );

} )( window, window.document, new window.Image() );

//----------------------------------------------------------------------
//	CAROUSEL
//	Base Package
//----------------------------------------------------------------------

var Carousel = {

	directionNav: '[data-carousel-direction]',
	directionNext: '[data-carousel-direction="next"]',
	directionPrev: '[data-carousel-direction="prev"]',
	pagination: '[data-carousel-pagination]',
	selector: '[data-carousel]',

	togglePagination: 'data-carousel-has-pagination',

	options: {},

	init: function () {

		if (window.matchMedia('only screen and (min-width: ' + ClientSettings.bpDesk + 'em)').matches && $(this.selector).length) {

			// loop through carousels
			$(this.selector).each(function () {

				var $this = $(this);

				// set options for different carousels & bind resize for multi slides
				Carousel.setOptions($this);
			});
		}

	},

	setOptions: function ($this) {

		// set shared default options
		this.options = {
			calculateHeight: true,
			grabCursor: false,
			mode: 'horizontal',
			resistance: '100%',
			roundLengths: true,
			simulateTouch: true,
			speed: 500,
			updateOnImagesReady: true,
			visibilityFullFit: true,
			onSwiperCreated: function (swiper) {
				Carousel.setDirectionState($this, swiper);
				swiper.resizeFix();
			},
			onSlideChangeEnd: function (swiper) {
				Carousel.setDirectionState($this, swiper);
			},
			onTouchEnd: function (swiper) {
				Carousel.setDirectionState($this, swiper);
			}
		};

		// call custom options
		this.customOptions($this);

		// call swiper build once options set
		this.build($this);

	},
	customOptions: function ($this) {

		// detect type of carousel
		var hasPagination = $this[0].hasAttribute(this.togglePagination),
			  $paginationSelector = $this.siblings(this.pagination)[0];

		// add custom Pagination options
		if (hasPagination) {
			this.options.createPagination = true;
			this.options.pagination = $paginationSelector;
			this.options.paginationClickable = true;
			this.options.paginationElement = 'li';
		}
	},

	build: function ($this) {

		// init swiper with custom options set and bind direction nav
		$this.swiper(this.options);
		this.bindDirectionNav();
	},

	bindDirectionNav: function () {

		$(this.directionNav).on('click', function () {

			var $this = $(this),
				$container = $this.siblings('[data-carousel]'),
				carousel = $container.data('swiper'),
				direction = $this.data('carousel-direction');

			// go to next slide else go to prev slide
			if (direction == 'next') {
				carousel.swipeNext();
			} else if (direction == 'prev') {
				carousel.swipePrev();
			} else {
				var carousel = $(this).parents('[data-carousel]').data('swiper');
				carousel.swipeNext();
				e.preventDefault();
			}

		});
	},

	setDirectionState: function ($this, swiper) {

		var $dirPrev = $this.siblings(this.directionPrev),
			$dirNext = $this.siblings(this.directionNext);

		// if first slide is visible disable prev
		if (swiper.activeIndex === 0) {
			$dirPrev[0].disabled = true;
			$dirNext[0].disabled = false;
		}
			// if last slide is visible disable next
		else if (swiper.activeIndex + swiper.visibleSlides.length === swiper.slides.length) {
			$dirPrev[0].disabled = false;
			$dirNext[0].disabled = true;
		}
			// activate both direction
		else {
			$dirPrev[0].disabled = false;
			$dirNext[0].disabled = false;
		}
	}

};


//----------------------------------------------------------------------
//	COLLAPSIBLE
//	Base Package
//	Support IE9+
//	Required dependency: utilities.js
//----------------------------------------------------------------------

var Collapsible = {

	toggleSelector: document.querySelectorAll('[data-collapsible-toggle]'),
	toggleTextAttr: 'data-collapsible-text',
	accordionAttr: 'data-collapsible-accordion',
	accordionParentAttr: 'data-accordion',
	expanderAttr: 'data-collapsible-expander',
	initialHeightAttr: 'data-initial-height',
	prefix: 'collapsible-',
	animationClass: 'no-animate',
	animationDuration: 250,

	init: function () {
		// check for querySelector and addEventListener support
		if ('querySelector' in document && 'addEventListener' in window && Collapsible.toggleSelector.length) {
			// call to build if collapsibles on page
			Collapsible.addDocumentClass(Collapsible.prefix + 'active');
			Collapsible.buildAll();
		} else {
			// add inactive class for fallback styles
			Collapsible.addDocumentClass(Collapsible.prefix + 'inactive');
		}
	},

	addDocumentClass: function (className) {
		Utilities.addClass(Constants.root, className);
	},

	buildAll: function () {
		// store var for max accordion height
		var accordionBlockHeight = 0;

		// loop through collapsibles
		for (var i = 0; i < Collapsible.toggleSelector.length; i++) {
			// store element
			var that = Collapsible.toggleSelector[i],
				thatHeight = that.offsetHeight,
				thatContent = Utilities.getNextSibling(that);

			// add aria to content
			Collapsible.addAria(that, thatContent, i);

			// check if height needs setting for accordion
			if (Collapsible.isAccordion(that)) {
				// get max height of set
				accordionBlockHeight = (thatHeight > accordionBlockHeight) ? thatHeight : accordionBlockHeight;
			}
			// create buttons and callback to bind clicks
			Collapsible.bindClickEvents(that);
		}

		// if accordion, loop through set again setting heights of blocks and parents
		for (var i = 0; i < Collapsible.toggleSelector.length; i++) {
			// store element
			var that = Collapsible.toggleSelector[i];

			if (Collapsible.isAccordion(that)) {
				// set same height on blocks and parents
				Collapsible.setDefaultHeight(that, accordionBlockHeight);
				Collapsible.setDefaultHeight(that.parentNode, Utilities.getOuterHeight(that));
			}
		}
	},

	addAria: function (that, thatContent, i) {
		// attach id and aria to trigger and content 
		that.setAttribute('aria-expanded', false);
		that.setAttribute('aria-controls', Collapsible.prefix + i);
		thatContent.id = Collapsible.prefix + i;
		thatContent.setAttribute('aria-hidden', true);
	},

	isAccordion: function (that) {
		// check if parent element is accordion, return object or null
		return Utilities.parentElementWithAttribute(that, Collapsible.accordionParentAttr);
	},

	isExpander: function (that) {
		// check if parent element is accordion, return object or null
		return Utilities.parentElementWithAttribute(that, Collapsible.expanderAttr);
	},

	setDefaultHeight: function (that, blockHeight) {
		// set height on parent so animation has inital 'from' height value
		that.style.height = blockHeight + 'px';
	},

	bindClickEvents: function (that) {
		// add click event listener
		Utilities.addEventListener(that, 'click', function (e) {
			Collapsible.toggleEvent(that);
			e.preventDefault();
		});
	},

	toggleEvent: function (that) {
		// work out if state is open or closed
		// test accordion attribute and store parent element
		var state = (that.getAttribute('aria-expanded') === 'false') ? true : false,
			parentAccordion = Collapsible.isAccordion(that);

		// check for accordion state on parent
		if (parentAccordion) {
			// work out if accordion has sibling open at same offset
			// store current open offset
			var bodyRect = document.body.getBoundingClientRect(),
				elementRect = that.getBoundingClientRect(),
				offsetTop = parseInt(elementRect.top, 10) - parseInt(bodyRect.top, 10),
				alreadyOpenToggle = parentAccordion.querySelector('[aria-expanded="true"]'),
				currentOpenOffset = parseInt(parentAccordion.getAttribute(Collapsible.accordionParentAttr), 10);

			// adjust animation duration if need be (ie. one already open at same offset)
			if (state && offsetTop === currentOpenOffset) {
				Utilities.addClass(parentAccordion, Collapsible.animationClass);
			} else {
				Utilities.removeClass(parentAccordion, Collapsible.animationClass);
			}

			// if opening
			if (state) {
				// set parent data value to offset (used to determine animation duration above)
				parentAccordion.setAttribute(Collapsible.accordionParentAttr, offsetTop);

				// if already open, close others
				if (!!alreadyOpenToggle) {
					Collapsible.toggleState(alreadyOpenToggle, !state);
				}
			} else {
				// if closing accordion, un-set accordion offset value
				parentAccordion.setAttribute(Collapsible.accordionParentAttr, '');
			}

		}

		// toggle state of clicked item to open
		Collapsible.toggleState(that, state);

	},

	toggleText: function (that, state) {
		// store text content and state
		var buttonText = that.innerHTML,
			newButtonText = that.getAttribute(Collapsible.toggleTextAttr),
			textDelay = (state) ? Collapsible.animationDuration : 0;

		// swap button text if required
		// timeout to allow for animation on open/close
		if (newButtonText) {
			//var animationTimeout = setTimeout(function () {
			that.innerHTML = newButtonText;
			that.setAttribute(Collapsible.toggleTextAttr, buttonText);
			//clearTimeout(animationTimeout);
			//}, textDelay);
		}
	},

	// !refactor into smaller parts?
	toggleState: function (that, state) {
		// store respective content element
		var thatContent = Utilities.getNextSibling(that);

		// set aria states, styles to toggle content
		that.setAttribute('aria-expanded', state);
		thatContent.setAttribute('aria-hidden', !state);

		// toggle button text if need be
		Collapsible.toggleText(that, state);

		// call to animate
		Collapsible.animateHeight(that, thatContent, state);

	},

	animateHeight: function (that, thatContent, state) {
		// run animation
		if (Collapsible.isExpander(that)) {
			// store or update inital height of content on data attr on open
			var initialHeight = (state) ? thatContent.offsetHeight : thatContent.getAttribute(Collapsible.initialHeightAttr);
			thatContent.setAttribute(Collapsible.initialHeightAttr, initialHeight);
			// calculate height
			var contentHeight = (state) ? Utilities.findChildHeight(thatContent) : initialHeight;
			// animate padding-top
			thatContent.style.paddingTop = contentHeight + 'px';
		} else {
			// calculate height
			var contentHeight = (state) ? Utilities.findChildHeight(thatContent) : 0;
			// animate height
			thatContent.style.height = contentHeight + 'px';
			// update parent height if accordion
			if (Collapsible.isAccordion(that)) {
				that.parentNode.style.height = contentHeight + Utilities.getOuterHeight(that) + 'px';
			}

		}
	}

};


//----------------------------------------------------------------------
//	IN VIEW
//	Base Package
//----------------------------------------------------------------------

function inView(selector, selection, offset) {

	// get nodeList from selector and convert to array
	var scrollOffset = !!offset ? offset : 0,
		selectorNodeList = document.querySelectorAll(selector),
		selectorArray = getArrayFromNodelist(selectorNodeList),
		inviewElements = getMatchingElements();

	function getMatchingElements() {

		// filter non-matching elements
		var filteredElements = selectorArray.filter(function (el) {

			// determine if element is in viewport and parent node is visible as element may not be due to inView implementation. Usually an element itself would be hidden before fading in, whereas if the parent is hidden this will usually be due to another piece of functionality like a set of tabs/carousel etc. inView can be run on callback of tabs/carousel and will match the hidden element
			var parent = el.parentNode,
				inViewport = isElementInViewport(el),
				isVisible = inViewport ? isElementVisible(parent) : false;

			// return if in viewport and visible
			return (inViewport && isVisible);
		});

		return filteredElements;
	}

	// detect element properties
	function isElementInViewport(el) {

		// get boundaries of element and window
		var elClientRect = el.getBoundingClientRect(),
			elHeight = el.offsetHeight,
			elTop = elClientRect.top,
			elBottom = elClientRect.bottom,
			winHeight = window.innerHeight || document.documentElement.clientHeight;

		// return in view based on selection
		switch (selection) {
			case 'top':
				return viewportTop(elTop, elBottom);
			case 'bottom':
				return viewportBottom(elTop, elBottom, elHeight, winHeight);
			case 'inner':
				return viewportInner(elTop, elBottom, winHeight);
			case 'all':
				return viewportAll(elTop, elBottom, elHeight, winHeight);
			default:
				return viewportAll(elTop, elBottom, elHeight, winHeight);
		}
	}
	function isElementVisible(el) {

		// get style properties of element and check element is visible
		var opacity = getStyle(el, 'opacity') === '0',
			display = getStyle(el, 'display') === 'none',
			visibility = getStyle(el, 'visibility') === 'hidden';

		// if element is not visible, return false
		if (opacity || display || visibility) return false;

		// if parent is document node, return true
		if (el.parentNode.nodeType === 9) return true;

		// if parent exists, re-run isElementVisible with parent node to determine if parent is visible
		if (el.parentNode) return isElementVisible(el.parentNode);

		// otherwise element is visible
		return true;
	}

	// calculate element position in viewport
	function viewportTop(elTop, elBottom) {
		return (elTop <= 0 - scrollOffset) && (elBottom >= 0 - scrollOffset);
	}
	function viewportBottom(elTop, elBottom, elHeight, winHeight) {
		return elBottom <= (0 + winHeight + elHeight) && elBottom >= winHeight;
	}
	function viewportAll(elTop, elBottom, elHeight, winHeight) {
		return elTop >= -(elHeight) - scrollOffset && elBottom <= (winHeight + elHeight) - scrollOffset;
	}
	function viewportInner(elTop, elBottom, winHeight) {
		return elTop >= 0 && elBottom <= winHeight;
	}

	// utils
	function getStyle(el, prop) {
		// get style properties
		if (window.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, null)[prop];
		} else if (el.currentStyle) {
			return el.currentStyle[prop];
		}
	}
	function getArrayFromNodelist(nodeList) {
		// create empty array to push to
		var nodeArray = [];
		// loop through each item in the nodeList and add to nodeArray
		for (var i = 0; i < nodeList.length; i++) {
			nodeArray.push(nodeList[i]);
		}
		// return nodeList as array
		return nodeArray;
	}

	// return nodeList of visible elements within the viewport
	return inviewElements;
}


//----------------------------------------------------------------------
//	LINKS
//	Base Package
//----------------------------------------------------------------------

var Links = {

	selector: '[data-target]',
	viewport: 'html, body',

	targetNewWindow: 'new-window',
	targetPageTop: 'page-top',
	targetOnPage: 'on-page',
	targetSkip: 'skip',

	event: 'click',
	eventNamespace: 'links',

	headerSelector: '[data-site-header]',
	offsetValue: 0,
	scrollDuration: 600,

	init: function () {
		// detect if selector exists
		if (!$(this.selector).length) return;

		// get fixed header height for onPage links
		this.setHeaderHeight();

		// run through selectors
		this.loopSelectors();
	},

	setHeaderHeight: function () {
		Links.offsetValue = $(this.headerSelector).height();
	},

	loopSelectors: function () {

		// for each selector
		$(this.selector).each(function () {

			// check bound events
			var $this = $(this),
				eventBound = Links.matchBoundEvent($this);

			// if no event has been bound
			if (eventBound) return;

			// bind click event
			Links.bindClick($this);
		});
	},

	// event
	bindClick: function ($this) {

		// bind namespaced event
		$this.on(this.event + '.' + this.eventNamespace, function (e) {

			// get target event from data-target
			var href = $this.attr('href'),
				target = $this.data('target'),
				targetEvent = Links.getTargetEvent(target);

			// run target event
			targetEvent(href);
			e.preventDefault();
		});
	},

	// targets
	newWindow: function (href) {
		// window parameters
		var height = 420,
			width = 500,
			scrollBars = 'no',
			resizable = 'yes';
		// open new window with params
		window.open(href, 'popup', 'width=' + width + ', height=' + height + ', scrollbars=' + scrollBars + ', resizable=' + resizable + '');
	},
	onPage: function (href) {
		// scroll to offset of target
		$(Links.viewport).stop().animate({
			scrollTop: Math.ceil($(href).offset().top) - Links.offsetValue
		}, Links.scrollDuration);

	    // Don't close off canvas by Dmitrii request (if screen width greater than 922).
		if ($(".nav-primary__list-item").width() >= 300) {
		    OffCanvas.closeOffCanvas();
        }
	},
	pageTop: function (href) {
		// check if page has scrolled
		if ($(window).scrollTop() > 0) {
			// scroll to top
			$(Links.viewport).stop().animate({
				scrollTop: 0
			}, Links.scrollDuration);
		}
	},
	skip: function (href) {
		// focus accessibility links
		$(href).attr('tabindex', '-1').focus();
	},

	// utils
	matchBoundEvent: function ($this) {

		// get click events
		var linksBound = false;

		// detect if any events are bound, !(!!) detects if item is not false, null or undefined, not neccessarily a check for a valid event object
		var allEvent = this.getBoundEvents($this);
		if (!(!!allEvent)) return false;

		// get click event
		var targetEvent = allEvent[this.event];
		if (!(!!targetEvent)) return false;

		// loop through bound click events
		for (var i = 0; i < targetEvent.length; i++) {
			// check if event namespace exists
			if (targetEvent[i].namespace === this.eventNamespace) {
				linksBound = true;
			}
		}

		// return if click event has been bound
		return linksBound;
	},
	getTargetEvent: function (target) {

		// match target and return relevant function
		switch (target) {
			case this.targetNewWindow:
				return this.newWindow;
			case this.targetOnPage:
				return this.onPage;
			case this.targetSkip:
				return this.skip;
			case this.targetPageTop:
				return this.pageTop;
		}
	},
	getBoundEvents: function ($this) {
		// return events bound to $this
		return $._data($this[0], 'events');
	}
};
//----------------------------------------------------------------------
//	OFF-CANVAS
//	Base Package
//----------------------------------------------------------------------

var OffCanvas = {

	header: document.getElementById('site-header'),
	container: document.getElementById('container-off-canvas'),
	btnOpen: document.getElementById('btn-off-canvas-open'),
	btnClose: document.getElementById('btn-off-canvas-close'),
	toggleClass: 'off-canvas-is-visible',
	animateReadyClass: 'container-off-canvas--is-animate-ready',
	openEventBound: false,
	closeEventBound: false,

	init: function () {
		if (!OffCanvas.btnOpen) return;
		// run conditional
		OffCanvas.run();

	},

	run: function () {
		// set conditional for matchmedia query
		OffCanvas.bindOpenEvent();
		Utilities.addClass(OffCanvas.container, OffCanvas.animateReadyClass);
	},

	bindOpenEvent: function () {
		OffCanvas.btnOpen.addEventListener('click', OffCanvas.openOffCanvas, false);
		OffCanvas.openEventBound = true;
	},

	unbindOpenEvent: function () {
		OffCanvas.btnOpen.removeEventListener('click', OffCanvas.openOffCanvas, false);
		OffCanvas.openEventBound = false;
	},

	bindCloseEvent: function () {
		OffCanvas.btnClose.addEventListener('click', OffCanvas.closeOffCanvas, false);
		OffCanvas.closeEventBound = true;
	},

	unbindCloseEvent: function () {
		OffCanvas.btnClose.removeEventListener('click', OffCanvas.closeOffCanvas, false);
		OffCanvas.closeEventBound = false;
	},

	openOffCanvas: function () {
		Utilities.addClass(Constants.root, OffCanvas.toggleClass);
		OffCanvas.bindCloseEvent();
	},

	closeOffCanvas: function () {
		Utilities.removeClass(Constants.root, OffCanvas.toggleClass);
		OffCanvas.unbindCloseEvent();
	}

};

//----------------------------------------------------------------------
//	TABS
//	Base Package
//----------------------------------------------------------------------

var Tabs = {

	selector: '[data-tab-container]',
	content: '[data-tab-content]',

	button: '[data-tab-button]',
	buttonListSelector: '[data-tab-list]',
	buttonListItem: '[data-tab-item]',

	currentClass: 'current',

	init: function () {
		if ($(this.selector).length) {
			this.setAriaAttrs();
			this.bindClickEvents();
		}
	},

	setAriaAttrs: function () {

		// for each set of tabs
		$(this.selector).each(function (e) {

			// get container
			var $container = $(this);

			// loop through each tab in container
			$(Tabs.button, $container).each(function (i) {

				// store $this value and unique tab ID
				var $this = $(this),
				   tabId = 'tab-' + e + i;

				// add aria-controls to button
				$this.attr('aria-controls', tabId);

				// add matching id to its content div and hide
				$container.find(Tabs.content).eq(i).attr('id', tabId).attr('aria-hidden', true);
			});

			// show initial tab content 
			$container.find(Tabs.content).eq(0).attr('aria-hidden', false);
		});
	},

	bindClickEvents: function () {

		// bind click event
		$(this.button, this.selector).on('click', function () {

			// store btn and accordion objects
			var $this = $(this),
            	$container = $this.parents(Tabs.selector),
            	tabId = $this.attr('aria-controls'),
			  	$thisContent = $('#' + tabId),
            	scrollPos = $(window).scrollTop();

			// if content is hidden
			if ($thisContent.attr('aria-hidden', true)) {
				// set all tabs aria-hidden state to true and show relevant tab
				$container.find(Tabs.content).attr('aria-hidden', true).removeClass(Tabs.currentClass);
				$thisContent.attr('aria-hidden', false).attr('tabindex', -1).focus().addClass(Tabs.currentClass);

				// set scrollPos Y-axis on click (before focus) to avoid page jumping to focussed tab
				window.scrollTo(0, scrollPos);

				// change current class on tab
				$container.find(Tabs.button).removeClass(Tabs.currentClass);
				$this.addClass(Tabs.currentClass);
			}

		});
	}

};
//----------------------------------------------------------------------
//	UTILITIES
//	Base Package
//	jQuery-free helpers
//----------------------------------------------------------------------

Utilities = {

	//	EVENTS
	//-----------------------------------

	addEventListener: function (el, eventName, handler) {
		if (el.addEventListener) {
			el.addEventListener(eventName, handler, true);
		} else {
			el.attachEvent('on' + eventName, function () {
				handler.call(el);
			});
		}
	},

	removeEventListener: function (el, eventName, handler) {
		if (el.removeEventListener) {
			el.removeEventListener(eventName, handler);
		} else {
			el.detachEvent('on' + eventName, handler);
		}
	},



	//	DOM
	//-----------------------------------

	// add class to element
	addClass: function (el, className) {
		if (el.classList) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}
	},

	// children height helper
	findChildHeight: function ($this) {
		var totalHeight = 0;
		for (var i = 0; i < $this.children.length; i++) {
			totalHeight += Utilities.getOuterHeight($this.children[i]);
		}
		return totalHeight;
	},

	// some browsers treat empty white-spaces or new lines as text nodes
	getNextSibling: function (el) {
		var nextSiblingElement = el.nextSibling;
		// loop over nextSiblings until non-text node (1) found
		while (nextSiblingElement.nodeType !== 1) {
			nextSiblingElement = nextSiblingElement.nextSibling;
		}
		return nextSiblingElement;
	},

	// offsetHeight won't include margins - use this as $(el).outerHeight(true) equivalent
	getOuterHeight: function (el) {
		// store height and style object
		var height = el.offsetHeight;
		var style = el.currentStyle || getComputedStyle(el),
			// calculate margin top and bottom, and convert em to px if required
			// margin em value (float for decimals) multiplied by 16 and rounded up
			marginTop = (style.marginTop.indexOf('em') !== -1) ? Math.ceil(parseFloat(style.marginTop, 10) * 16) : parseInt(style.marginTop, 10),
			marginBottom = (style.marginBottom.indexOf('em') !== -1) ? Math.ceil(parseFloat(style.marginBottom, 10) * 16) : parseInt(style.marginBottom, 10);

		// increase element height with vertical margins
		height += marginTop + marginBottom;
		return height;
	},

	// hasClass()
	hasClass: function (el, className) {
		if (el.classList) {
			return el.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
		}
	},

	parentElementWithAttribute: function (el, attr) {
		// set up loop to test if element has parent with attribute
		// recursive, returns boolean
		var parent = el.parentNode;
		while (parent !== document.body) {
			if (parent.hasAttribute(attr)) {
				return parent;
			} else {
				parent = parent.parentNode;
			}
		}
		return null;
	},

	// remove class from element
	removeClass: function (el, className) {
		if (el.classList) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}
};


// Constants already exist in master.js
//	Set constants
var Constants = {
	root: document.documentElement
};

// call Collapsible.init() from master.js
Collapsible.init();
//----------------------------------------------------------------------
//	BUSINESS MODEL
//
//----------------------------------------------------------------------

var ToggleBusinessValue = {

	selector: '[data-value-button]',
	containerSelector: '[data-container-value]',
	toggleClassContainer: 'model-drawer--is-opened',


	init: function () {

		ToggleBusinessValue.bindClickEvent();
	},

	bindClickEvent: function () {

		$(ToggleBusinessValue.selector).on('click', function (e) {

			var state = ($(ToggleBusinessValue.containerSelector).hasClass(ToggleBusinessValue.toggleClassContainer)) ? true : false;

			$(ToggleBusinessValue.containerSelector).toggleClass(ToggleBusinessValue.toggleClassContainer);

			Expander.animateOuter();

			// reset open expanders and inner padding when closing
			if (state) {
				Expander.toggleExpander($(Expander.button).not('[aria-expanded="false"]'), false);
				Expander.setPaddingBottom($('.model__inner'), 10); // 10 is default
			}

			// remove dynamic height
			$(EqualHeight.selector).css('min-height', 0);

			// re-call equal height
			EqualHeight.init();

			e.preventDefault();
		});

	}
};

jQuery.extend(jQuery.easing, {
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
			return -c / 2 * ((--t) * (t - 2) - 1) + b;
		}
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	}
});

//----------------------------------------------------------------------
//	BUSINESS MODEL
//	Equal Height
//----------------------------------------------------------------------

var EqualHeight = {

	selector: '[data-equal-height-item]',
	selectorContainer: '.model-drawer--is-opened .model__outer',

	init: function () {
		this.setHeight();
	},

	setHeight: function () {

		var maxHeight = 0;

		$(EqualHeight.selector).each(function () {
			if ($(this).outerHeight() > maxHeight) {
				maxHeight = $(this).outerHeight();
			}
		});

		$(EqualHeight.selector).css('min-height', maxHeight);
		$(EqualHeight.selectorContainer).css('min-height', maxHeight);
	}

};

//----------------------------------------------------------------------
//	EXPANDER
//
//----------------------------------------------------------------------

var Expander = {

	selector: '[data-expander]',
	button: '[data-expander-button]',
	content: '[data-expander-content]',
	container: '[data-expander-container]',

	isContent: 'data-expander-content',
	isAccordion: 'data-expander-is-accordion',
	isBusinessModel: 'data-expander-is-business-model',

	bottomPadding: 0,
	duration: 0,

	init: function () {
		// if expander exists
		if ($(this.selector).length) {
			// add aria attributes to aid accessibility
			// bind click events for toggle
			this.setUp();
			this.bindClickEvents();
		}
	},

	// set up
	setUp: function () {

		// loop through each expander
		$(this.selector).each(function (i) {

			// create expander id
			var $this = $(this),
				expanderId = 'expander-' + i;

			// add aria-controls to button
			$(Expander.button, $this).attr({
				'aria-controls': expanderId,
				'aria-expanded': false
			});

			// add matching id to its content div
			$(Expander.content, $this).attr({
				id: expanderId,
				'aria-hidden': true
			});
		});

	},

	// bind event
	bindClickEvents: function () {

		// bind click event
		$(this.button).on('click', function () {

			// store btn and expander objects
			var $this = $(this),
				state = $this.attr('aria-expanded') === 'false' ? true : false,
				$container = $this.parents(Expander.container),
				isAccordion = $container[0].hasAttribute(Expander.isAccordion),
				isBusinessModel = $container[0].hasAttribute(Expander.isBusinessModel);

			// detect if accordion is required for expander
			if (isAccordion) {

				// detect open expander to close
				$container.find(Expander.button).not($this).each(function () {
					var $this = $(this);

					// if an expander is open
					if ($this.attr('aria-expanded') === 'true') {
						// toggle expander with false denoting the close action!
						Expander.toggleExpander($this, false);
					}
				});
			}

			// run toggle expander and pass through state
			Expander.toggleExpander($this, state);

			// animate inner and outer
			Expander.animateOuter();
		});
	},

	animateOuter: function () {
		// remove dynamic height first
		$(EqualHeight.selector).css('min-height', 0);

		var $outer = $('.model__outer'),
			$inner = $('.model__inner'),
			$drawer = $('.model-drawer'),
			drawerLeftHeight = $('.drawer--left .model-drawer__inner').outerHeight(),
			drawerRightHeight = $('.drawer--right .model-drawer__inner').outerHeight(),
			toggleHeight = 25; //$('.model-value').outerHeight(), // additional buffer between toggle and bottom

		Expander.bottomPadding = drawerRightHeight;

		// get tallest drawer for total height
		if (drawerLeftHeight > drawerRightHeight) {
			Expander.bottomPadding = drawerLeftHeight;
		}

		// animate inner for mobile layout only (convert bplap to pixels and max-width query - minus 1 to avoid overlap)
		if (window.matchMedia('(max-width: ' + ((ClientSettings.bpLap * 16) - 1) + 'px)').matches) {
			Expander.setPaddingBottom($inner, Expander.bottomPadding + toggleHeight);
			$drawer.css('bottom', Expander.bottomPadding + toggleHeight + 45); // 45 - center vertically in new space
		} else {
			// otherwise animate outer height and drawers for lap+
			$('.model__outer').css('min-height', Expander.bottomPadding);
		}
		// always match drawer heights
		$('.model-drawer__inner').css('min-height', Expander.bottomPadding);

	},

	setPaddingBottom: function (el, value) {
		// animate inner for mobile layout only (convert bplap to pixels and max-width query - minus 1 to avoid overlap)
		if (window.matchMedia('(max-width: ' + ((ClientSettings.bpLap * 16) - 1) + 'px)').matches) {
			el.css('padding-bottom', value);
		}
	},


	// toggle
	toggleExpander: function ($this, state) {

		// get relative elements
		var $thisExpander = $this.parents(this.selector),
			$thisContent = $(this.content, $thisExpander),
            scrollPos = $(window).scrollTop();

		// set btn state
		$this.attr('aria-expanded', state);
		// disable multiple button clicks
		$this.attr('disabled', true);

		// get button text
		var buttonTextOpen = $this.attr('data-content-open'),
			buttonTextClosed = $this.attr('data-content-closed'),
			buttonText = state ? buttonTextOpen : buttonTextClosed;


		// if button text exists
		if (!!buttonTextOpen) {
			// update button text
			$this.html(buttonText);
		}

		// animate height
		$thisContent.slideToggle(this.duration, 'easeInOutQuad', function () {

			// set content aria-hidden state to opposite and remove disabled state
			$thisContent.attr('aria-hidden', !state);
			$this.attr('disabled', false);

			// focus either content or button (for keyboard users)
			if (state) {
				// focus content
				$thisContent.attr('tabindex', '-1').focus();
			} else {
				// focus button
				$this.focus();
			}

			// set scrollPos Y-axis on click (before focus) to avoid page jumping to focussed tab
			window.scrollTo(0, scrollPos);

		});
	}
};

//----------------------------------------------------------------------
//	BUSINESS MODEL
//
//----------------------------------------------------------------------

var ToggleLeadership = {

	selector: '[data-leadership]',
	isOpenedClass: 'module-leadership__text--is-opened',


	init: function () {

		ToggleLeadership.bindClickEvent();
	},

	bindClickEvent: function () {

		$(this.selector).on('click', function (e) {

			var $this = $(this);
			//console.log($this);

			$this.toggleClass(ToggleLeadership.isOpenedClass);

			e.preventDefault();
		});

	}
};

//----------------------------------------------------------------------
//	NAVIGATION
//
//----------------------------------------------------------------------

var Nav = {

	selector: document.getElementById('site-header'),
	section: '[data-section]',
	navigation: '[data-nav-primary-link]',

	classCurrent: 'nav-primary__link--is-current',
	containerHeader: '.container-header',
	classActive: 'container-header--active',

	init: function () {
		// only call for breakpoints that require nav highlighting to avoid unnecessary scroll event handler
		// otherwise remove (catch orientation changes)
		if ($(this.selector).length && window.matchMedia('only screen and (min-width: ' + '56.25em)').matches) {
			this.bindScroll();
			this.scrollEvent();
			this.addClassActive();
		} else {
			this.unbindScroll();
			this.removeScrollEvent();
		}
	},
	bindScroll: function () {
		// bind namespaced scroll event
		$(window).on('scroll.nav', function () {
			// run scroll event
			Nav.scrollEvent();
			Nav.addClassActive();
		});
	},
	unbindScroll: function () {
		// unbind namespaced scroll event
		$(window).off('scroll.nav');
	},

	// events
	scrollEvent: function () {

		// get current section through inview filter
		var $currentSection = $(inView(Nav.section, 'top', -80)),
            $navItem;

		// if filtered selection returns an element
		if (!!$currentSection) {

			// get id and matching nav element
			var currentSectionId = $currentSection.attr('id');
			$navItem = $(this.navigation + '[href="#' + currentSectionId + '"]');

			// remove class from other nav items and add current class to current section
			$(this.navigation).not(this.classCurrent).removeClass(this.classCurrent);
			$navItem.addClass(this.classCurrent);
		}
	},
	removeScrollEvent: function () {
		// remove current classes from nav link
		$(this.navigation).removeClass(this.classCurrent);
	},
	addClassActive: function () {
		var sectionOffset = 60,
			windowTop = $(window).scrollTop();

		if (windowTop >= sectionOffset) {
			$(Nav.containerHeader).addClass(Nav.classActive);
		} else {
			$(Nav.containerHeader).removeClass(Nav.classActive);
		}
	}
};

//----------------------------------------------------------------------
//	VIDEO
//	Base Package
//----------------------------------------------------------------------

var Video = {

	selector: '[data-video-src]',
	trigger: '[data-video-play]',
	currVideo: '',

	init: function () {

		if ($(this.selector).length) {
			this.assignID();
			this.bindClickEvent();
		}
	},

	assignID: function () {

		$(this.selector).each(function (i) {
			$(this).attr('id', 'video_' + i);
		});
	},

	bindClickEvent: function () {

		$(this.trigger).on('click', function () {

			var $this = $(this),
				id = $this.attr('id'),
				$player = $this.parent(),
				src = $player.data('video-src'),
				currentHeight = $($this).height(),
				currentWidth = $($this).width();

			Video.build($player, src, currentHeight, currentWidth);
			Video.pauseVideo(id);
		});
	},

	build: function (player, videoSrc, currentHeight, currentWidth) {

		// set JW API key
		jwplayer.key = 'PYLpKA9orwVIg7kW8GavqUb4rRN+p3Iu6WG1Diw9o2o=';

		// run iOS test to avoid autoplay
		var autoplayBool = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) ? false : true;

		jwplayer(player[0]).setup({
			sources: [
				{
					file: videoSrc + '.mp4',
					type: 'mp4'
				},
				{
					file: videoSrc + '.webm',
					type: 'webm'
				}
			],
			// our staging skin path:
			//skin: '/js/dist/BT-skin/btSkin.xml',
			// BT live skin path:
			skin: '/Sharesandperformance/Annualreportandreview/2015summary/js/dist/BT-skin/btSkin.xml',
			height: currentHeight,
			width: currentWidth,
			autostart: autoplayBool,
			logo: {
				hide: true
			},
			events: {
				onPlay: function () {
					var videoId = player.attr('id');
					Video.pauseVideo(videoId);
				}
			}
		});
	},

	pauseVideo: function (videoId) {

		$('.jwplayer, object').each(function () {

			// get each player id
			currentMediaId = $(this).attr('id');

			// if video is playing or buffering
			if (jwplayer(this).getState() === 'PLAYING' || jwplayer(this).getState() === 'BUFFERING') {
				if (currentMediaId !== videoId) {
					jwplayer(this).pause(true);
				}
			}
		});
	}

};

//----------------------------------------------------------------------
//	MASTER JS
//
//----------------------------------------------------------------------

//	Set client specific settings
var ClientSettings = {
	bpLap: 37.6875, // 605px
	bpDesk: 64.063 // 1025px
};

//	Set constants
var Constants = {
	root: document.documentElement
};

//	Ready and load
var Master = {

	load: function () {
		//console.log('load event');
		loadJS('//cdn.jsdelivr.net/jwplayer/6.7/jwplayer.js', Video.init());
		Carousel.init();
		Expander.init();
		Nav.init();
		OffCanvas.init();
		Links.init();
		Tabs.init();
		ToggleBusinessValue.init();
		ToggleLeadership.init();
	}
};

//	window load
Master.load();

$(window).on('resize', function () {
	Nav.addClassActive();
	Carousel.init();
	var expanderTimeout = setTimeout(function () {
		Expander.animateOuter();
		clearTimeout(expanderTimeout);
	}, 100);
});
