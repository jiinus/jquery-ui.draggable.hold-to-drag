/*!
 * jQuery UI Draggable Hold To Drag 0.1
 *
 * Copyright 2015, Joonas Mankki
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * If mouse is moved beyond <code>distance</code> before <code>delay</code> has passed, issue scrolling.
 * This enables draggable items inside an <code>overflow:scroll</code> -container. Scrolling is started
 * immediately on <code>touchstart</code> but if mouse has not moved beyond <code>distance</code> during
 * <code>delay</code>, dragging is initiated and scrolling is canceled.
 *
 * Include this script AFTER jQuery UI Touch Punch
 *
 * Requires:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 *  jquery.ui.draggable.js
 *  jquery.ui.touch-punch.js
 */
(function ($) {

	// Ignore browsers without touch support
	if (!$.support.touch) return;

	var mouseProto = $.ui.mouse.prototype,
		super = {
			'_touchStart'	: mouseProto._touchStart,
			'_touchMove'	: mouseProto._touchMove,
			'_touchEnd'		: mouseProto._touchEnd,
		}

	makeMouseEvent = function(touchevent, eventtype) {
		var touch = touchevent.originalEvent.changedTouches[0];
		var ev = document.createEvent('MouseEvents');
		ev.initMouseEvent(
			eventtype,
			true, // bubbles
			true, // cancelable
			window, // view
			1, // detail
			touch.screenX, // screenX
			touch.screenY, // screenY
			touch.clientX, // clientX
			touch.clientY, // clientY
			false, // ctrlKey
			false, // altKey
			false, // shiftKey
			false, // metaKey
			0, // button
			null // relatedTarget
		);
		return ev;
	}

	mouseProto._touchStart = function(event) {

		var self = this;

		// If delay is not defined, just execute and return superclass function
		if (!self.options.delay) {
			return super._touchStart.call(self, event);
		}

		self._mouseDownEvent = makeMouseEvent(event, 'mousedown');
		self._mouseMoveEvent = makeMouseEvent(event, 'mousemove');

		/**
		 * When delayTimer closes and operation has not yet started, if mouseDistance
		 * is NOT met, start normal operation by calling mouseMove. This means that the
		 * user held the mouse still for required amount of time to initiate dragging.
		 */
		self._touchScrollPatchMouseDelayTimer = setTimeout(function() {

			// Reset timer handle
			self._touchScrollPatchMouseDelayTimer = null;

			// During delay, if mouse has moved out of distance, do nothing.
			var _mouseDistanceMet = self._mouseDistanceMet(self._mouseMoveEvent || self._mouseDownEvent);
			if (_mouseDistanceMet) {
				return;
			}

			// Otherwise if mouse has not yet started, force mouseStart
			if (!self._mouseStarted) {

				// Temporary zero-out delay and distance to force dragging to start immediately
				var _delay = self.options.delay;
				var _distance = self.options.distance;

				self.options.delay = 0;
				self.options.distance = 0;

				// Call touchStart on superclass to trigger mouseStart
				super._touchStart.call(self, event);

				self.options.delay = _delay;
				self.options.distance = _distance;
			}

		}, self.options.delay);
		
		return true;
	}

	mouseProto._touchMove = function(event) {

		var self = this;

		// If mouse operation has started (or no delay), execute and return the default superclass function
		if (self._mouseStarted || !self.options.delay) {
			return super._touchMove.call(self, event);
		}

		self._mouseMoveEvent = makeMouseEvent(event, 'mousemove');

		// If the delay has not timed out yet => perform scroll
		if (!self._mouseDelayMet(event)) {

			// If ALSO the distance is met, turn dragging explicitly off
			if (self._mouseDistanceMet(self._mouseMoveEvent)) {

				if (self._touchScrollPatchMouseDelayTimer) {
					clearTimeout(self._touchScrollPatchMouseDelayTimer);
				}

				$(document)
					.unbind("mousemove." + self.widgetName, self._mouseMoveDelegate)
					.unbind("mouseup." + self.widgetName, self._mouseUpDelegate);
			}

			return true;
		}
	}

	mouseProto._touchEnd = function(event) {

		var self = this;

		if (self._touchScrollPatchMouseDelayTimer) {
			clearTimeout(self._touchScrollPatchMouseDelayTimer);
		}

		return super._touchEnd.call(self, event);
	}

})(jQuery);