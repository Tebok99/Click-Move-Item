clickMoveItems();

/**
 * Moves selected items to another Adobe Illustrator document.
 * If the target document ("풀린디지탈.ai") is not open, it prompts to open it.
 * Only moves up to 12 items to maintain a certain layout structure.
 */
function clickMoveItems() {
    var doc = app.activeDocument;

    try {
        // Open the target document
        var targetDoc = app.documents.getByName("풀린디지탈.ai");
    } catch (e) {
        alert("Please open a file named '풀린디지탈.ai'");
        return;
    }

    var selectionItem = doc.selection;
    var targetGroupItem = null;
    var numOfItem = 0; // Number of items under the target GroupItem (maximum 12)

    if (selectionItem.length < 1) {
        alert("Please select at least one business card (up to 12).");
        return;
    } else {
        // If each item in selItem is not grouped, the script might not function correctly as it relies on moving each item as a single unit.
        try {
            // Create a new GroupItem to move selected items into
            targetGroupItem = targetDoc.groupItems["movedItems"];
        } catch (e) {
            // If the GroupItem does not exist, create a new one
            targetGroupItem = targetDoc.groupItems.add();
            targetGroupItem.name = "movedItems";
        }

        // Check if the number of items has reached 12
        numOfItem = targetGroupItem.groupItems.length;
        if (numOfItem < 12) {
            var aBound = new Array();
            getPositions(targetDoc, aBound); // Avoid repetition by referring to an external file
            if (aBound == null) return;

            // Move selected items to the target document and adjust positions
            var count = (selectionItem.length >= 12 - numOfItem) ? 12 - numOfItem : selectionItem.length;
            for (var a = 0; a < count; a++) {
                var height = selectionItem[a].geometricBounds[1] - selectionItem[a].geometricBounds[3];

                selectionItem[a].move(targetDoc.layers[0], ElementPlacement.INSIDE);
                selectionItem[a].move(targetGroupItem, ElementPlacement.INSIDE);

                // Adjust positions in the target document
                selectionItem[a].position = [aBound[numOfItem + a][0], aBound[numOfItem + a][1] + height];
            }

            numOfItem = targetGroupItem.groupItems.length;
            alert("Moved " + numOfItem + " items to the target layer.");
        } else {
            alert("The target layer already contains 12 items.");
        }
    }
}

/**
 * Gets the positions of slots on the target document's layer.
 * Slots are determined by the compound paths' boundaries.
 */
function getPositions(doc, aBound) {
    var pathItems = null;

    try {
        var compPathItem = doc.compoundPathItems.getByName("setPosition");
        pathItems = compPathItem.pathItems;
    } catch (e) {
        alert("Cannot find the specified object in the '바탕' Ai file");
        aBound = null;
    }

    var xPosition = new Array();
    var yPosition = new Array();

    for (var m = 0; m < pathItems.length; m++) {
        if (pathItems[m].width == 0 && !contains(xPosition, pathItems[m].position[0])) {
            xPosition.push(pathItems[m].position[0]);
        } else if (pathItems[m].height == 0 && !contains(yPosition, pathItems[m].position[1])) {
            yPosition.push(pathItems[m].position[1]);
        }
    }
    xPosition.sort(comparefn);
    yPosition.sort(comparefn);

    var xBound = new Array();
    var yBound = new Array();

    for (var n = 0; n < xPosition.length; n += 2) {
        xBound.push(xPosition[n]);
    }
    for (var o = yPosition.length - 2; o > -1; o -= 2) {
        yBound.push(yPosition[o]);
    }
    for (var p = 0; p < yBound.length; p++) {
        for (var q = 0; q < xBound.length; q++) {
            aBound.push([xBound[q], yBound[p]]);
        }
    }
}

/**
 * Checks if an array contains a specific value.
 */
function contains(array, value) {
    for (var z = 0; z < array.length; z++) {
        if (array[z] === value) {
            return true;
        }
    }
    return false;
}

/**
 * Comparison function for sorting arrays.
 */
function comparefn(a, b) {
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    return a - b;
}