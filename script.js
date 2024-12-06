document.getElementById('inventory-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get values from input fields
    const itemName = document.getElementById('item-name').value;
    const itemQuantity = document.getElementById('item-quantity').value;
    const itemLocation = document.getElementById('item-location').value;

    // Create a new row in the inventory table
    const table = document.getElementById('inventory-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    // Insert cells
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    // Add values to cells
    cell1.textContent = itemName;
    cell2.textContent = itemQuantity;
    cell3.textContent = itemLocation;
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
        table.deleteRow(newRow.rowIndex - 1); // Adjust for header row
    };
    cell4.appendChild(deleteButton);

    // Clear input fields
    document.getElementById('inventory-form').reset();
});
