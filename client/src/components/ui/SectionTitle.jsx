const SectionTitle = ({ children, className = '', serif = false }) => {
  return (
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${serif ? 'font-serif' : ''} ${className}`}>
      {children}
    </h2>
  );
};

export default SectionTitle;
