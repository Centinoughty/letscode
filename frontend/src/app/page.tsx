import { poppins } from "@/styles/fonts";

export default function Home() {
  return (
    <>
      <main>
        <section
          className={`h-[60vh] flex flex-col justify-center items-center ${poppins.className} text-[3vw] font-bold`}
        >
          <h1>LetsCode</h1>
          <h2>Real-time Code Collaboration</h2>
        </section>
      </main>
    </>
  );
}
