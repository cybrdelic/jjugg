/**
 * Bulk Edit Modal Component
 * Allows editing multiple applications at once
 */

import React, { useState } from 'react';
import { Application, ApplicationStage } from '@/types';
import { X, Save, AlertCircle } from 'lucide-react';

interface BulkEditModalProps {
    isOpen: boolean;
    applications: Application[];
    onClose: () => void;
    onSave: (updates: Partial<Application>) => Promise<void>;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
    isOpen,
    applications,
    onClose,
    onSave
}) => {
    const [formData, setFormData] = useState<Partial<Application>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<keyof Application>>(new Set());

    const handleFieldToggle = (field: keyof Application) => {
        const newFields = new Set(fieldsToUpdate);
        if (newFields.has(field)) {
            newFields.delete(field);
            const newFormData = { ...formData };
            delete newFormData[field];
            setFormData(newFormData);
        } else {
            newFields.add(field);
        }
        setFieldsToUpdate(newFields);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatesToApply = Object.fromEntries(
                Object.entries(formData).filter(([key]) => fieldsToUpdate.has(key as keyof Application))
            );
            await onSave(updatesToApply);
            onClose();
        } catch (error) {
            console.error('Bulk edit failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="bulk-edit-overlay">
            <div className="bulk-edit-modal">
                <div className="modal-header">
                    <h2>Bulk Edit Applications</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="applications-info">
                        <AlertCircle size={16} />
                        <span>Editing {applications.length} application{applications.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className="form-section">
                        <h3>Select fields to update:</h3>

                        {/* Stage Field */}
                        <div className="field-group">
                            <label className="field-checkbox">
                                <input
                                    type="checkbox"
                                    checked={fieldsToUpdate.has('stage')}
                                    onChange={() => handleFieldToggle('stage')}
                                />
                                <span>Stage</span>
                            </label>
                            {fieldsToUpdate.has('stage') && (
                                <select
                                    value={formData.stage || ''}
                                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as ApplicationStage })}
                                >
                                    <option value="">Select stage...</option>
                                    <option value="applied">Applied</option>
                                    <option value="screening">Screening</option>
                                    <option value="interview">Interview</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            )}
                        </div>

                        {/* Location Field */}
                        <div className="field-group">
                            <label className="field-checkbox">
                                <input
                                    type="checkbox"
                                    checked={fieldsToUpdate.has('location')}
                                    onChange={() => handleFieldToggle('location')}
                                />
                                <span>Location</span>
                            </label>
                            {fieldsToUpdate.has('location') && (
                                <input
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Enter location..."
                                />
                            )}
                        </div>

                        {/* Remote Field */}
                        <div className="field-group">
                            <label className="field-checkbox">
                                <input
                                    type="checkbox"
                                    checked={fieldsToUpdate.has('remote')}
                                    onChange={() => handleFieldToggle('remote')}
                                />
                                <span>Remote Work</span>
                            </label>
                            {fieldsToUpdate.has('remote') && (
                                <select
                                    value={formData.remote === undefined ? '' : formData.remote.toString()}
                                    onChange={(e) => setFormData({ ...formData, remote: e.target.value === 'true' })}
                                >
                                    <option value="">Select...</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            )}
                        </div>

                        {/* Notes Field */}
                        <div className="field-group">
                            <label className="field-checkbox">
                                <input
                                    type="checkbox"
                                    checked={fieldsToUpdate.has('notes')}
                                    onChange={() => handleFieldToggle('notes')}
                                />
                                <span>Notes (append)</span>
                            </label>
                            {fieldsToUpdate.has('notes') && (
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Enter additional notes..."
                                    rows={3}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={fieldsToUpdate.size === 0 || isSaving}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : `Update ${applications.length} Application${applications.length > 1 ? 's' : ''}`}
                    </button>
                </div>

                <style jsx>{`
          .bulk-edit-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
          }

          .bulk-edit-modal {
            background: var(--surface);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow: hidden;
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            border-bottom: 1px solid var(--border);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: var(--radius-sm);
            background: transparent;
            color: var(--text-tertiary);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .close-btn:hover {
            background: var(--bg-hover);
            color: var(--text-secondary);
          }

          .modal-content {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
          }

          .applications-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: var(--primary-alpha-10);
            border-radius: var(--radius-md);
            margin-bottom: 20px;
            color: var(--primary);
            font-size: 14px;
            font-weight: 500;
          }

          .form-section h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .field-group {
            margin-bottom: 16px;
            padding: 12px;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            transition: border-color 0.2s ease;
          }

          .field-group:hover {
            border-color: var(--border-focus);
          }

          .field-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            margin-bottom: 8px;
          }

          .field-checkbox input[type="checkbox"] {
            width: 16px;
            height: 16px;
          }

          .field-checkbox span {
            font-weight: 500;
            color: var(--text-primary);
          }

          .field-group input,
          .field-group select,
          .field-group textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            background: var(--background);
            color: var(--text-primary);
            font-size: 14px;
            transition: border-color 0.2s ease;
          }

          .field-group input:focus,
          .field-group select:focus,
          .field-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px var(--primary-alpha-10);
          }

          .modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            padding: 20px;
            border-top: 1px solid var(--border);
            background: var(--surface-subtle);
          }

          .cancel-btn {
            padding: 8px 16px;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            background: var(--background);
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .cancel-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
          }

          .save-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border: none;
            border-radius: var(--radius-md);
            background: var(--primary);
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .save-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .save-btn:not(:disabled):hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
          }
        `}</style>
            </div>
        </div>
    );
};

export default BulkEditModal;
