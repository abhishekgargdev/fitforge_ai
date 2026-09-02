'use client';

import React, { useState } from 'react';
import { X, Dumbbell, Upload, Plus, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { LoadingButton } from '../common/LoadingButton';
import { Exercise } from '@/types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newExercise: Exercise) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [bodyParts, setBodyParts] = useState<string[]>(['chest']);
  const [equipments, setEquipments] = useState<string[]>(['barbell']);
  const [targetMuscles, setTargetMuscles] = useState<string[]>(['pectorals']);
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [exerciseType, setExerciseType] = useState<'Strength' | 'Hypertrophy' | 'Cardio' | 'Mobility'>('Strength');
  const [instructions, setInstructions] = useState<string[]>(['Position body with proper form.', 'Perform movement with control.']);
  const [instructionText, setInstructionText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploading(true);
    setError('');

    try {
      // 1. Fetch Cloudinary signature from server
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'fitforge_community_exercises' }),
      });
      const signJson = await signRes.json();

      if (signJson.data?.configured && signJson.data?.uploadUrl) {
        // 2. Direct signed upload to Cloudinary
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('api_key', signJson.data.apiKey);
        formData.append('timestamp', String(signJson.data.timestamp));
        formData.append('signature', signJson.data.signature);
        formData.append('folder', signJson.data.folder);

        const uploadRes = await fetch(signJson.data.uploadUrl, {
          method: 'POST',
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.secure_url) {
          setMediaUrl(uploadJson.secure_url);
        } else {
          throw new Error('Cloudinary upload failed to return URL');
        }
      } else {
        // Fallback for dev / unconfigured Cloudinary: create local object URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setMediaUrl(previewUrl);
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback triggered:', err);
      // Fallback local preview
      const previewUrl = URL.createObjectURL(selectedFile);
      setMediaUrl(previewUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleAddInstruction = () => {
    if (!instructionText.trim()) return;
    setInstructions([...instructions, instructionText.trim()]);
    setInstructionText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Exercise name is required');
    if (!mediaUrl.trim()) return setError('Media GIF or Image URL is required');

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bodyParts,
          equipments,
          targetMuscles,
          secondaryMuscles,
          difficulty,
          exerciseType,
          gifUrl: mediaUrl.trim(),
          instructions,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to create exercise');
      }

      onSuccess(json.data.item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exercise');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        id="modal-add-exercise"
        className="w-full max-w-xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 text-[#F5F7F2] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#252B30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5DA9FF]/15 text-[#5DA9FF] flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add Community Exercise</h3>
              <p className="text-xs text-[#9AA3A0]">Share custom exercise in community library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA3A0] hover:text-white hover:bg-[#181D22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 text-[#F05D5E] text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Cable Chest Fly"
              className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl py-2.5 px-3 text-xs font-semibold text-white outline-none"
            />
          </div>

          {/* Body Parts */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
              Primary Body Part (Select)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'cardio'].map((bp) => (
                <button
                  key={bp}
                  type="button"
                  onClick={() => setBodyParts([bp])}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    bodyParts.includes(bp)
                      ? 'bg-[#B8F34A] text-[#0B0D0F]'
                      : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                  }`}
                >
                  {bp}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
              Equipment
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['barbell', 'dumbbell', 'cable', 'leverage machine', 'body weight', 'band', 'kettlebell'].map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => setEquipments([eq])}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    equipments.includes(eq)
                      ? 'bg-[#5DA9FF] text-[#0B0D0F]'
                      : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Target Muscle */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
              Target Muscle
            </label>
            <input
              type="text"
              value={targetMuscles.join(', ')}
              onChange={(e) => setTargetMuscles(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="e.g. pectorals, upper chest"
              className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl py-2 px-3 text-xs font-semibold text-white outline-none"
            />
          </div>

          {/* Media File / GIF Upload */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
              Exercise GIF or Video Media *
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cloudinary-exercise-upload"
                />
                <label
                  htmlFor="cloudinary-exercise-upload"
                  className="px-4 py-2 rounded-xl bg-[#181D22] border border-[#252B30] hover:border-[#5DA9FF] text-xs font-bold text-[#5DA9FF] cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading to Cloudinary...' : 'Upload Media (Cloudinary)'}
                </label>
                <span className="text-xs text-[#9AA3A0]">or enter URL below</span>
              </div>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-... or Cloudinary URL"
                className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>
            {mediaUrl && (
              <div className="mt-2 p-2 bg-[#0B0D0F] rounded-xl border border-[#252B30] flex items-center gap-3">
                <img src={mediaUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-[11px] text-[#45D483] font-bold">Media preview ready!</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
              Step-by-Step Instructions
            </label>
            <ul className="space-y-1 mb-2 text-xs">
              {instructions.map((ins, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#181D22] border border-[#252B30]">
                  <span>Step {idx + 1}: {ins}</span>
                  <button
                    type="button"
                    onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))}
                    className="text-[#F05D5E] font-bold text-xs"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                placeholder="Add step instruction..."
                className="flex-1 bg-[#181D22] border border-[#252B30] rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-3 py-2 rounded-xl bg-[#252B30] hover:bg-[#323940] text-xs font-bold text-white"
              >
                Add Step
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3 border-t border-[#252B30]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#5DA9FF] text-[#0B0D0F] font-bold text-xs hover:bg-[#72B4FF] transition-all shadow-[0_0_12px_rgba(93,169,255,0.3)]"
            >
              Create Community Exercise
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};
