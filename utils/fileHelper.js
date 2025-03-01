const { dialog } = require("electron");
const fs = require("fs");
const path = require("path");

async function selectImage() {
    const result = await dialog.showOpenDialog({
        title: "Select an Image",
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "png", "jpeg"] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
        console.log("No file selected.");
        return null;
    }

    return result.filePaths[0]; // Return selected image path
}

module.exports = { selectImage };
