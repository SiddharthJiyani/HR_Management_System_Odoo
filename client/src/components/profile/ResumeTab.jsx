import React, { useState } from 'react';
import { Card, Button, Badge } from '../ui';

const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ResumeTab = ({ resumes = [], onUpload, onDelete }) => {
  const [dragActive, setDragActive] = useState(false);

  // Mock resume data
  const [resumeList, setResumeList] = useState(resumes.length > 0 ? resumes : [
    { id: 1, name: 'Resume_2024.pdf', size: '245 KB', uploadedAt: 'Jan 2, 2026' },
    { id: 2, name: 'Cover_Letter.pdf', size: '128 KB', uploadedAt: 'Dec 15, 2025' },
  ]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    setResumeList(prev => [...newFiles, ...prev]);
    onUpload?.(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = (id) => {
    setResumeList(prev => prev.filter(r => r.id !== id));
    onDelete?.(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload Area */}
      <Card 
        className={`
          border-2 border-dashed transition-all duration-200
          ${dragActive 
            ? 'border-primary-400 bg-primary-50/50' 
            : 'border-neutral-300 hover:border-primary-300'
          }
        `}
        padding="lg"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            ${dragActive ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-400'}
            transition-colors
          `}>
            <UploadIcon />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-1">
            {dragActive ? 'Drop files here' : 'Upload Resume / Documents'}
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <label>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" as="span" className="cursor-pointer">
              Browse Files
            </Button>
          </label>
          <p className="text-xs text-neutral-400 mt-3">
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </Card>

      {/* Uploaded Files */}
      {resumeList.length > 0 && (
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-4">Uploaded Documents</h3>
          <div className="space-y-3">
            {resumeList.map((file) => (
              <div 
                key={file.id}
                className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <FileIcon />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 truncate">{file.name}</p>
                  <p className="text-sm text-neutral-500">
                    {file.size} • Uploaded {file.uploadedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <DownloadIcon />
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResumeTab;

