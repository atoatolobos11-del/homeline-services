const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Component = 'button',
  type,
  ...props
}) => {
  const baseStyles = 'font-medium transition-all duration-300 rounded-full inline-flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-primary/10'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const elementProps =
    Component === 'button'
      ? { type: type || 'button' }
      : {};

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...elementProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
