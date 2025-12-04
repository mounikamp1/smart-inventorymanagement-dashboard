type HeaderProps = {
  name: string;
};

const Header = ({ name }: HeaderProps) => {
  return (
    <div className="mb-10 px-5 sm:px-7 pt-8">
      <div className="relative">
        {/* Premium gradient background layers */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/15 via-purple-500/10 to-indigo-600/15 dark:from-blue-500/8 dark:via-purple-400/5 dark:to-indigo-500/8 rounded-3xl blur-3xl -z-10 opacity-80"></div>
        <div className="absolute inset-0 bg-linear-to-b from-white/40 to-transparent dark:from-slate-900/40 dark:to-transparent rounded-3xl -z-10"></div>

        <div className="relative z-10">
          {/* Main title with letter-spacing for premium feel */}
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {name}
          </h1>

          {/* Subtitle section with enhanced styling */}
          <div className="flex items-center gap-3 mb-2">
            {/* Accent line with gradient */}
            <div className="h-1.5 w-16 bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
              Inventory Management
            </p>
          </div>

          {/* Descriptive text */}
          <p className="text-gray-500 dark:text-gray-500 text-sm font-light mt-2">
            Monitor, organize, and optimize your product inventory in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
