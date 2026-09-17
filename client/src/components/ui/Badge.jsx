const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary text-white',
    promotion: 'bg-accent text-white',
    new: 'bg-secondary text-white',
    favorite: 'bg-olive text-white'
  };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
