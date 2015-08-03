# jquery-ui.draggable.touch-scroll-patch
Simple adjustment to allow object dragging out of a scrollable container on touch-enabled devices.

Adjust functionality with delay and distance -parameters of the draggable. If mouse has not moved beyond the distance until delay timeout, dragging is initiated. Otherwise the event is bubbled to the scrollable container and dragging is canceled.

Requires:
* jquery.ui.widget.js
* jquery.ui.mouse.js
* jquery.ui.draggable.js
* jquery.ui.touch-punch.js
