document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("dark-mode"); // Enable dark mode by default
  displayMyList();

  document.getElementById("printList").addEventListener("click", () => {
    window.print();
  });

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.textContent = "🌞"; // Set the initial icon for dark mode
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
    });
  }

  // Add event listener for Remove All button
  const removeAllBtn = document.querySelector(".remove-all-btn");
  if (removeAllBtn) {
    removeAllBtn.addEventListener("click", () => {
      localStorage.removeItem("myList");
      displayMyList();
    });
  }
});

function parseTSV(data) {
  const lines = data.split('\n');
  const headers = lines[0].split('\t');
  const powers = lines.slice(1).map(line => {
    const values = line.split('\t');
    const power = {};
    headers.forEach((header, index) => {
      power[header] = values[index];
    });
    return power;
  });
  return powers;
}

function fetchPowersData() {
  return fetch('data.tsv')
    .then(response => response.text())
    .then(data => parseTSV(data));
}

function displayMyList() {
  const myList = JSON.parse(localStorage.getItem("myList")) || [];
  const container = document.getElementById("myList-container");
  container.innerHTML = '';

  // Add Remove All Button
  const removeAllBtn = document.querySelector(".remove-all-btn");
  if (myList.length === 0) {
    container.innerHTML = "<p>Your list is empty.</p>";
    if (removeAllBtn) removeAllBtn.style.display = "none";
    return;
  } else {
    if (removeAllBtn) removeAllBtn.style.display = "block";
  }

  fetchPowersData().then(powersData => {
    myList.sort((a, b) => a.powerName.localeCompare(b.powerName));

    myList.forEach((power, index) => {
      const powerData = powersData.find(p => p.Power === power.powerName);
      const card = document.createElement("div");
      card.className = "card printer-friendly";

      const title = document.createElement("h3");
      title.textContent = power.powerName;
      card.appendChild(title);

      const flavorText = document.createElement("p");
      flavorText.textContent = power.flavorText;
      flavorText.className = "flavor-text";
      card.appendChild(flavorText);

      const powerset = document.createElement("p");
      powerset.textContent = `Power Set: ${power.powerset}`;
      card.appendChild(powerset);

      const rank = document.createElement("p");
      rank.textContent = `Rank: ${power.rank}`;
      card.appendChild(rank);

      // Display all details from TSV
      if (powerData) {
        Object.entries(powerData).forEach(([key, value]) => {
          if (key !== "Power" && value) {
            const detail = document.createElement("p");
            detail.textContent = `${key}: ${value}`;
            card.appendChild(detail);
          }
        });
      }

      // Add hover event listener to update sidebar
      card.addEventListener("mouseover", () => {
        const sidebarContent = document.getElementById("sidebar-content");
        sidebarContent.innerHTML = `
          <h3>${power.powerName}</h3>
          <p><strong>Flavor Text:</strong> ${power.flavorText}</p>
          <p><strong>Power Set:</strong> ${power.powerset}</p>
          <p><strong>Rank:</strong> ${power.rank}</p>
          ${powerData ? Object.entries(powerData).map(([key, value]) => key !== "Power" && value ? `<p><strong>${key}:</strong> ${value}</p>` : '').join('') : ''}
        `;
      });

      // Remove Button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "remove-btn";
      removeBtn.addEventListener("click", () => {
        removeFromList(power.powerName);
      });
      card.appendChild(removeBtn);
      card.insertBefore(removeBtn, card.firstChild); // Move the remove button to the top

      container.appendChild(card);
    });
  });
}

function removeFromList(powerName) {
  let myList = JSON.parse(localStorage.getItem("myList")) || [];
  myList = myList.filter(item => item.powerName !== powerName);
  localStorage.setItem("myList", JSON.stringify(myList));
  displayMyList();
}

// Add CSS for printer-friendly format and buttons
const style = document.createElement('style');
style.textContent = `
  @media print {
    body {
      background: white;
      color: black;
      font-size: 10pt;
    }

    header, .navigation, .dark-mode-toggle, .print-btn {
      display: none;
    }

    .cards-container {
      display: block;
    }

    .card {
      page-break-inside: avoid;
      border: 1px solid #000;
      padding: 10px;
      margin-bottom: 10px;
      font-size: 10pt;
      width: calc(100% - 40px); /* Adjust width to fit within page margins */
      height: auto;
      overflow: visible;
      margin-left: auto;
      margin-right: auto;
      position: relative; /* Ensure positioning for the remove button */
    }

    .card h3, .card p {
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }

    .remove-btn {
      display: none;
    }
  }

  .card .remove-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
  }

  .card .remove-btn:hover {
    background-color: #ff1a1a;
  }

  .remove-all-btn {
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    margin: 10px 0;
  }

  .remove-all-btn:hover {
    background-color: #ff1a1a;
  }

  .print-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    margin: 10px 0;
  }

  .print-btn:hover {
    background-color: #45a049;
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 10px 0;
  }
`;
document.head.appendChild(style);
