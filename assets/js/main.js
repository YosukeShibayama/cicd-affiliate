const message = document.querySelector("#message");
const button = document.querySelector("#changeMessageButton");

const messages = [
  "Hello Youtube",
  "Hello, World!",
  "GitHub Pages ready!"
];

let currentIndex = 0;

function showMessage() {
  message.textContent = messages[currentIndex];
}

button.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % messages.length;
  showMessage();
});

showMessage();
