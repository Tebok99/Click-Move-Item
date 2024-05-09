// clickMoveItem();

function clickMoveItem() {
    var doc = app.activeDocument;

    // Open the "풀린디지탈.ai" file and prepare for work
    try {
        var batangDoc = app.documents.getByName("풀린디지탈.ai");
    } catch (e) {
        alert("open a file of '풀린디지탈.ai'");
        return;
    }

    var selectionItem = doc.selection;
    var targetGroupItem = null;
    var numOfItem = 0; // Number of items under the "바탕" GroupItem (maximum 12)

    if (selectionItem.length < 1) {
        alert("Please select 1 card group.");
        return;
    } else if (selectionItem.length > 1) {
        var groupItem = doc.groupItems.add();
        for (var a = 0; selectionItem.length; a++) {
            selectionItem[a].move(groupItem, ElementPlacement.INSIDE);
        }
        doc.selection = null;
        groupItem.selected = true;
        selectionItem = groupItem;
    } else {
        selectionItem = doc.selection[0];
    }

    // Create a new GroupItem in the "바탕" Doc to move the selected Item to
    try {
        targetGroupItem = batangDoc.groupItems["movedItems"];
    } catch (e) {
        targetGroupItem = batangDoc.layers[0].groupItems.add();
        targetGroupItem.name = "movedItems";
    }

    // Check if the number of numOfItem reaches 12
    numOfItem = targetGroupItem.groupItems.length;
    // alert(numOfItem);

    if (numOfItem < 12) {
        var aBound = new Array();
        getPositions(batangDoc, aBound); // Avoid repetition by referring to an external file
        if (aBound == null) return;

        var height = selectionItem.geometricBounds[1] - selectionItem.geometricBounds[3];

        selectionItem.move(batangDoc.layers[0], ElementPlacement.INSIDE);
        selectionItem.move(targetGroupItem, ElementPlacement.INSIDE);

        // Move each object to the respective slot in the "바탕" Doc
        selectionItem.position = [aBound[numOfItem][0], aBound[numOfItem][1] + height];

        numOfItem = targetGroupItem.groupItems.length;
        // alert(numOfItem + " objects moved to the '바탕' layer");
    } else {
        alert("All 12 objects have already been moved to the '바탕' layer")
    }
}


// Get the reference points (lower left corners) of each slot in the "바탕" Doc's layer
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

function contains(array, value) {
    for (var z = 0; z < array.length; z++) {
        if (array[z] === value) {
            return true;
        }
    }
    return false;
}

function comparefn(a, b) {
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    return a - b;
}