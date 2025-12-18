import '../styles/components/loader.css';

function Loader({
  size = 'medium',
  text = 'Loading...',
  fullPage = false,
  overlay = false,
  type = 'spinner' // 'spinner', 'dots', 'pulse'
}) {
  const loaderClass = `loader loader--${size} loader--${type} ${fullPage ? 'loader--full-page' : ''} ${overlay ? 'loader--overlay' : ''}`;

  return (
    <div className={loaderClass}>
      <div className="loader__container">
        {type === 'spinner' && <div className="loader__spinner">⏳</div>}
        {type === 'dots' && <div className="loader__dots">...</div>}
        {type === 'pulse' && <div className="loader__pulse">●</div>}
        {text && <p className="loader__text">{text}</p>}
      </div>
    </div>
  );
}

export default Loader;
