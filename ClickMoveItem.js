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
        for (var a = 0; a < selectionItem.length; a++) {
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

    numOfItem = targetGroupItem.groupItems.length;
    // alert(numOfItem);

    var tags = null;

    try {
        var compPathItem = batangDoc.compoundPathItems.getByName("setPosition");
        tags = compPathItem.tags;
    } catch (e) {
        alert("Cannot find the specified object in the '바탕' Ai file.");
        return;
    }

    try {
        var geoBoundValue = tags.getByName("geoBound").value.split(",");
        var isEqual = compPathItem.geometricBounds.length == geoBoundValue.length;
        if (tags.length > 0) {
            for (var l = 0; isEqual && l < 4; l++) {
                isEqual = compPathItem.geometricBounds[l].toString() == geoBoundValue[l];
            }
            if (!isEqual)
                rewriteToTags(compPathItem);
        }
    } catch (e) {
        // alert("Cannot find the 'geoBound' Tag in the '바탕' Item.");
        rewriteToTags(compPathItem);
    }

    // Check if the number of numOfItem reaches the number of the reference points
    if (numOfItem < (tags.length - 1)) {
        
        var height = selectionItem.geometricBounds[1] - selectionItem.geometricBounds[3];

        selectionItem.move(batangDoc.layers[0], ElementPlacement.INSIDE);
        selectionItem.move(targetGroupItem, ElementPlacement.INSIDE);

        // Move each object to the respective slot in the "바탕" Doc
        var tagValueArray = tags.getByName("P" + (numOfItem + 1)).value.split(",");
        selectionItem.position = [parseFloat(tagValueArray[0]), parseFloat(tagValueArray[1]) + height];

        // numOfItem = targetGroupItem.groupItems.length;
        // alert(numOfItem + " objects moved to the '바탕' layer");
    } else {
        alert("All objects have already been moved to the '바탕' layer")
    }
}


// Add the reference points (bottom left point) of each slot in the '바탕' Doc's layer as tags.
function rewriteToTags(compPathItem) {
    var pathItems = compPathItem.pathItems;
    var tags = compPathItem.tags;

    var geoBoundTag = tags.add();
    geoBoundTag.name = "geoBound";
    geoBoundTag.value = compPathItem.geometricBounds.toString();
    
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

    for (var p = yPosition.length - 2; p > -1; p -= 2) {
        for (var q = 0; q < xPosition.length; q += 2) {
            var newTag = tags.add();
            newTag.name = "P" + (Math.floor((yPosition.length - 2 - p) * xPosition.length / 4) + Math.floor(q / 2) + 1);
            newTag.value = [xPosition[q], yPosition[p]].toString();
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
