const { response } = require("express");

"use strict";
const log = console.log;
// onload event listener
window.addEventListener("DOMContentLoaded", initializePage);

function initializePage() {
    fetch("/api/patchnote", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        redirect: "follow"
    }).then(response => {
        if (!response.ok) { // server sending non-200 codes
            log("Error status:", response.status);
            insertNote({ title: "Sorry", content: "Due to a server related issue, the patchnotes are not available right now." });
        } else {
            return response.json();
        }
    }).then(patchNotes => {
        const patchName = document.getElementById("patchname");
        patchName.innerText = `Patch ${patchName} Notes`;
        let i = 0;
        patchNotes.notes.forEach(note => {
            i++,
            insertNote(note, i);
        });
    }).catch(err => {
        log(err);
        insertNote({ title: "Sorry", content: "Due to a server related issue, the patchnotes are not available right now." });
    });
}

/**
 *  insert one patchnote to the page
 * @param {Object} note object containing title and content of the note to insert
 */
function insertNote(note, number) {
    const container = document.querySelector("patchnote_container");
    const menubar = document.querySelector("menubar_container");
    const noteWrapper = document.createElement("div");
    noteWrapper.classList.add("note");
    container.appendChild(noteWrapper);
    const title = document.createElement("p");
    title.id = `title${number}`;
    title.innerText = note.title;
    noteWrapper.appendChild(title);
    const content = document.createElement("p");
    content.innerText = note.content;
    noteWrapper.appendChild(content);
    const shortcut = document.createElement("a");
    shortcut.innerText = note.title;
    shortcut.href = `#title${number}`;
    menubar.appendChild(shortcut);
}