function loadTeaData() {
  fetch(opensheet_uri)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Google Sheets response:", data);

      if (!Array.isArray(data)) {
        throw new Error("Expected an array of tea records.");
      }

      teaData = data.filter(row => row.name && row.name.trim());

      teaData.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      console.log(`Loaded ${teaData.length} teas`);
      populateTeaSelect();
    })
    .catch(err => {
      console.error("Sheet load error:", err);
      if (teaSelect) {
        teaSelect.innerHTML = `<option value="">Sheet load error</option>`;
      }
    });
}
