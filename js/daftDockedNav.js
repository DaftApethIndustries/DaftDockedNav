/*jslint evil: false, jquery:true, forin: true, white: false, devel:true */
/*!
 * Daft Docked Nav plugin
 * Author: ryanand26 (2012) (http://www.daftapeth.co.uk)
 * @version 0.2
**/

(function (window, $, undefined) {
	"use strict";

	$.fn.daftDockedNav = function (options) {

		var defaults = {
				itemSelector: '.docking-nav',
				cloneClass: 'dockedClone',
				cloneVisibleClass: 'is-visible',
				appendTarget: 'body',
				pixelsGrace: 0,
				usePixelsGrace : false
			},
			eventHandlersBound = false,
			scrollCallbackArray = [],
			resizeCallbackArray = [];

		/**
		* Create a new DockedItem
		*/
		function init(element, options) {

			//we only need one scroll handler
			if (eventHandlersBound === false) {

				$(window)
					.on('scroll', scrollHandler)
					.resize(resizeHandler);

				eventHandlersBound = true;
			}

			return new DockingItem($(element), options);
		}


		/**
		* Handle scroll events
		* https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollX
		*/
		function scrollHandler(event) {
			var i, iLen,
				d = document,
				w = window,
				scrollTop = (w.pageYOffset !== undefined) ? w.pageYOffset : (d.documentElement || d.body.parentNode || d.body).scrollTop;

			for (i = 0, iLen = scrollCallbackArray.length; i < iLen; i += 1) {
				scrollCallbackArray[i](scrollTop);
			}
		}

		/**
		* Handle resize events
		*/
		function resizeHandler(event) {
			var i, iLen;

			for (i = 0, iLen = resizeCallbackArray.length; i < iLen; i += 1) {
				resizeCallbackArray[i]();
			}
		}

		/**
		* Object definition
		*/
		var DockingItem = function (element, options) {
			var instance = this;

			this.settings = $.extend({}, defaults, options);
			this.element = $(element);

			this.createClone(this.element);

			this.updatePixelsGrace().updatePosition();

			scrollCallbackArray.push(function (scrollTop) {
				instance.onScroll(scrollTop);
			});

			resizeCallbackArray.push(function () {
				instance.updatePixelsGrace().updatePosition();
			});

			return this;
		};

		DockingItem.prototype = {
			settings : null,
			element : null,
			elementClone : null,
			top : null,
			bottom : null,
			isFixed : false,

			createClone: function ($element) {
				var clone = $element.clone();

				clone
					.addClass(this.settings.cloneClass)
					.appendTo(this.settings.appendTarget);

				this.elementClone = clone;

				return this;
			},

			/**
			* Update the pixels grace value based upon the size of the window
			*/
			updatePixelsGrace: function () {
				var screenHeight;

				if (this.settings.usePixelsGrace === true) {
					screenHeight = $(window).height();

					this.settings.pixelsGrace = screenHeight / 4;
				}

				return this;
			},
			
			/**
			* Update the values used for position calculations
			*/
			updatePosition: function () {
				var offset = this.element.offset();

				this.top = offset.top;
				this.bottom = offset.top + this.element.outerHeight() + this.settings.pixelsGrace;

				//update clone position
				this.elementClone.css({
					'left' : offset.left,
					'right' : 'auto',
					'width': this.element.outerWidth()
				});

				return this;
			},

			/**
			* OnScroll handler
			*/
			onScroll: function (scrollTop) {
				//if the original is out of view
				if (scrollTop >= this.bottom) {
					this.fixPosition(true);
				}
				else {
					this.fixPosition(false);
				}
				return this;
			},
			/**
			* Set position, if not already set
			*/
			fixPosition: function (setFixed) {
				var classValue = this.settings.cloneVisibleClass;

				if (setFixed === true && this.isFixed === false) {
					this.isFixed = true;
					this.elementClone.addClass(classValue);
				}
				else if (setFixed === false && this.isFixed === true) {
					this.isFixed = false;
					this.elementClone.removeClass(classValue);
				}
				return this;
			}
		};

		return this.each(function () {
			init(this, options);
		});
	};

})(window, jQuery);
