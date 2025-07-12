const IntroSection = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-10 sm:gap-12 md:py-44">
      <h1 className="text-center text-3xl font-bold sm:text-5xl">
        What is SoccerSlot?
      </h1>
      <div className="flex min-h-[10vh] w-full flex-col-reverse gap-8 px-5 sm:pr-16 sm:pl-16 md:flex-row md:items-center md:gap-16">
        <div className="sm:basis-[70%]">
          <p className="text-justify text-[calc(0.5vw+1rem)]">
            SoccerSlot is your ultimate platform for managing and enjoying
            soccer games! Whether you're organizing a local match, tracking your
            favorite teams, or exploring new strategies, SoccerSlot brings all
            the excitement of soccer into one seamless experience. Join us and
            kick off your soccer journey today!
          </p>
        </div>
        {/* Image div */}
        <div className="relative isolate flex justify-center">
          <img
            className="z-10 max-w-[75vw] shadow-lg shadow-black/55 sm:max-w-[35vw]"
            src="/images/landing_page/intro_img.jpg"
          />
          <div className="absolute top-[5%] left-[calc(13.5vw-1rem)] min-h-full min-w-[75vw] border-[3.5px] border-black sm:top-[7%] sm:left-[26.5vw] sm:min-h-full sm:min-w-[35vw] md:top-[5%] md:left-[1vw]"></div>
        </div>
      </div>
    </div>
  );
};

export default IntroSection;

/* 


*/
