document.getElementById('question-submission').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission

    const question = document.getElementById('question-input').value;

    document.getElementById('response-placeholder').classList.add("animate");

    fetch('/sendToOpenAI', { // Adjust the URL as needed
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
    	document.getElementById('response-placeholder').classList.add("hidden");
    	document.getElementById('response-output').classList.remove("hidden");
        document.getElementById('response-output').textContent = data.choices[0].message.content;
    })
    .catch((error) => {
        console.error('Fetch Error:', error);
        document.getElementById('response-output').textContent = 'Error: Could not get a response';
    });
});