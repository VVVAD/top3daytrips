async function fetchData() {
    let dataId = localStorage.getItem("dataId");


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



// Function to generate a random user ID
function generateRandomUserId() {
    return Math.random().toString(36).substring(2);
}

// Function to store the image URL in the database
async function storeImageInDB(imgURL) {
    let userId = localStorage.getItem('userId');
    if (!userId) { userId = generateRandomUserId();
        localStorage.setItem('userId', userId);}

    const postData = { userId, imgURL };

    try {
        const response = await fetch(`https://top3daytrips-db.vercel.app/api/userdata/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error('Failed to store image in DB');
        }

        console.log('Image stored in DB successfully');
    } catch (error) {
        console.error('Error:', error);
    }
}
async function getImageFromDB() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return null;

        const response = await fetch(`https://top3daytrips-db.vercel.app/api/userdata/${userId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch image from DB');
        }

        const userData = await response.json();
        return userData.imgURL;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
// Update the getStatus function to store the image URL in the DB
async function getStatus(dataId) {
    const url = `https://stablehorde.net/api/v2/generate/status/${dataId}`;
    const image = await getImageFromDB();
    if (image) { setImage(image); return; }
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
        await storeImageInDB(imgURL);
        setImage(await getImageFromDB());


        // Store the image URL in the database

    } catch (error) {
        console.error('Error:', error);
    }
}

function setImage(image) {
    document.getElementById("image").src = image;
    document.getElementById("image").style.visibility = "visible";
    document.getElementById("overlay").style.visibility = "hidden";
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
