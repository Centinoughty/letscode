const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  return (
    <>
      <div className="flex flex-col items-start p-6 bg-white border border-gray-200 rounded-xl transition-all hover:shadow-lg hover:border-transparent">
        <div className="flex items-center justify-center w-12 h-12 mb-4 bg-[#D3E3FD] rounded-full">
          <span className="text-2xl text-[#1E457A]">{icon}</span>
        </div>
        <h3 className="mb-2 text-xl font-medium text-[#1F1F1F]">{title}</h3>
        <p className="text-base text-[#444746]">{description}</p>
      </div>
    </>
  );
};
