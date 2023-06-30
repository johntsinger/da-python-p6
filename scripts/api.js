const url = "http://127.0.0.1:8000/api/v1/titles/"

function getBestMovie() {
    axios.get(url + "?sort_by=-imdb_score")
        .then(response => response["data"]["results"][0])
        .then(data => {
            document.getElementsByClassName("best-movie--cover")[0].getElementsByTagName("img")[0]
                .src = data["image_url"];
            document.getElementById("best-movie-title")
                .innerHTML = data["title"];
            getDescription(data["url"]);
            document.getElementsByClassName("btn")[1]
                .setAttribute("onclick", `openModal("${data["id"]}")`); // template literals
        })
        .catch((err) => console.log(err.message));
}

function getDescription(url) {
    axios.get(url)
        .then(response => response["data"])
        .then(data => {
            document.getElementById("best-movie-description")
                .innerHTML = data["description"];
        })
        .catch((err) => console.log(err.message));
}

function getModalData(id) {
    axios.get(url + id)
        .then(response => response["data"])
        .then(data => {
            document.getElementById("title")
                .innerHTML = data["title"];
            document.getElementById("year")
                .innerHTML = " (" + data["year"] + ")";
            document.getElementById("image-url")
                .src = data["image_url"];
            document.getElementById("duration")
                .innerHTML = data["duration"] + " min";
            document.getElementById("countries")
                .innerHTML = data["countries"].join(", ");
            document.getElementById("genres")
                .innerHTML = data["genres"].join(", ");
            document.getElementById("rated")
                .innerHTML = data["rated"];
            document.getElementById("imdb-score")
                .innerHTML = "IMDb score : " + data["imdb_score"];
            document.getElementById("directors")
                .innerHTML = "Directed by : " + data["directors"].join(", ");
            document.getElementById("actors")
                .innerHTML = "Casting : " + data["actors"].join(", ");
            if (data["worldwide_gross_income"] == null) {
                document.getElementById("box-office")
                    .innerHTML = "Box office : " + "N/A";
            } else {
                document.getElementById("box-office")
                    .innerHTML = "Box office : " + data["worldwide_gross_income"];
            }
            document.getElementById("plot")
                .innerHTML = data["long_description"];
        });

}

function openModal(id) {
    let modal = document.getElementById("myModal");
    let span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    getModalData(id);

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function getMoviesByCategory(categorie) {
    
}

getBestMovie()