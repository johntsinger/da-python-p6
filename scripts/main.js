const url = "http://127.0.0.1:8000/api/v1/titles/";

class Carousel {
    constructor (element, options = {}) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            loop: false
        }, options)
        let children = [].slice.call(element.children)
        this.isMobile = false
        this.currentItem = 0
        this.moveCallbacks = []

        // DOM modification
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map((child) => {
            let item = this.createDivWithClass('carousel__item')
            item.appendChild(child)
            this.container.appendChild(item)
            return item
        })
        this.setStyle()
        this.createNavigation()

        // Events
        this.moveCallbacks.forEach(callback => callback(0))
        this.onWindowResize()
        window.addEventListener('resize', this.onWindowResize.bind(this))

    }

    setStyle() {
        let ratio = this.items.length / this.slidesVisible
        this.container.style.width = (ratio * 100) + "%"
        this.items.forEach(item => item.style.width = (100 / this.slidesVisible) / ratio + '%')
    }

    createNavigation () {
        let nextButton = this.createDivWithClass('carousel__next')
        let prevButton = this.createDivWithClass('carousel__prev')
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))
        if (this.options.loop === true) {
            return
        }
        this.onMove(index => {
            if (index === 0) {
                prevButton.classList.add('carousel__prev--hidden')
            } else {
                prevButton.classList.remove('carousel__prev--hidden')
            }

            if (this.items[this.currentItem + this.slidesVisible] === undefined) {
                nextButton.classList.add('carousel__next--hidden')
            } else {
                nextButton.classList.remove('carousel__next--hidden')
            }
        })
    }

    next () {
        this.gotoItem(this.currentItem + this.slidesToScroll)
    }

    prev () {
        this.gotoItem(this.currentItem - this.slidesToScroll)
    }

    gotoItem(index) {
        if (index < 0) {
            index = this.items.length - this.slidesVisible
        } else if (index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && index > this.currentItem)) {
            index = 0
        }
        let translateX = index * -100 / this.items.length
        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)'
        this.currentItem = index
        this.moveCallbacks.forEach(callback => callback(index))
    }

    onMove(callback) {
        this.moveCallbacks.push(callback)
    }

    onWindowResize() {
        let mobile = window.innerWidth < 800
        if (mobile !== this.isMobile) {
            this.isMobile = mobile
            this.setStyle()
            this.moveCallbacks.forEach(callback => callback(this.currentItem))
        }
    }

    createDivWithClass(className) {
        let div = document.createElement('div')
        div.setAttribute('class', className)
        return div
    }

    get slidesToScroll () {
        return this.isMobile ? 1 : this.options.slidesToScroll
    }

    get slidesVisible () {
        return this.isMobile ? 1 : this.options.slidesVisible
    }

}


const getData = async (url, params) => {
    try {
        return await axios.get(url, {
            params: params
        });
    } catch (error) {
        console.log(error.response.data);
    }
}

async function bestMovie() {
    let params = {sort_by: "-imdb_score"}
    let movie = (await getData(url, params)).data.results[0];
    document.getElementsByClassName('best-movie__cover')[0]
        .style.backgroundImage = `url("${movie.image_url}")`;
    document.getElementById("best-movie-title")
        .innerHTML = movie.title;
    document.getElementById("best-movie-description")
        .innerHTML = (await getData(movie.url)).data.description;
    document.getElementsByClassName("btn")[1]
        .setAttribute("onclick", `openModal("${movie.id}")`); // template literals
}

async function modalData(id) {
    let movieData = (await getData(url + id)).data;
    document.getElementById("title")
        .innerHTML = movieData.title;
    document.getElementById("year")
        .innerHTML = " (" + movieData.year + ")";
    document.getElementById("image-url")
        .src = movieData.image_url;
    document.getElementById("duration")
        .innerHTML = movieData.duration + " min";
    document.getElementById("countries")
        .innerHTML = movieData.countries.join(", ");
    document.getElementById("genres")
        .innerHTML = movieData.genres.join(", ");
    document.getElementById("rated")
        .innerHTML = movieData.rated;
    document.getElementById("imdb-score")
        .innerHTML = "IMDb score : " + movieData.imdb_score;
    document.getElementById("directors")
        .innerHTML = "Directed by : " + movieData.directors.join(", ");
    document.getElementById("actors")
        .innerHTML = "Casting : " + movieData.actors.join(", ");
    if (movieData.worldwide_gross_income == null) {
        document.getElementById("box-office")
            .innerHTML = "Box office : " + "N/A";
    } else {
        document.getElementById("box-office")
            .innerHTML = "Box office : " + movieData.worldwide_gross_income;
    }
    document.getElementById("plot")
        .innerHTML = movieData.long_description;
}

function openModal(id) {
    let modal = document.getElementById("myModal");
    let span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    modalData(id);

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

async function moviesByCategory(category, numberOfItems) {
    let page = 1;
    let movies = [];
    let bestMovie = (await getData(url, {sort_by: "-imdb_score"})).data.results[0];
    while (movies.length < numberOfItems) {
        let params = {sort_by: "-imdb_score", genre: category, page: page};
        let moviesOnPage = (await getData(url, params)).data.results;
        if (moviesOnPage[0].title === bestMovie.title) {
            moviesOnPage.shift();
        }
        movies = movies.concat(moviesOnPage.slice(0, numberOfItems - movies.length));
        page++;
    }
    return movies;
}

async function addMovie(element, category, numberOfItems) {
    let movies = await(moviesByCategory(category, numberOfItems));
    let carousel = document.getElementById(element);
    carousel.parentNode.getElementsByClassName('title')[0].innerHTML = category ? 'Best ' + category : 'Best movies';
    for (let i=0; i<movies.length; i++) {
        let image = carousel.getElementsByTagName("img")[i]
        image.src = movies[i].image_url;
        image.setAttribute('onclick', `openModal("${movies[i].id}")`);
        carousel.getElementsByClassName("item__title")[i].innerHTML = movies[i].title
    }
}

async function main () {
    await bestMovie();
    await addMovie('carousel1', '', 7);
    await addMovie('carousel2', 'drama', 7);
    await addMovie('carousel3', 'comedy', 7);
    await addMovie('carousel4', 'sci-fi', 7);
}

main();
document.addEventListener('DOMContentLoaded', function () {
    new Carousel(document.querySelector('#carousel1'), {
        slidesToScroll: 2,
        slidesVisible: 4,
        loop: false
    });
    new Carousel(document.querySelector('#carousel2'), {
        slidesToScroll: 2,
        slidesVisible: 4,
        loop: false
    });
    new Carousel(document.querySelector('#carousel3'), {
        slidesToScroll: 2,
        slidesVisible: 4,
        loop: false
    });
    new Carousel(document.querySelector('#carousel4'), {
        slidesToScroll: 2,
        slidesVisible: 4,
        loop: false
    });
})