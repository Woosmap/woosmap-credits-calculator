import {html, render} from 'lit-html';

(function () {
    let creditsComputed = 0;
    let state;

    let localitiesServicesCard;
    let webServicesCard;
    let dataServicesCard;
    let mapDisplayCard;

    // List of input items for the Map Display section
    const plansLabels = {
        community: "You remain to the free <strong>Community</strong> plan",
        standard: "You'll need a <strong>Standard</strong> plan",
        enterprise: "You'll need an <strong>Enterprise</strong> plan",
    };
    const mapServices = {
        title: "<p>Enter the <strong>daily</strong> number of map views (when your Store Locator is loaded)</p>",
        mapLoads: {
            title: 'Map Load (Widget / Store Locator JS API)',
            parameter: 'map_load',
            quantity: 0,
            credits: 1
        }
    };
    // List of input items for the Webservices section
    const webServices = {
        title: "<p>Enter the <strong>daily</strong> number of of calls to each of the following Web Services.</p>",
        search: {
            title: 'Woosmap Search API',
            parameter: 'ws_search',
            quantity: 0,
            credits: 0.1
        },
        geolocation: {
            title: 'Woosmap Geolocation API',
            parameter: 'ws_geolocation',
            quantity: 0,
            credits: 0.4
        },
        distance: {
            title: 'Woosmap Distance API',
            parameter: 'ws_distance',
            quantity: 0,
            credits: 0.5
        }
    };
    // List of input items for the localities section
    const localitiesServices = {
        title: "<p>Enter the <strong>daily</strong> number of calls to each of Localities services (when a user hit a character on autocomplete).</p>",
        localities: {
            title: 'Localities Search',
            parameter: 'localities_search',
            quantity: 0,
            credits: 0.4
        }
    };
    // List of input items for Data management section
    const dataServices = {
        title: "<p>Enter the <strong>daily</strong> number of create, edite or update of your stores data.</p>",
        data: {
            title: 'Data Management',
            parameter: 'data_management',
            quantity: 0,
            credits: 2
        }
    };

    const animateValue = (id, start, end, duration) => {
        const minTimer = 50;
        const obj = document.getElementById(id);
        const range = end - start;
        const startTime = new Date().getTime();
        const endTime = startTime + duration;
        let stepTime = Math.abs(Math.floor(duration / range));
        stepTime = Math.max(stepTime, minTimer);
        let timer;

        const run = () => {
            const now = new Date().getTime();
            let remaining = Math.max((endTime - now) / duration, 0);
            const value = Math.round(end - (remaining * range));
            obj.innerHTML = value.toLocaleString(
                'en-US'
            );
            if (value === end) {
                clearInterval(timer);
            }
        };

        timer = setInterval(run, stepTime);
        run();
    };

    const setCreditsValue = () => {
        const allCredits = document.querySelectorAll(".credits");
        let startValue = creditsComputed;
        creditsComputed = 0;

        for (const credits of allCredits.values()) {
            if (!credits.value) {
                credits.value = 0
            }
            creditsComputed += parseInt(credits.value) * parseFloat(credits.dataset.factor);
        }
        creditsComputed *= 365;
        animateValue("credits-total", startValue, Math.round(creditsComputed), 500);
        const planLabel = document.querySelector("#plan-info");
        if (creditsComputed <= 10000) {
            planLabel.innerHTML = plansLabels.community;
        } else if (creditsComputed <= 100000) {
            planLabel.innerHTML = plansLabels.standard;
        } else {
            planLabel.innerHTML = plansLabels.enterprise;
        }
    };

    const creditsChangeListener = {
        handleEvent(e) {
            parseInt(e.target.value) === 0 ? state.remove(e.target.dataset.param) : state.set(e.target.dataset.param, e.target.value);
            setCreditsValue();
        },
        capture: true,
    };

    const fieldTemplate = (data) => html`
        <div class="row"><div class="label">${data.title}</div>
        <div class="numeric-field"><input @keyup=${creditsChangeListener} @click=${creditsChangeListener} type="number" data-factor="${data.credits}" .value="${data.quantity}" data-param="${data.parameter}" class="credits" name="quantity" min="0" step="100" pattern="\\d{3}\,?\\d{3}\,?\\d{3}"></div>
        <div class="credits-factor">x <strong>${data.credits}</strong> woosmap credits</div></div>`;

    const getUrlParams = () => {
        state = require('querystate')(window.location.search);
        mapServices.mapLoads.quantity = state.get('map_load') || 0;
        webServices.distance.quantity = state.get('ws_distance') || 0;
        webServices.geolocation.quantity = state.get('ws_geolocation') || 0;
        webServices.search.quantity = state.get('ws_search') || 0;
        localitiesServices.localities.quantity = state.get('localities_search') || 0;
        dataServices.data.quantity = state.get('data_management') || 0;

    };

    const setCardsElement = () => {
        mapDisplayCard = document.querySelector('#map-display .card-content');
        webServicesCard = document.querySelector('#web-services .card-content');
        localitiesServicesCard = document.querySelector('#localities .card-content');
        dataServicesCard = document.querySelector('#data-management .card-content');
    };

    const renderFields = () => {
        render(fieldTemplate(mapServices.mapLoads), mapDisplayCard);
        render([fieldTemplate(webServices.search), fieldTemplate(webServices.distance), fieldTemplate(webServices.geolocation)], webServicesCard);
        render(fieldTemplate(localitiesServices.localities), localitiesServicesCard);
        render(fieldTemplate(dataServices.data), dataServicesCard);
    };

    const renderTitles = () => {
        mapDisplayCard.insertAdjacentHTML("afterbegin", mapServices.title);
        webServicesCard.insertAdjacentHTML("afterbegin", webServices.title);
        localitiesServicesCard.insertAdjacentHTML("afterbegin", localitiesServices.title);
        dataServicesCard.insertAdjacentHTML("afterbegin", dataServices.title);
    };

    const init = () => {
        getUrlParams();
        setCardsElement();
        renderFields();
        renderTitles();
        setCreditsValue();
    };

    window.onpopstate = () => {
        getUrlParams();
        setCardsElement();
        renderFields();
        setCreditsValue();
    };

    document.addEventListener("DOMContentLoaded", function () {
        init();
    });
}());
