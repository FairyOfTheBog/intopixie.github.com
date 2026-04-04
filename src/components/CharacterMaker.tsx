import React from 'react';
import { CharacterMakerState, Gender } from '../types';
import { HAIR_STYLES, OUTFITS, TERRARIA_ROLES } from '../constants';
import { sounds } from '../services/soundManager';

interface CharacterMakerProps {
  appearance: CharacterMakerState;
  gender: Gender;
  name: string;
  role: string;
  onUpdateAppearance: (updates: Partial<CharacterMakerState>) => void;
  onUpdateGender: (gender: Gender) => void;
  onUpdateName: (name: string) => void;
  onUpdateRole: (role: string) => void;
  onFinish: () => void;
}

export default function CharacterMaker({ 
  appearance, 
  gender, 
  name,
  role,
  onUpdateAppearance, 
  onUpdateGender,
  onUpdateName,
  onUpdateRole,
  onFinish
}: CharacterMakerProps) {
  const handleUpdateAppearance = (updates: Partial<CharacterMakerState>) => {
    onUpdateAppearance(updates);
    sounds.playSelect();
  };

  const handleUpdateGender = (g: Gender) => {
    onUpdateGender(g);
    sounds.playSelect();
  };

  const handleUpdateRole = (r: string) => {
    onUpdateRole(r);
    sounds.playSelect();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4">
      <div 
        className="pixel-card relative overflow-hidden bg-cover bg-center min-h-[500px] md:min-h-[600px] flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-8 border-4 border-[#5d4037] shadow-2xl"
        style={{ backgroundImage: `url('https://github.com/FairyOfTheBog/myimgsources/blob/main/stardew%20valley%20portrait%20background%20!!.jpg?raw=true')` }}
      >
        {/* Left Side: Preview & Basic Info */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-6">
          <h2 className="font-pixel text-[10px] md:text-xs mb-4 md:mb-8 pixel-text-shadow text-white">Character Preview</h2>
          
          {/* Character Preview with White Background */}
          <div className="relative flex items-center justify-center mb-4 md:mb-8 w-full max-w-[1025px] aspect-square overflow-hidden pixel-border mx-auto shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-white/60" style={{ width: '1025px', height: '1025px', maxWidth: '100%', maxHeight: '100%' }} />
            {/* Base Character */}
            <img 
              src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403202904.png?raw=true" 
              alt="Character Base" 
              className="relative z-10 w-full h-full object-contain pixelated" 
              style={{ width: '1024px', height: '1024px', maxWidth: '100%', maxHeight: '100%' }}
              referrerPolicy="no-referrer"
            />
            {/* Outfit Overlay */}
            {appearance.outfit && (
              <img 
                src={appearance.outfit} 
                alt="Outfit Overlay" 
                className="absolute inset-0 z-20 w-full h-full object-contain pixelated" 
                style={{ width: '1024px', height: '1024px', maxWidth: '100%', maxHeight: '100%' }}
                referrerPolicy="no-referrer"
              />
            )}
            {/* Hair Overlay */}
            {appearance.hair && (
              <img 
                src={appearance.hair} 
                alt="Hair Overlay" 
                className="absolute inset-0 z-30 w-full h-full object-contain pixelated" 
                style={{ width: '1024px', height: '1024px', maxWidth: '100%', maxHeight: '100%' }}
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className="font-pixel text-[10px] block mb-2 text-white">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => onUpdateName(e.target.value)}
                className="w-full bg-[#bdf3ff] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] p-3 text-[16px] outline-none text-[#2c1e1e] font-pixel pixel-border"
                placeholder="Enter name..."
              />
            </div>
            <div>
              <label className="font-pixel text-[10px] block mb-2 text-white">Gender</label>
              <div className="flex gap-2">
                {(['Male', 'Female'] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => handleUpdateGender(g)}
                    className={`flex-1 ${gender === g ? 'pixel-button' : 'pixel-button-secondary'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customization */}
        <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto max-h-[40vh] md:max-h-[70vh] p-2 md:p-6 custom-scrollbar">
          <h2 className="font-pixel text-[10px] md:text-xs mb-2 md:mb-4 pixel-text-shadow text-white">Customization</h2>
          
          {/* Role Selection */}
          <section>
            <label className="font-pixel text-[10px] block mb-2 text-yellow-400">Choose Your Role</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  const currentIndex = TERRARIA_ROLES.indexOf(role);
                  const nextIndex = (currentIndex - 1 + TERRARIA_ROLES.length) % TERRARIA_ROLES.length;
                  handleUpdateRole(TERRARIA_ROLES[nextIndex]);
                }}
                className="pixel-button-secondary w-10 h-10 flex items-center justify-center p-0"
              >
                <img 
                  src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082041.png?raw=true" 
                  alt="Prev" 
                  className="w-6 h-6 pixelated" 
                  referrerPolicy="no-referrer" 
                />
              </button>
              
              <div className="font-pixel text-[10px] text-white bg-black/40 px-4 py-2 pixel-border-inset min-w-[150px] text-center">
                {role}
              </div>

              <button
                onClick={() => {
                  const currentIndex = TERRARIA_ROLES.indexOf(role);
                  const nextIndex = (currentIndex + 1) % TERRARIA_ROLES.length;
                  handleUpdateRole(TERRARIA_ROLES[nextIndex]);
                }}
                className="pixel-button-secondary w-10 h-10 flex items-center justify-center p-0"
              >
                <img 
                  src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082000.png?raw=true" 
                  alt="Next" 
                  className="w-6 h-6 pixelated" 
                  referrerPolicy="no-referrer" 
                />
              </button>
            </div>
          </section>

          {/* Hair Style */}
          <section>
            <label className="font-pixel text-[10px] block mb-2 text-white">Hair Style</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  const currentIndex = HAIR_STYLES.indexOf(appearance.hair);
                  const nextIndex = (currentIndex - 1 + HAIR_STYLES.length) % HAIR_STYLES.length;
                  handleUpdateAppearance({ hair: HAIR_STYLES[nextIndex] });
                }}
                className="pixel-button-secondary w-10 h-10 flex items-center justify-center p-0"
              >
                <img 
                  src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082041.png?raw=true" 
                  alt="Prev" 
                  className="w-6 h-6 pixelated" 
                  referrerPolicy="no-referrer" 
                />
              </button>
              
              <div className="font-pixel text-[10px] text-white bg-black/40 px-4 py-2 pixel-border-inset min-w-[100px] text-center">
                Hair {HAIR_STYLES.indexOf(appearance.hair) + 1}
              </div>

              <button
                onClick={() => {
                  const currentIndex = HAIR_STYLES.indexOf(appearance.hair);
                  const nextIndex = (currentIndex + 1) % HAIR_STYLES.length;
                  handleUpdateAppearance({ hair: HAIR_STYLES[nextIndex] });
                }}
                className="pixel-button-secondary w-10 h-10 flex items-center justify-center p-0"
              >
                <img 
                  src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082000.png?raw=true" 
                  alt="Next" 
                  className="w-6 h-6 pixelated" 
                  referrerPolicy="no-referrer" 
                />
              </button>
            </div>
          </section>

          {/* Outfit */}
          <section>
            <label className="font-pixel text-[10px] block mb-2 text-white">Outfit</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  const currentIndex = OUTFITS.indexOf(appearance.outfit);
                  const nextIndex = (currentIndex - 1 + OUTFITS.length) % OUTFITS.length;
                  handleUpdateAppearance({ outfit: OUTFITS[nextIndex] });
                }}
                className="pixel-button-secondary w-10 h-10 flex items-center justify-center p-0"
              >
                <img 
                  src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082041.png?raw=true" 
                  alt="Prev" 
                  className="w-6 h-6 pixelated" 
                  referrerPolicy="no-referrer" 
                />
              </button>
              
              <div className="font-pixel text-[10px] text-white bg-black/40 px-4 py-2 pixel-border-inset min-w-[100px] text-center">
                Outfit {OUTFITS.indexOf(appearance.outfit) + 1}
              </div>

              <button
                onClick={() => {
                  const currentIndex = OUTFITS.indexOf(appearance.outfit);
                  const nextIndex = (currentIndex + 1) % OUTFITS.length;
                  handleUpdateAppearance({ outfit: OUTFITS[nextIndex] });
                }}
                className="pixel-button-secondary w-10 h-10 flex items-center justify-center p-0"
              >
                <img 
                  src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082000.png?raw=true" 
                  alt="Next" 
                  className="w-6 h-6 pixelated" 
                  referrerPolicy="no-referrer" 
                />
              </button>
            </div>
          </section>

          <button 
            onClick={onFinish}
            disabled={!name.trim()}
            className="pixel-button w-full mt-4 py-2 font-pixel disabled:opacity-50"
          >
            Start Adventure
          </button>
        </div>
      </div>
    </div>
  );
}
