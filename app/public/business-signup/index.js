document.addEventListener("DOMContentLoaded", () => {
    const basicInfo = document.querySelector(".basic-info");
    const contactInfo = document.querySelector(".contact-info");
    const accountSetup = document.querySelector(".account-setup");
    let backBtns = document.querySelectorAll(".back-btn");
    const screens = [basicInfo, contactInfo, accountSetup];
    let nextBtns = document.querySelectorAll(".next-btn");
    const progressCircles = document.querySelectorAll(".circle");
    let idx = 0;

    for (const btn of nextBtns) {
        btn.addEventListener("click", () => {
            if (idx > 1) return;
            screens[idx].classList.remove("active");
            progressCircles[idx++].classList.remove("active");
            progressCircles[idx].classList.add("active");
            screens[idx].classList.add("active");
        });
    }

    for (const btn of backBtns) {
        btn.addEventListener("click", () => {
            if (idx < 1) return;
            screens[idx].classList.remove("active");
            progressCircles[idx--].classList.remove("active");
            progressCircles[idx].classList.add("active");
            screens[idx].classList.add("active");
        });
    }
});
