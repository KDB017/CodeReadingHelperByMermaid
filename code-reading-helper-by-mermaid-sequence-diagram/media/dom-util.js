/**
 * this script handles the rendering and interactivity of the Mermaid diagram
 */
"use strict";

/**
 * arrowElement is under textElement,so find the arrowElement from:textElement ,not found return null
 * mermaid diagram structure is like this;<text x="259" y="80" text-anchor="middle" dominant-baseline="middle" alignment-baseline="middle"
 *  class="messageText clickable" dy="1em" style="font-size: 16px; font-weight: 400;">trace(self)</text>
 * <line x1="102.5" y1="113" x2="416" y2="113" class="messageLine0" stroke-width="2" stroke="none" marker-end="url(#arrowhead)" style="fill: none;"></line>
 * continue this structure
 * @param {Element} anElement  textElement
 * @returns {Element|null}
 */
function findArrowForMessage(anElement) {
    const textElement = anElement;

    const findArrowElement = textElement.nextElementSibling;
    if (!findArrowElement) {
        return null;
    }

    const className = findArrowElement.getAttribute('class');

    if (className.includes('messageLine')) {
        return findArrowElement;
    }
    return null;

}

// function getRectangleCenterCoordinate(aRectangle){
//     const centerCoordinate = { x: aRectangle.left + aRectangle.width / 2, y: aRectangle.top + aRectangle.height / 2 };
//     return centerCoordinate;
// }

/**
 * 
 * @param {SVGElement} anArrowElement  arrowElement
 * @returns {{x: number, y: number}|null} end coordinate of arrow in arrowElement (viewport coordinate system)
 */
function getEndCoordinateOfArrowInArrowElement(anArrowElement) {
    if (!anArrowElement) { return null; }


    if (!anArrowElement) { return null; }
    const aRectangle = anArrowElement.getBoundingClientRect();
    const x1 = parseFloat(anArrowElement.getAttribute('x1') || '0');
    const x2 = parseFloat(anArrowElement.getAttribute('x2') || '0');
    const endX = (x2 >= x1) ? aRectangle.right : aRectangle.left;
    const endY = aRectangle.top + aRectangle.height / 2;
    return { x: endX, y: endY };
}

/**
 * Get participant (actor) elements from the document
 * @param {Document} aDocument 
 * @returns 
 */
function getActorElements(aDocument) {
    const roots = Array.from(aDocument.querySelectorAll('g[id^="root-"]'));
    // Filter out non-actor groups. Actor groups in Mermaid contain either a rect with class 'actor' or a text with class 'actor-box'.
    const actorRoots = roots.filter(root => {
        try {
            return !!(root.querySelector('rect.actor') || root.querySelector('rect.actor-top') || root.querySelector('text.actor-box') || root.querySelector('.actor'));
        } catch (e) {
            return false;
        }
    });
    return actorRoots;

}



/**
 * Participant name from pushed function name 
 * @param {Document} aDocument - document
 * @param  {Element} aTextElement - text element
 * @returns {string|null} participant name or null if not found
 */
export function getNearestParticipantName(aDocument, aTextElement) {
    if (!aTextElement) { return null; }
    const actorElements = getActorElements(aDocument);
    if (actorElements.length === 0) { return null; }

    const anArrowElementNearThisTextMessage = findArrowForMessage(aTextElement);
    if (!anArrowElementNearThisTextMessage) { return null; }

    const endCoordinateOfArrowInArrowElement = getEndCoordinateOfArrowInArrowElement(anArrowElementNearThisTextMessage);
    if (!endCoordinateOfArrowInArrowElement) { return null; }
    const nearActorForEndCoordinateOfArrowInArrowElement = getNearestElementForEndCoordinateOfArrowInArrowElement(actorElements, endCoordinateOfArrowInArrowElement);
    if (!nearActorForEndCoordinateOfArrowInArrowElement) { return null; }

    const participantName = getParticipantTspanClass(nearActorForEndCoordinateOfArrowInArrowElement);
    return participantName;
}

/**
 * Extract the class name (or text) from a participant element's tspan.
 * Prefers tspan whose content starts with ':' and returns its class (or trimmed text if no class).
 * @param {Element} participantElement
 * @returns {string|null}
 */
function getParticipantTspanClass(participantElement) {
    const tspans = participantElement.querySelectorAll('tspan');
    let classOrFilename = null;
    if (tspans.length === 0) {
        return classOrFilename;
    }
    // if single tspan , not exist : I think
    if (tspans.length === 1) {
        classOrFilename = tspans[0].textContent.trim();
        return classOrFilename;
    }
    const fullClassName = tspans[tspans.length - 1];
    if (!fullClassName) { return null; }
    let tspanText = fullClassName.textContent;
    tspanText=tspanText.substring(1);
    const splitedTspanText=tspanText.split('/');
    if (splitedTspanText.length>1){
        tspanText=splitedTspanText[splitedTspanText.length-1];
    }
    if (!tspanText) { return null; }
    tspanText = tspanText.trim();
    classOrFilename=tspanText;

    return classOrFilename;



}

function getNearestElementForEndCoordinateOfArrowInArrowElement(actorElements, endCoordinateOfArrowInArrowElement) {
    if (!endCoordinateOfArrowInArrowElement || actorElements.length === 0) {return null; }

    let nearestActorElement = null;
    let minDistance = Infinity;
    actorElements.forEach(actorElement => {
        const centerCoordinateOfActorElement = getParticipantCenterCoordinate(actorElement);
        const dx = centerCoordinateOfActorElement.x - endCoordinateOfArrowInArrowElement.x;
        const dy = centerCoordinateOfActorElement.y - endCoordinateOfArrowInArrowElement.y;
        const distance = dx * dx + dy * dy;
        if (distance < minDistance) {
            minDistance = distance;
            nearestActorElement = actorElement;
        }
    });
    return nearestActorElement;


}

/**
 * Get the center coordinate of a participant element
 * @param {Element} aParticipantElement 
 * @returns {{x: number, y: number}}
 */
function getParticipantCenterCoordinate(aParticipantElement) {
    const rectBound = aParticipantElement.getBoundingClientRect();
    const x = rectBound.left + rectBound.width / 2;
    const y = rectBound.top + rectBound.height / 2;
    return { x, y };
}