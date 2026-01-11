import React from 'react';

const ThemeToggle = ({ theme, toggleTheme, className, style }) => {
    return (
        <button
            onClick={toggleTheme}
            className={`btn themeBtn ${className || ''}`}
            style={style}
        >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
    );
};

export default ThemeToggle;
