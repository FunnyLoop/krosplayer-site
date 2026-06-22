const API_URL =
    "https://script.google.com/macros/s/AKfycbxLn2jwcYIEHoCL-V6yACYEAanbcQ9ommvYzCEkARKhwwZ9sMCuwDT0ymXoGBy1hNC0/exec";

const tbody = document.getElementById("tableBody");

const loader = document.getElementById("loader");

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

export async function loadData(sheetName) {

    tbody.innerHTML = "";

    showLoader();
    const response = await fetch(`${API_URL}?sheet=${sheetName}`);
    const participants = await response.json();
    hideLoader();

    return participants;
}

export async function addData(data,sheetName) {

    // console.log("POST envoyé", data);

    showLoader();
    const  resp = await fetch(`${API_URL}?sheet=${sheetName}`, {
        method: "POST",
        body: JSON.stringify(data)
    });

    hideLoader();
}

export async function deleteData(data, sheetName) {

    // console.log("DELETE envoyé", data);

    showLoader();
    const  resp = await fetch(`${API_URL}?sheet=${sheetName}&action=delete`, {
        method: "POST",
        body: JSON.stringify(data)
    });

    return  await loadData(sheetName);
}




