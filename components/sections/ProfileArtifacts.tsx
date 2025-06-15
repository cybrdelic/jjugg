'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User, FileText, Briefcase, Upload, Download, Edit2, Trash2,
  PlusCircle, CheckCircle, Image, File, Link, ExternalLink, Eye,
  Code, Award, Star
} from 'lucide-react';
import CardHeader from '../CardHeader';
import TabButton, { TabGroup } from '../TabButton';

interface Resume {
  id: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  targetRole: string;
  version: number;
  isDefault: boolean;
  fileUrl: string;
}

interface CoverLetter {
  id: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  company?: string;
  position?: string;
  isDefault: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'certificate' | 'publication' | 'other';
  thumbnailUrl: string;
  url?: string;
  technologies?: string[];
  dateCreated: Date;
  featured: boolean;
}

// Mock data for cover letters and portfolio items
const coverLetters: CoverLetter[] = [
  {
    id: 'cl1',
    name: 'General Cover Letter',
    fileName: 'general_cover_letter.pdf',
    uploadDate: new Date(2023, 10, 20),
    isDefault: true
  },
  {
    id: 'cl2',
    name: 'Google Application Cover Letter',
    fileName: 'google_cover_letter.pdf',
    uploadDate: new Date(2023, 11, 5),
    company: 'Google',
    position: 'Senior Frontend Developer',
    isDefault: false
  },
  {
    id: 'cl3',
    name: 'Microsoft Application Cover Letter',
    fileName: 'microsoft_cover_letter.pdf',
    uploadDate: new Date(2023, 11, 12),
    company: 'Microsoft',
    position: 'Software Engineer',
    isDefault: false
  }
];

const portfolioItems: PortfolioItem[] = [
  {
    id: 'port1',
    title: 'E-commerce Platform',
    description: 'A full-stack e-commerce solution with React, Node.js, and MongoDB.',
    type: 'project',
    thumbnailUrl: '/portfolio/ecommerce.jpg',
    url: 'https://github.com/username/ecommerce-project',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Redux'],
    dateCreated: new Date(2023, 8, 10),
    featured: true
  },
  {
    id: 'port2',
    title: 'AWS Certified Solutions Architect',
    description: 'Professional certification from Amazon Web Services',
    type: 'certificate',
    thumbnailUrl: '/portfolio/aws-cert.jpg',
    url: 'https://www.credly.com/badges/example',
    dateCreated: new Date(2023, 6, 15),
    featured: true
  },
  {
    id: 'port3',
    title: 'Task Management App',
    description: 'A React Native mobile application for task management with cloud sync.',
    type: 'project',
    thumbnailUrl: '/portfolio/taskapp.jpg',
    url: 'https://github.com/username/task-manager',
    technologies: ['React Native', 'Firebase', 'TypeScript'],
    dateCreated: new Date(2023, 4, 5),
    featured: false
  },
  {
    id: 'port4',
    title: 'Machine Learning Overview',
    description: 'Published article on Medium about machine learning fundamentals.',
    type: 'publication',
    thumbnailUrl: '/portfolio/article.jpg',
    url: 'https://medium.com/@username/ml-overview',
    dateCreated: new Date(2023, 2, 20),
    featured: false
  }
];

// Helper function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Portal component for rendering modals
interface PortalProps {
  children: React.ReactNode;
}
const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

export default function ProfileArtifacts() {
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters' | 'portfolio'>('resumes');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);

  // Handle file selection for resume upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle resume upload submission
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !resumeName || !targetRole) {
      alert('Please fill all fields');
      return;
    }
    const newResume: Resume = {
      id: Date.now().toString(),
      name: resumeName,
      fileName: selectedFile.name,
      uploadDate: new Date(),
      targetRole,
      version: 1,
      isDefault: resumes.length === 0,
      fileUrl: URL.createObjectURL(selectedFile),
    };
    setResumes(prev => [...prev, newResume]);
    setIsUploadingResume(false);
    setResumeName('');
    setTargetRole('');
    setSelectedFile(null);
  };

  // Handle resume deletion
  const handleDelete = (id: string) => {
    setResumes(prev => {
      const resumeToDelete = prev.find(r => r.id === id);
      if (resumeToDelete) {
        URL.revokeObjectURL(resumeToDelete.fileUrl);
      }
      return prev.filter(r => r.id !== id);
    });
    if (previewResume?.id === id) setPreviewResume(null);
  };

  return (
    <section className="profile-artifacts-section reveal-element">
      <CardHeader
        title="Profile & Artifacts"
        subtitle="Manage your resume, cover letters, and portfolio items"
        accentColor="var(--accent-green)"
        variant="default"
      >
        <button
          className="add-artifact-btn"
          onClick={() => setShowUploadForm(true)}
        >
          <PlusCircle size={18} />
          <span className="btn-text">Upload New</span>
        </button>
      </CardHeader>

      <div className="tabs-container reveal-element">
        <TabGroup
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as 'portfolio' | 'resumes' | 'cover-letters')}
          className="tabs"
        >
          <TabButton
            data-id="resumes"
            label="Resumes"
            icon={FileText}
            accentColor="var(--accent-green)"
          />
          <TabButton
            data-id="cover-letters"
            label="Cover Letters"
            icon={Briefcase}
            accentColor="var(--accent-green)"
          />
          <TabButton
            data-id="portfolio"
            label="Portfolio"
            icon={Image}
            accentColor="var(--accent-green)"
          />
        </TabGroup>
      </div>

      <div className="content-container reveal-element">
        {activeTab === 'resumes' && (
          <div className="resumes-section">
            <div className="artifacts-list">
              {resumes.map(resume => (
                <div key={resume.id} className={`artifact-card ${resume.isDefault ? 'default' : ''}`}>
                  <div className="artifact-icon">
                    <FileText size={24} />
                  </div>

                  <div className="artifact-details">
                    <div className="artifact-header">
                      <h3 className="artifact-title">{resume.name}</h3>
                      {resume.isDefault && (
                        <span className="default-badge">
                          <CheckCircle size={14} />
                          <span>Default</span>
                        </span>
                      )}
                    </div>

                    <div className="artifact-meta">
                      <span className="meta-item">{resume.fileName}</span>
                      <span className="meta-divider">•</span>
                      <span className="meta-item">v{resume.version}</span>
                      <span className="meta-divider">•</span>
                      <span className="meta-item">{formatDate(resume.uploadDate)}</span>
                    </div>

                    <div className="artifact-target">
                      <span className="target-label">Target Role:</span>
                      <span className="target-value">{resume.targetRole}</span>
                    </div>
                  </div>

                  <div className="artifact-actions">
                    <button
                      className="action-btn preview"
                      title="Preview"
                      onClick={() => setPreviewResume(resume)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn download"
                      title="Download"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = resume.fileUrl;
                        link.download = resume.fileName;
                        link.click();
                      }}
                    >
                      <Download size={16} />
                    </button>
                    <button className="action-btn edit" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    {!resume.isDefault && (
                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                className="add-artifact-card"
                onClick={() => setIsUploadingResume(true)}
              >
                <Upload size={20} />
                <span>Upload Resume</span>
              </button>

              {isUploadingResume && (
                <div className="upload-form">
                  <h3>Upload New Resume</h3>
                  <form onSubmit={handleUpload}>
                    <div className="form-group">
                      <label htmlFor="resumeName">Resume Name</label>
                      <input
                        type="text"
                        id="resumeName"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="targetRole">Target Role</label>
                      <input
                        type="text"
                        id="targetRole"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="resumeFile">Select File</label>
                      <input
                        type="file"
                        id="resumeFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit">Upload</button>
                      <button
                        type="button"
                        onClick={() => setIsUploadingResume(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cover-letters' && (
          <div className="cover-letters-section">
            <div className="artifacts-list">
              {coverLetters.map(letter => (
                <div key={letter.id} className={`artifact-card ${letter.isDefault ? 'default' : ''}`}>
                  <div className="artifact-icon">
                    <FileText size={24} />
                  </div>

                  <div className="artifact-details">
                    <div className="artifact-header">
                      <h3 className="artifact-title">{letter.name}</h3>
                      {letter.isDefault && (
                        <span className="default-badge">
                          <CheckCircle size={14} />
                          <span>Default</span>
                        </span>
                      )}
                    </div>

                    <div className="artifact-meta">
                      <span className="meta-item">{letter.fileName}</span>
                      <span className="meta-divider">•</span>
                      <span className="meta-item">{formatDate(letter.uploadDate)}</span>
                    </div>

                    {(letter.company || letter.position) && (
                      <div className="artifact-target">
                        {letter.company && (
                          <span className="target-value">{letter.company}</span>
                        )}
                        {letter.position && (
                          <>
                            <span className="target-divider">-</span>
                            <span className="target-value">{letter.position}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="artifact-actions">
                    <button className="action-btn preview" title="Preview">
                      <Eye size={16} />
                    </button>
                    <button className="action-btn download" title="Download">
                      <Download size={16} />
                    </button>
                    <button className="action-btn edit" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    {!letter.isDefault && (
                      <button className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button className="add-artifact-card">
                <Upload size={20} />
                <span>Upload Cover Letter</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            <div className="portfolio-grid">
              {portfolioItems.map(item => (
                <div key={item.id} className={`portfolio-card ${item.featured ? 'featured' : ''}`}>
                  <div className="portfolio-thumbnail">
                    <div className="thumbnail-placeholder">
                      {item.type === 'project' && <Code size={24} />}
                      {item.type === 'certificate' && <Award size={24} />}
                      {item.type === 'publication' && <FileText size={24} />}
                      {item.type === 'other' && <File size={24} />}
                    </div>
                    {item.featured && (
                      <div className="featured-badge">
                        <Star size={14} />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="portfolio-content">
                    <h3 className="portfolio-title">{item.title}</h3>
                    <p className="portfolio-description">{item.description}</p>

                    {item.technologies && item.technologies.length > 0 && (
                      <div className="technologies">
                        {item.technologies.map((tech, index) => (
                          <span key={index} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}

                    <div className="portfolio-meta">
                      <span className="type-badge">{item.type}</span>
                      <span className="date">{formatDate(item.dateCreated)}</span>
                    </div>
                  </div>

                  <div className="portfolio-actions">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="view-link">
                        <ExternalLink size={14} />
                        <span>View</span>
                      </a>
                    )}
                    <div className="action-buttons">
                      <button className="action-btn edit" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button className="add-portfolio-card">
                <PlusCircle size={20} />
                <span>Add Portfolio Item</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <Portal>
          <div className="preview-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{previewResume.name}</h3>
                <button
                  className="close-btn"
                  onClick={() => setPreviewResume(null)}
                >
                  <span>×</span>
                </button>
              </div>
              <iframe
                src={previewResume.fileUrl}
                title={previewResume.name}
                className="preview-iframe"
              />
            </div>
          </div>
        </Portal>
      )}

      <style jsx>{`
        .profile-artifacts-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tabs-container {
          position: relative;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border-divider);
          margin-bottom: 24px;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .content-container {
          min-height: 200px;
        }

        .add-artifact-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-green);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(var(--accent-green-rgb), 0.25);
        }

        .add-artifact-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-green-rgb), 0.3);
        }

        /* Resume and Cover Letter Cards */
        .artifacts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .artifact-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          transition: all 0.2s ease;
          position: relative;
        }

        .artifact-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-hover);
        }

        .artifact-card.default {
          border-left: 3px solid var(--accent-green);
        }

        .artifact-icon {
          width: 48px;
          height: 48px;
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .artifact-details {
          flex: 1;
          min-width: 0;
        }

        .artifact-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .artifact-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .default-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .artifact-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }

        .meta-divider {
          font-size: 10px;
          opacity: 0.6;
        }

        .artifact-target {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .target-label {
          margin-right: 6px;
          color: var(--text-tertiary);
        }

        .target-divider {
          margin: 0 6px;
        }

        .artifact-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.preview:hover {
          color: var(--accent-blue);
          border-color: var(--accent-blue);
        }

        .action-btn.download:hover {
          color: var(--accent-green);
          border-color: var(--accent-green);
        }

        .action-btn.edit:hover {
          color: var(--accent-orange);
          border-color: var(--accent-orange);
        }

        .action-btn.delete:hover {
          color: var(--accent-red);
          border-color: var(--accent-red);
        }

        .add-artifact-card {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: var(--border-radius);
          border: 1px dashed var(--border-divider);
          background: var(--hover-bg);
          color: var(--text-secondary);
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
          margin-left: 16px;
        }

        .add-artifact-card:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        /* Upload Form Styles */
        .upload-form {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          padding: 20px;
          margin-top: 20px;
          border: 1px solid var(--border-thin);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-divider);
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .form-actions button {
          padding: 8px 16px;
          border-radius: var(--border-radius);
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .form-actions button[type="submit"] {
          background: var(--accent-green);
          color: white;
        }

        .form-actions button[type="button"] {
          background: var(--hover-bg);
          color: var(--text-secondary);
        }

        /* Portfolio Grid */
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .portfolio-card {
          display: flex;
          flex-direction: column;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: all 0.2s ease;
        }

        .portfolio-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-hover);
        }

        .portfolio-card.featured {
          border-color: var(--accent-yellow);
        }

        .portfolio-thumbnail {
          height: 160px;
          background: var(--hover-bg);
          position: relative;
          overflow: hidden;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--accent-yellow);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: var(--shadow);
        }

        .portfolio-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .portfolio-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .portfolio-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.4;
          flex: 1;
        }

        .technologies {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .tech-tag {
          font-size: 12px;
          padding: 2px 8px;
          background: var(--hover-bg);
          color: var(--text-secondary);
          border-radius: 12px;
        }

        .portfolio-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .type-badge {
          font-size: 12px;
          padding: 2px 8px;
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-radius: 12px;
          text-transform: capitalize;
        }

        .date {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .portfolio-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-top: 1px solid var(--border-divider);
        }

        .view-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-blue);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .view-link:hover {
          text-decoration: underline;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .add-portfolio-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          border-radius: var(--border-radius);
          border: 1px dashed var(--border-divider);
          background: var(--hover-bg);
          color: var(--text-secondary);
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 100%;
          min-height: 200px;
        }

        .add-portfolio-card:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        /* Modal Styles */
        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          padding: 20px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-thin);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }

        .close-btn:hover {
          color: var(--accent-red);
        }

        .preview-iframe {
          width: 100%;
          height: 70vh;
          border: none;
          background: white;
        }

        @media (max-width: 768px) {
          .tabs {
            overflow-x: auto;
            padding-bottom: 4px;
          }

          .tab {
            padding: 10px 16px;
            white-space: nowrap;
          }

          .artifact-card {
            flex-direction: column;
          }

          .artifact-icon {
            align-self: flex-start;
          }

          .artifact-actions {
            align-self: flex-end;
            margin-top: 16px;
          }

          .portfolio-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            padding: 10px;
          }

          .preview-iframe {
            height: 60vh;
          }
        }
      `}</style>
    </section>
  );
}
