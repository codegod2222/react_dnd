/* eslint
   no-mixed-operators: off
*/
import { isSafari, isFirefox } from './BrowserDetector';
import MonotonicInterpolant from './MonotonicInterpolant';

const ELEMENT_NODE = 1;

export function getNodeClientOffset(node) {
  const el = node.nodeType === ELEMENT_NODE ?
    node :
    node.parentElement;

  if (!el) {
    return null;
  }

  const { top, left } = el.getBoundingClientRect();
  return { x: left, y: top };
}

export function getEventClientOffset(e) {
  return {
    x: e.clientX,
    y: e.clientY,
  };
}

export function getDragPreviewOffset(
  sourceNode,
  dragPreview,
  clientOffset,
  anchorPoint,
  offsetPoint,
  ) {
  // The browsers will use the image intrinsic size under different conditions.
  // Firefox only cares if it's an image, but WebKit also wants it to be detached.
  const isImage = dragPreview.nodeName === 'IMG' && (
    isFirefox() ||
    !document.documentElement.contains(dragPreview)
  );
  const dragPreviewNode = isImage ? sourceNode : dragPreview;

  const dragPreviewNodeOffsetFromClient = getNodeClientOffset(dragPreviewNode);
  const offsetFromDragPreview = {
    x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
    y: clientOffset.y - dragPreviewNodeOffsetFromClient.y,
  };

  const { offsetWidth: sourceWidth, offsetHeight: sourceHeight } = sourceNode;
  const { anchorX, anchorY } = anchorPoint;

  let dragPreviewWidth = isImage ? dragPreview.width : sourceWidth;
  let dragPreviewHeight = isImage ? dragPreview.height : sourceHeight;

  // Work around @2x coordinate discrepancies in browsers
  if (isSafari() && isImage) {
    dragPreviewHeight /= window.devicePixelRatio;
    dragPreviewWidth /= window.devicePixelRatio;
  }

  // Interpolate coordinates depending on anchor point
  // If you know a simpler way to do this, let me know
  const interpolantX = new MonotonicInterpolant([0, 0.5, 1], [
    // Dock to the left
    offsetFromDragPreview.x,
    // Align at the center
    (offsetFromDragPreview.x / sourceWidth) * dragPreviewWidth,
    // Dock to the right
    offsetFromDragPreview.x + dragPreviewWidth - sourceWidth,
  ]);
  const interpolantY = new MonotonicInterpolant([0, 0.5, 1], [
    // Dock to the top
    offsetFromDragPreview.y,
    // Align at the center
    (offsetFromDragPreview.y / sourceHeight) * dragPreviewHeight,
    // Dock to the bottom
    offsetFromDragPreview.y + dragPreviewHeight - sourceHeight,
  ]);
  let x = interpolantX.interpolate(anchorX);
  let y = interpolantY.interpolate(anchorY);

  // Work around Safari 8 positioning bug
  if (isSafari() && isImage) {
    // We'll have to wait for @3x to see if this is entirely correct
    y += (window.devicePixelRatio - 1) * dragPreviewHeight;
  }

  // Force offsets if specified in the options.
  const { offsetX, offsetY } = offsetPoint;
  const forceOffsetX = offsetX === 0 || offsetX;
  const forceOffsetY = offsetY === 0 || offsetY;
  x = forceOffsetX ? offsetX : x;
  y = forceOffsetY ? offsetY : y;

  return { x, y };
}
