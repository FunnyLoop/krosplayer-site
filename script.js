const counterElement = document.getElementById('counter');
const addBtn = document.getElementById('addBtn');
const helloBtn = document.getElementById('helloBtn');

let counter = Number(localStorage.getItem('counter')) || 0;

updateCounter();

function updateCounter() {
    counterElement.textContent = counter;
    localStorage.setItem('counter', counter);
}

addBtn.addEventListener('click', () => {
    counter++;
    updateCounter();
});

helloBtn.addEventListener('click', () => {
    alert('hello world');
});