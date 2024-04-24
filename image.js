async function fetchData() {
    let dataId = localStorage.getItem("dataId");

    try {
        const response = await fetch('https://top3daytrips-ff0soenqy-vvvads-projects.vercel.app/api/userData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData: '123' }) // Replace 'NEW_ID_HERE' with the actual new ID
        });

        if (response.ok) {
            console.log('New ID stored successfully in MongoDB');
        } else {
            console.error('Failed to store new ID in MongoDB');
        }
    } catch (error) {
        console.error('Error storing new ID:', error);
    }


    if (!dataId) { }
    else { checkStatus(dataId); return; } // If dataId is not found in local storage, exit function

    const url = 'https://stablehorde.net/api/v2/generate/async';
    const apiKey = '0000000000';
    var selectedCountry = localStorage.getItem('selectedCountry');
    document.getElementById("image").src = "";
    document.getElementById("image").style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "visible";
    const params = {
        prompt: selectedCountry,
        params: {
            cfg_scale: 7.5,
            denoising_strength: 0.75,
            seed: '312912',
            height: 512,
            width: 512,
            seed_variation: 1,
            steps: 10
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey,
                'Client-Agent': 'unknown:0:unknown'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log(data); // Handle the response data here
        const id = data.id;
        localStorage.setItem("dataId", data.id);
        checkStatus(id);
    } catch (error) {
        console.error('Error:', error);
    }
}



async function getStatus(dataId) {
    const url = `https://stablehorde.net/api/v2/generate/status/${dataId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Client-Agent': 'unknown:0:unknown',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch status');
        }

        const data = await response.json();
        console.log(data); // Handle the response data here

        const imgURL = data.generations[0].img;
        document.getElementById("image").src = imgURL;
        document.getElementById("image").style.visibility = "visible";
        document.getElementById("overlay").style.visibility = "hidden";
    } catch (error) {
        console.error('Error:', error);
    }
}

async function checkStatus(dataId) {
    let id = localStorage.getItem("dataId");
    if (id != dataId) return;
    const url = `https://stablehorde.net/api/v2/generate/check/${dataId}`;


    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Client-Agent': 'unknown:0:unknown',

            }
        });

        if (!response.ok) {
            throw new Error('Failed to check status');
        }

        const data = await response.json();
        console.log(data); // Handle the response data here
        // Check if the generation is done
        if (data.done) {
            // If generation is done, call getStatus function to retrieve image URL
            getStatus(dataId);
        } else {
            document.getElementById("overlay-text").innerHTML = "queue_position: " + data.queue_position;
            // If generation is not done, wait and check again after a certain interval
            setTimeout(() => checkStatus(dataId), 5000); // Check again after 5 seconds (adjust interval as needed)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchData();
