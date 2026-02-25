document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector("nav");

  burger.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
});

 document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelectorAll(".gallery img");
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".close");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    let currentIndex = 0;

    // Открытие модалки
    gallery.forEach((img, index) => {
      img.addEventListener("click", () => {
        currentIndex = index;
        openModal();
      });
    });

    function openModal() {
      modal.style.display = "block";
      modal.classList.add("show");
      setTimeout(() => {
        modalImg.src = gallery[currentIndex].src;
      }, 50);
    }

    // Закрытие модалки
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      setTimeout(() => modal.style.display = "none", 300);
    });

    // Навигация
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
      changeImage();
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % gallery.length;
      changeImage();
    });

    function changeImage() {
      modalImg.style.opacity = 0;
      setTimeout(() => {
        modalImg.src = gallery[currentIndex].src;
        modalImg.style.opacity = 1;
      }, 200);
    }

    // Закрытие по клику вне изображения
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        setTimeout(() => modal.style.display = "none", 300);
      }
    });

    // Управление с клавиатуры
    document.addEventListener("keydown", (e) => {
      if (modal.style.display === "block") {
        if (e.key === "ArrowLeft") {
          prevBtn.click();
        } else if (e.key === "ArrowRight") {
          nextBtn.click();
        } else if (e.key === "Escape") {
          closeBtn.click();
        }
      }
    });
  });