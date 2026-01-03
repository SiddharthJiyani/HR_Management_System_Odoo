import React, { useState } from 'react';
import { Card, Button, Input, TextArea } from '../ui';

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ResumeTab = ({ data, onUpdate, isEditable = true }) => {
  const [resumeData, setResumeData] = useState({
    about: data?.about || '',
    skills: data?.skills || [],
    certifications: data?.certifications || [],
    interests: data?.interests || '',
  });

  const [editingSkill, setEditingSkill] = useState(null);
  const [editingCert, setEditingCert] = useState(null);

  const handleUpdateField = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate?.(resumeData);
  };

  // Skills Management
  const handleAddSkill = () => {
    setEditingSkill({ name: '', proficiency: 'Intermediate', yearsOfExperience: 0 });
  };

  const handleSaveSkill = () => {
    if (editingSkill && editingSkill.name.trim()) {
      const newSkills = editingSkill._index !== undefined 
        ? resumeData.skills.map((s, i) => i === editingSkill._index ? editingSkill : s)
        : [...resumeData.skills, editingSkill];
      setResumeData(prev => ({ ...prev, skills: newSkills }));
      onUpdate?.({ ...resumeData, skills: newSkills });
    }
    setEditingSkill(null);
  };

  const handleRemoveSkill = (index) => {
    const newSkills = resumeData.skills.filter((_, i) => i !== index);
    setResumeData(prev => ({ ...prev, skills: newSkills }));
    onUpdate?.({ ...resumeData, skills: newSkills });
  };

  // Certifications Management
  const handleAddCertification = () => {
    setEditingCert({ name: '', issuingOrganization: '', issueDate: '', credentialId: '' });
  };

  const handleSaveCertification = () => {
    if (editingCert && editingCert.name.trim()) {
      const newCerts = editingCert._index !== undefined
        ? resumeData.certifications.map((c, i) => i === editingCert._index ? editingCert : c)
        : [...resumeData.certifications, editingCert];
      setResumeData(prev => ({ ...prev, certifications: newCerts }));
      onUpdate?.({ ...resumeData, certifications: newCerts });
    }
    setEditingCert(null);
  };

  const handleRemoveCertification = (index) => {
    const newCerts = resumeData.certifications.filter((_, i) => i !== index);
    setResumeData(prev => ({ ...prev, certifications: newCerts }));
    onUpdate?.({ ...resumeData, certifications: newCerts });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* About Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">About</h3>
        </div>
        <TextArea
          value={resumeData.about}
          onChange={(e) => handleUpdateField('about', e.target.value)}
          onBlur={handleSave}
          placeholder="Tell us about yourself..."
          rows={4}
          disabled={!isEditable}
        />
      </Card>

      {/* Skills Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Skills</h3>
          {isEditable && (
            <Button size="sm" variant="outline" onClick={handleAddSkill}>
              <PlusIcon /> Add Skill
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {resumeData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-neutral-800">{skill.name}</p>
                <p className="text-sm text-neutral-500">
                  {skill.proficiency} • {skill.yearsOfExperience} years
                </p>
              </div>
              {isEditable && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSkill({ ...skill, _index: index })}
                    className="p-2 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleRemoveSkill(index)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>
          ))}
          {resumeData.skills.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">No skills added yet</p>
          )}
        </div>

        {/* Edit Skill Modal */}
        {editingSkill && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <h3 className="font-semibold text-neutral-900 mb-4">Edit Skill</h3>
              <div className="space-y-4">
                <Input
                  label="Skill Name"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  placeholder="e.g., JavaScript"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Proficiency</label>
                  <select
                    value={editingSkill.proficiency}
                    onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <Input
                  label="Years of Experience"
                  type="number"
                  value={editingSkill.yearsOfExperience}
                  onChange={(e) => setEditingSkill({ ...editingSkill, yearsOfExperience: parseInt(e.target.value) || 0 })}
                />
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveSkill} className="flex-1">Save</Button>
                  <Button variant="outline" onClick={() => setEditingSkill(null)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* Certifications Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Certifications</h3>
          {isEditable && (
            <Button size="sm" variant="outline" onClick={handleAddCertification}>
              <PlusIcon /> Add Certification
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {resumeData.certifications.map((cert, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-neutral-800">{cert.name}</p>
                <p className="text-sm text-neutral-500">
                  {cert.issuingOrganization} {cert.issueDate && `• ${new Date(cert.issueDate).getFullYear()}`}
                </p>
                {cert.credentialId && (
                  <p className="text-xs text-neutral-400 mt-1">ID: {cert.credentialId}</p>
                )}
              </div>
              {isEditable && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCert({ ...cert, _index: index })}
                    className="p-2 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleRemoveCertification(index)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>
          ))}
          {resumeData.certifications.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">No certifications added yet</p>
          )}
        </div>

        {/* Edit Certification Modal */}
        {editingCert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <h3 className="font-semibold text-neutral-900 mb-4">Edit Certification</h3>
              <div className="space-y-4">
                <Input
                  label="Certification Name"
                  value={editingCert.name}
                  onChange={(e) => setEditingCert({ ...editingCert, name: e.target.value })}
                  placeholder="e.g., AWS Solutions Architect"
                />
                <Input
                  label="Issuing Organization"
                  value={editingCert.issuingOrganization}
                  onChange={(e) => setEditingCert({ ...editingCert, issuingOrganization: e.target.value })}
                  placeholder="e.g., Amazon Web Services"
                />
                <Input
                  label="Issue Date"
                  type="date"
                  value={editingCert.issueDate ? new Date(editingCert.issueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                />
                <Input
                  label="Credential ID"
                  value={editingCert.credentialId}
                  onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                  placeholder="Optional"
                />
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveCertification} className="flex-1">Save</Button>
                  <Button variant="outline" onClick={() => setEditingCert(null)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* Interests Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Interests & Hobbies</h3>
        </div>
        <TextArea
          value={resumeData.interests}
          onChange={(e) => handleUpdateField('interests', e.target.value)}
          onBlur={handleSave}
          placeholder="What are your interests and hobbies?"
          rows={3}
          disabled={!isEditable}
        />
      </Card>
    </div>
  );
};

export default ResumeTab;

