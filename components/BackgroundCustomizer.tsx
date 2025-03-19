// components/BackgroundCustomizer.tsx
import React, { useState, useRef } from 'react';
import { useTheme, BackgroundType, BackgroundPattern, BackgroundAnimation, BackgroundBlend, BackgroundMedia } from '@/contexts/ThemeContext';
import { Layers, Image, Video, FileText, Grid, CloudRain, Cpu, Upload, Trash, Sliders, Check, X } from 'lucide-react';

/**
 * Background Customizer Component
 *
 * Allows users to customize the app background with options for:
 * - Background type (color, gradient, pattern, image, video, GIF)
 * - Custom patterns
 * - Animation settings
 * - Media upload (images, GIFs, videos)
 */
const BackgroundCustomizer: React.FC = () => {
    const {
        currentTheme,
        updateBackgroundSetting,
        setBackgroundMedia
    } = useTheme();

    const [activeTab, setActiveTab] = useState<'type' | 'pattern' | 'animation' | 'media'>('type');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { background } = currentTheme;

    // Background type options
    const backgroundTypes: { value: BackgroundType; label: string; icon: React.ReactNode }[] = [
        { value: 'color', label: 'Solid Color', icon: <Layers size={16} /> },
        { value: 'gradient', label: 'Gradient', icon: <Layers size={16} /> },
        { value: 'pattern', label: 'Pattern', icon: <Grid size={16} /> },
        { value: 'image', label: 'Image', icon: <Image size={16} /> },
        { value: 'video', label: 'Video', icon: <Video size={16} /> },
        { value: 'gif', label: 'GIF', icon: <FileText size={16} /> },
    ];

    // Pattern options
    const patternOptions: { value: BackgroundPattern; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'dots', label: 'Dots' },
        { value: 'grid', label: 'Grid' },
        { value: 'lines', label: 'Lines' },
        { value: 'waves', label: 'Waves' },
        { value: 'circuit', label: 'Circuit' },
        { value: 'noise', label: 'Noise' },
        { value: 'bubbles', label: 'Bubbles' },
        { value: 'hexagons', label: 'Hexagons' },
        { value: 'geometric', label: 'Geometric' },
    ];

    // Animation options
    const animationOptions: { value: BackgroundAnimation; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'slow', label: 'Slow Drift' },
        { value: 'normal', label: 'Normal Drift' },
        { value: 'fast', label: 'Fast Drift' },
        { value: 'pulse', label: 'Pulse' },
        { value: 'shift', label: 'Shift' },
        { value: 'parallax', label: 'Parallax' },
    ];

    // Blend mode options
    const blendOptions: { value: BackgroundBlend; label: string }[] = [
        { value: 'normal', label: 'Normal' },
        { value: 'overlay', label: 'Overlay' },
        { value: 'screen', label: 'Screen' },
        { value: 'multiply', label: 'Multiply' },
        { value: 'darken', label: 'Darken' },
        { value: 'lighten', label: 'Lighten' },
    ];

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file type to determine media type
        const fileType = file.type.split('/')[0];
        const isGif = file.type === 'image/gif';

        let mediaType: 'image' | 'video' | 'gif' = 'image';
        if (fileType === 'video') mediaType = 'video';
        if (isGif) mediaType = 'gif';

        // Create a URL for the file
        const url = URL.createObjectURL(file);

        // Create media object
        const media: BackgroundMedia = {
            type: mediaType,
            url,
            opacity: 100,
            blur: 0,
            scale: 100
        };

        // Update context
        setBackgroundMedia(media);

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Automatically switch to the media tab
        setActiveTab('media');
    };

    // Handle removing media
    const handleRemoveMedia = () => {
        setBackgroundMedia(undefined);
    };

    // Helper function to create a type-safe media updater
    const updateMedia = (updates: Partial<BackgroundMedia>) => {
        if (!background.media) return;

        const updatedMedia: BackgroundMedia = {
            ...background.media,
            ...updates
        };

        setBackgroundMedia(updatedMedia);
    };

    return (
        <div className="bg-customizer">
            <div className="bg-customizer-tabs">
                <button
                    className={`tab ${activeTab === 'type' ? 'active' : ''}`}
                    onClick={() => setActiveTab('type')}
                >
                    <Layers size={16} />
                    <span>Type</span>
                </button>
                <button
                    className={`tab ${activeTab === 'pattern' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pattern')}
                >
                    <Grid size={16} />
                    <span>Pattern</span>
                </button>
                <button
                    className={`tab ${activeTab === 'animation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('animation')}
                >
                    <CloudRain size={16} />
                    <span>Animation</span>
                </button>
                <button
                    className={`tab ${activeTab === 'media' ? 'active' : ''}`}
                    onClick={() => setActiveTab('media')}
                >
                    <Image size={16} />
                    <span>Media</span>
                </button>
            </div>

            <div className="bg-customizer-content">
                {activeTab === 'type' && (
                    <div className="bg-type-options">
                        <h3>Background Type</h3>
                        <div className="options-grid">
                            {backgroundTypes.map(type => (
                                <button
                                    key={type.value}
                                    className={`option-btn ${background.type === type.value ? 'active' : ''}`}
                                    onClick={() => updateBackgroundSetting('type', type.value)}
                                >
                                    {type.icon}
                                    <span>{type.label}</span>
                                    {background.type === type.value && (
                                        <Check size={12} className="check-icon" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="option-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={background.useAccentColors}
                                    onChange={(e) => updateBackgroundSetting('useAccentColors', e.target.checked)}
                                />
                                <span>Use accent colors</span>
                            </label>
                        </div>

                        {!background.useAccentColors && (
                            <>
                                <div className="option-row">
                                    <label>
                                        <span>Primary Color</span>
                                        <input
                                            type="color"
                                            value={background.color1}
                                            onChange={(e) => updateBackgroundSetting('color1', e.target.value)}
                                        />
                                    </label>
                                </div>

                                {background.type === 'gradient' && (
                                    <div className="option-row">
                                        <label>
                                            <span>Secondary Color</span>
                                            <input
                                                type="color"
                                                value={background.color2}
                                                onChange={(e) => updateBackgroundSetting('color2', e.target.value)}
                                            />
                                        </label>
                                    </div>
                                )}
                            </>
                        )}

                        {/* File upload button for media backgrounds */}
                        {(background.type === 'image' || background.type === 'video' || background.type === 'gif') && (
                            <div className="upload-area">
                                <button
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={20} />
                                    <span>Upload {background.type}</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={
                                        background.type === 'image' ? 'image/*' :
                                            background.type === 'video' ? 'video/*' :
                                                'image/gif'
                                    }
                                    onChange={handleFileUpload}
                                    hidden
                                />
                                <p className="upload-help">
                                    {background.type === 'image' ? 'JPG, PNG, WebP (max 5MB)' :
                                        background.type === 'video' ? 'MP4, WebM (max 10MB)' :
                                            'GIF animations (max 5MB)'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pattern' && (
                    <div className="bg-pattern-options">
                        <h3>Pattern Style</h3>
                        <div className="options-grid">
                            {patternOptions.map(pattern => (
                                <button
                                    key={pattern.value}
                                    className={`option-btn ${background.pattern === pattern.value ? 'active' : ''}`}
                                    onClick={() => updateBackgroundSetting('pattern', pattern.value)}
                                >
                                    <div className={`pattern-preview pattern-${pattern.value}`}></div>
                                    <span>{pattern.label}</span>
                                    {background.pattern === pattern.value && (
                                        <Check size={12} className="check-icon" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {background.pattern !== 'none' && (
                            <>
                                <div className="option-row">
                                    <label>
                                        <span>Pattern Color</span>
                                        <input
                                            type="color"
                                            value={background.patternColor}
                                            onChange={(e) => updateBackgroundSetting('patternColor', e.target.value)}
                                            disabled={background.useAccentColors}
                                        />
                                    </label>
                                </div>

                                <div className="option-row">
                                    <label>
                                        <span>Opacity: {background.patternOpacity}%</span>
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            step="5"
                                            value={background.patternOpacity}
                                            onChange={(e) => updateBackgroundSetting('patternOpacity', parseInt(e.target.value))}
                                        />
                                    </label>
                                </div>

                                <div className="option-row">
                                    <label>
                                        <span>Scale: {background.patternScale}%</span>
                                        <input
                                            type="range"
                                            min="50"
                                            max="200"
                                            step="10"
                                            value={background.patternScale}
                                            onChange={(e) => updateBackgroundSetting('patternScale', parseInt(e.target.value))}
                                        />
                                    </label>
                                </div>

                                <div className="option-row">
                                    <label>
                                        <span>Blend Mode</span>
                                        <select
                                            value={background.blendMode}
                                            onChange={(e) => updateBackgroundSetting('blendMode', e.target.value as BackgroundBlend)}
                                        >
                                            {blendOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'animation' && (
                    <div className="bg-animation-options">
                        <h3>Animation Style</h3>
                        <div className="options-grid">
                            {animationOptions.map(animation => (
                                <button
                                    key={animation.value}
                                    className={`option-btn ${background.animation === animation.value ? 'active' : ''}`}
                                    onClick={() => updateBackgroundSetting('animation', animation.value)}
                                >
                                    <div className={`animation-preview anim-${animation.value}`}></div>
                                    <span>{animation.label}</span>
                                    {background.animation === animation.value && (
                                        <Check size={12} className="check-icon" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {background.animation !== 'none' && (
                            <div className="option-row">
                                <label>
                                    <span>Animation Speed: {background.animationSpeed}/10</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={background.animationSpeed}
                                        onChange={(e) => updateBackgroundSetting('animationSpeed', parseInt(e.target.value))}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="bg-media-options">
                        <h3>Media Settings</h3>

                        {background.media ? (
                            <div className="media-preview">
                                <div className="media-preview-container">
                                    {background.media.type === 'video' ? (
                                        <video
                                            src={background.media.url}
                                            autoPlay
                                            loop
                                            muted
                                            style={{
                                                opacity: background.media.opacity / 100,
                                                filter: `blur(${background.media.blur}px)`,
                                                transform: `scale(${background.media.scale / 100})`
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="img-preview"
                                            style={{
                                                backgroundImage: `url(${background.media.url})`,
                                                opacity: background.media.opacity / 100,
                                                filter: `blur(${background.media.blur}px)`,
                                                transform: `scale(${background.media.scale / 100})`
                                            }}
                                        ></div>
                                    )}
                                </div>

                                <div className="media-controls">
                                    <div className="option-row">
                                        <label>
                                            <span>Opacity: {background.media.opacity}%</span>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                step="5"
                                                value={background.media.opacity}
                                                onChange={(e) => updateMedia({ opacity: parseInt(e.target.value) })}
                                            />
                                        </label>
                                    </div>

                                    <div className="option-row">
                                        <label>
                                            <span>Blur: {background.media.blur}px</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="1"
                                                value={background.media.blur}
                                                onChange={(e) => updateMedia({ blur: parseInt(e.target.value) })}
                                            />
                                        </label>
                                    </div>

                                    <div className="option-row">
                                        <label>
                                            <span>Scale: {background.media.scale}%</span>
                                            <input
                                                type="range"
                                                min="100"
                                                max="150"
                                                step="5"
                                                value={background.media.scale}
                                                onChange={(e) => updateMedia({ scale: parseInt(e.target.value) })}
                                            />
                                        </label>
                                    </div>

                                    <button
                                        className="remove-media-btn"
                                        onClick={handleRemoveMedia}
                                    >
                                        <Trash size={16} />
                                        <span>Remove Media</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="upload-area">
                                <p>No media uploaded yet.</p>
                                <button
                                    className="upload-btn"
                                    onClick={() => {
                                        updateBackgroundSetting('type', 'image');
                                        setActiveTab('type');
                                    }}
                                >
                                    <Upload size={20} />
                                    <span>Choose Media Type</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        .bg-customizer {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          overflow: hidden;
          width: 100%;
          max-width: 480px;
          transition: all 0.3s var(--easing-standard);
          box-shadow: var(--shadow);
        }

        .bg-customizer-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-bg);
        }

        .tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
        }

        .tab span {
          font-size: 12px;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }

        .tab.active {
          color: var(--accent-primary);
          background: var(--active-bg);
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 25%;
          width: 50%;
          height: 2px;
          background-color: var(--accent-primary);
          border-radius: 1px;
        }

        .bg-customizer-content {
          padding: 16px;
          max-height: 60vh;
          overflow-y: auto;
        }

        h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .option-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 8px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
        }

        .option-btn span {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .option-btn:hover {
          background: var(--hover-bg);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .option-btn.active {
          background: var(--active-bg);
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 1px var(--accent-primary);
        }

        .option-btn.active span {
          color: var(--accent-primary);
          font-weight: 500;
        }

        .check-icon {
          position: absolute;
          top: 6px;
          right: 6px;
          color: var(--accent-primary);
        }

        .option-row {
          margin-bottom: 16px;
        }

        .option-row label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        input[type="range"] {
          width: 100%;
          height: 6px;
          background: var(--hover-bg);
          border-radius: 3px;
          -webkit-appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
        }

        input[type="color"] {
          width: 100%;
          height: 32px;
          padding: 2px;
          border: 1px solid var(--border-divider);
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          cursor: pointer;
        }

        select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border-divider);
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--text-primary);
          cursor: pointer;
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 16px;
          background: var(--hover-bg);
          border: 2px dashed var(--border-divider);
          border-radius: var(--border-radius);
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .upload-btn:hover {
          background: var(--hover-bg);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .upload-help {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
        }

        .pattern-preview {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          border: 1px solid var(--border-divider);
          position: relative;
          overflow: hidden;
        }

        .pattern-dots::before,
        .pattern-grid::before,
        .pattern-lines::before,
        .pattern-waves::before,
        .pattern-circuit::before,
        .pattern-noise::before,
        .pattern-bubbles::before,
        .pattern-hexagons::before,
        .pattern-geometric::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.7;
          background-color: var(--accent-primary);
          mask-size: 10px 10px;
          -webkit-mask-size: 10px 10px;
        }

        .pattern-dots::before {
          mask-image: radial-gradient(circle, black 1px, transparent 1px);
          -webkit-mask-image: radial-gradient(circle, black 1px, transparent 1px);
        }

        .pattern-grid::before {
          mask-image:
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px);
          -webkit-mask-image:
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px);
        }

        .animation-preview {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius);
          background: var(--accent-primary);
          position: relative;
          overflow: hidden;
        }

        .anim-slow::before,
        .anim-normal::before,
        .anim-fast::before,
        .anim-pulse::before,
        .anim-shift::before,
        .anim-parallax::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 45%, white 50%, transparent 55%);
          background-size: 200% 200%;
        }

        .anim-slow::before {
          animation: preview-drift 3s linear infinite;
        }

        .anim-normal::before {
          animation: preview-drift 2s linear infinite;
        }

        .anim-fast::before {
          animation: preview-drift 1s linear infinite;
        }

        .anim-pulse::before {
          animation: preview-pulse 2s ease-in-out infinite alternate;
        }

        .anim-shift::before {
          animation: preview-shift 2s ease-in-out infinite alternate;
        }

        .anim-parallax::before {
          animation: preview-parallax 2s ease-in-out infinite alternate;
        }

        @keyframes preview-drift {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 200%;
          }
        }

        @keyframes preview-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes preview-shift {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 100%;
          }
        }

        @keyframes preview-parallax {
          0% {
            transform: translateX(-5px) translateY(-5px);
          }
          100% {
            transform: translateX(5px) translateY(5px);
          }
        }

        .media-preview {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .media-preview-container {
          width: 100%;
          height: 150px;
          border-radius: var(--border-radius);
          overflow: hidden;
          position: relative;
        }

        .media-preview-container video,
        .img-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s var(--easing-standard);
        }

        .img-preview {
          background-size: cover;
          background-position: center;
        }

        .media-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .remove-media-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          margin-top: 8px;
          background: rgba(var(--accent-red-rgb), 0.1);
          border: 1px solid rgba(var(--accent-red-rgb), 0.2);
          border-radius: var(--border-radius);
          color: var(--accent-red);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .remove-media-btn:hover {
          background: rgba(var(--accent-red-rgb), 0.2);
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          .options-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .bg-customizer {
            max-width: 100%;
          }
        }
      `}</style>
        </div>
    );
};

export default BackgroundCustomizer;
