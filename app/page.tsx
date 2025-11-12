import Image from "next/image";

export default function Home() {
  return (
    <div>
      <section className="title-section">
        <h2 className="hero glitch layers" data-text="NIECK <BR> BUIJS"><span>NIECK <br/> BUIJS</span></h2>
        <img src="images/tech-profile-pic-yellow-bg.png" alt="Nieck Buijs" className="nieck-image" />
      </section>
    </div>
  );
}
