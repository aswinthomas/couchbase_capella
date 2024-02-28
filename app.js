// Handle form submission for adding/updating an item
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const itemId = document.getElementById('itemId').value;
    const itemName = document.getElementById('itemName').value;
    const itemQuantity = document.getElementById('itemQuantity').value;
    const itemDescription = document.getElementById('itemDescription').value;

    // Send data to the backend using fetch
    fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: itemId,
            name: itemName,
            quantity: itemQuantity,
            description: itemDescription
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        fetchItems(); // Refresh the items list after adding/updating
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    // Clear form fields
    document.getElementById('itemId').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemDescription').value = '';
});

// Fetch and display inventory items
function fetchItems() {
    fetch('http://localhost:3000/api/items')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = ''; // Clear existing items

        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `ID: ${item.id}, Name: ${item.items.name}, Quantity: ${item.items.quantity}, <br>Description: ${item.items.description}`;
                itemsList.appendChild(listItem);
            });
        } else {
            // Display a message when there are no items
            const noItemsMessage = document.createElement('li');
            noItemsMessage.textContent = 'No items found.';
            itemsList.appendChild(noItemsMessage);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

