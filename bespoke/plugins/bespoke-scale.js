export function scale (config) {
  return function (deck) {
    const parent = deck.parent;
      // slideHeight = config.slideHeight,
      // slideWidth = config.slideWidth;

    const updateScale = () => {
      const firstSlide = deck.slides[0];
      if (!firstSlide) return;

      const { innerWidth, innerHeight } = window;
      // const innerWidth = window.offsetWidth;
      // const innerHeight = window.offsetHeight;
      const { offsetWidth, offsetHeight } = firstSlide;

      // const listScale = 1 / (offsetWidth / innerWidth);
      const fullScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);

      // parent.style.setProperty('--deck-list-scale', listScale);
      parent.style.setProperty('--deck-full-scale', fullScale);
    };

    // function scale(element, ratio) {
    //   element.style.transform = `scale(${ratio})`;
    // }

    // function scaleAll() {
    //   // scale(firstSlide, 1);
    //   console.log("scaleAll", parent.offsetWidth, parent.offsetHeight, slideWidth, slideHeight)
    //   const xScale = parent.offsetWidth / slideWidth;
    //   const yScale = parent.offsetHeight / slideHeight;
    //
    //   console.log(xScale, yScale)
    //
    //   deck.slides.forEach((slide =>{
    //     scale(slide, Math.min(xScale, yScale));
    //   }))
    //
    // }

    window.addEventListener('resize', updateScale);
    updateScale();
  };

};
