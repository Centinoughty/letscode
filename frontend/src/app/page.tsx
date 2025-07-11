import FeatureCard from "@/components/Card/FeatureCard";
import Footer from "@/components/Footer/Footer";
import { roboto } from "@/styles/fonts";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className={`pt-9 w-full bg-white ${roboto.className}`}>
        <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
          <h1 className="text-5xl md:text-6xl font-normal text-[#1F1F1F] tracking-tight">
            Code Together, Instantly
          </h1>
          <h2 className="max-w-2xl mt-4 text-lg text-[#444746]">
            An online code collaborator for students, instructors, and
            interviewers. Share your workspace and build in real-time.
          </h2>
          <div className="mt-8 flex gap-4">
            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center rounded-full bg-[#1A73E8] px-8 text-base font-medium text-white shadow-sm transition-all hover:bg-[#1B66C9] hover:shadow-md"
            >
              Start Coding
            </Link>
          </div>
        </section>

        <section className="py-16 bg-[#F8F9FA] border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-normal text-[#1F1F1F]">
                Built for Every Use Case
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon="🎓"
                title="For Students"
                description="Collaborate with your peer group on projects, assignments, and coding problems. Help friends and learn together in Link shared environment."
              />
              <FeatureCard
                icon="🧑‍🏫"
                title="For Instructors"
                description="Conduct live coding tutorials, demonstrate solutions, and provide real-time assistance to users without screen sharing."
              />
              <FeatureCard
                icon="💼"
                title="For Interviewers"
                description="Evaluate candidates with live coding challenges. Observe problem-solving skills and collaborate on solutions in Link professional setting."
              />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
